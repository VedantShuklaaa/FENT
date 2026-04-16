use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use crate::{
    errors::FentError,
    events::{AuctionCreated, AuctionSettled, BidPlaced, BidWithdrawn},
    state::{ActivityCounter, ActivityRecord, ActivityType, Auction, AuctionStatus, Bid, Market},
};

// ─── create_auction ─────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(round: u64)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = payer,
        space = Auction::LEN,
        seeds = [b"auction", market.key().as_ref(), &round.to_le_bytes()],
        bump,
    )]
    pub auction: Account<'info, Auction>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_auction(
    ctx: Context<CreateAuction>,
    round: u64,
    duration_secs: i64,
    min_bid_price: u64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    let auction              = &mut ctx.accounts.auction;
    auction.market           = ctx.accounts.market.key();
    auction.round            = round;
    auction.start_ts         = now;
    auction.end_ts           = now.checked_add(duration_secs).ok_or(FentError::MathOverflow)?;
    auction.min_bid_price    = min_bid_price;
    auction.clearing_price   = 0;
    auction.total_bid_volume = 0;
    auction.total_supply     = 0;
    auction.total_filled     = 0;
    auction.status           = AuctionStatus::Open;
    auction.bump             = ctx.bumps.auction;

    ctx.accounts.market.current_auction_round = round;

    emit!(AuctionCreated {
        auction:       auction.key(),
        market:        auction.market,
        round,
        start_ts:      auction.start_ts,
        end_ts:        auction.end_ts,
        min_bid_price,
    });

    msg!("Auction round {} created", round);
    Ok(())
}

// ─── place_bid ──────────────────────────────────────────────────

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    // Status + timing checked in handler
    #[account(mut)]
    pub auction: Account<'info, Auction>,

    #[account(
        init,
        payer = bidder,
        space = Bid::LEN,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()],
        bump,
    )]
    pub bid: Account<'info, Bid>,

    #[account(mut)]
    pub bidder: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn place_bid(ctx: Context<PlaceBid>, price: u64, quantity: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    // ── Status and timing checks in handler ──────────────────────
    require!(
        ctx.accounts.auction.status == AuctionStatus::Open,
        FentError::AuctionNotOpen
    );
    require!(now <= ctx.accounts.auction.end_ts, FentError::AuctionNotOpen);
    require!(quantity > 0, FentError::ZeroBidQuantity);
    require!(
        price >= ctx.accounts.auction.min_bid_price,
        FentError::BidPriceTooLow
    );

    let escrowed = price.checked_mul(quantity).ok_or(FentError::MathOverflow)?;

    // ── Transfer SOL bidder → bid PDA via CPI ────────────────────
    anchor_lang::system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.bidder.to_account_info(),
                to:   ctx.accounts.bid.to_account_info(),
            },
        ),
        escrowed,
    )?;

    let bid                 = &mut ctx.accounts.bid;
    bid.auction             = ctx.accounts.auction.key();
    bid.bidder              = ctx.accounts.bidder.key();
    bid.price               = price;
    bid.quantity            = quantity;
    bid.escrowed_lamports   = escrowed;
    bid.filled_quantity     = 0;
    bid.withdrawn           = false;
    bid.bump                = ctx.bumps.bid;

    let auction              = &mut ctx.accounts.auction;
    auction.total_bid_volume = auction.total_bid_volume.checked_add(escrowed).ok_or(FentError::MathOverflow)?;

    emit!(BidPlaced {
        auction:           auction.key(),
        bidder:            ctx.accounts.bidder.key(),
        price,
        quantity,
        escrowed_lamports: escrowed,
        timestamp:         now,
    });

    msg!("Bid: {} PT @ {} lamports/PT. Escrowed: {}", quantity, price, escrowed);
    Ok(())
}

// ─── settle_auction ─────────────────────────────────────────────

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    // Status + timing checked in handler
    #[account(mut)]
    pub auction: Account<'info, Auction>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    pub settler: Signer<'info>,
}

pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    require!(
        ctx.accounts.auction.status == AuctionStatus::Open,
        FentError::AuctionAlreadySettled
    );
    require!(now > ctx.accounts.auction.end_ts, FentError::AuctionNotEnded);

    let clearing_price = ctx.accounts.auction.min_bid_price;
    let total_filled   = 0u64;

    // Compute implied APY from clearing price and time to maturity
    let days_to_maturity      = (ctx.accounts.market.maturity_ts - now).max(1);
    let years_scaled          = days_to_maturity as u128 * 1_000_000 / 365;
    let clearing_scaled       = clearing_price as u128 * 1_000_000;
    let par_scaled            = 1_000_000_000u128;
    let implied_apy_bps: u64  = if clearing_scaled < par_scaled {
        ((par_scaled - clearing_scaled) * 10_000 / years_scaled) as u64
    } else { 0 };

    let auction              = &mut ctx.accounts.auction;
    auction.clearing_price   = clearing_price;
    auction.total_filled     = total_filled;
    auction.status           = AuctionStatus::Settled;

    emit!(AuctionSettled {
        auction:         auction.key(),
        market:          ctx.accounts.market.key(),
        round:           auction.round,
        clearing_price,
        total_filled,
        total_bid_volume: auction.total_bid_volume,
        implied_apy_bps,
        timestamp:       now,
    });

    msg!("Auction {} settled. Clearing: {}", auction.round, clearing_price);
    Ok(())
}

// ─── withdraw_bid ────────────────────────────────────────────────

#[derive(Accounts)]
pub struct WithdrawBid<'info> {
    // Settlement check in handler
    #[account(mut)]
    pub auction: Account<'info, Auction>,

    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()],
        bump = bid.bump,
        has_one = bidder,
    )]
    pub bid: Account<'info, Bid>,

    #[account(
        mut,
        seeds = [b"pt_mint", market.key().as_ref()],
        bump,
    )]
    pub pt_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint      = pt_mint,
        token::authority = bidder,
    )]
    pub bidder_pt_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"activity_counter", bidder.key().as_ref()],
        bump = activity_counter.bump,
    )]
    pub activity_counter: Account<'info, ActivityCounter>,

    #[account(
        init,
        payer = bidder,
        space = ActivityRecord::LEN,
        seeds = [
            b"activity",
            bidder.key().as_ref(),
            &activity_counter.count.to_le_bytes(),
        ],
        bump,
    )]
    pub activity_record: Account<'info, ActivityRecord>,

    #[account(mut)]
    pub bidder: Signer<'info>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    // ── Guards in handler ────────────────────────────────────────
    require!(
        ctx.accounts.auction.status == AuctionStatus::Settled,
        FentError::AuctionNotSettled
    );
    require!(!ctx.accounts.bid.withdrawn, FentError::BidAlreadyWithdrawn);

    let clearing_price = ctx.accounts.auction.clearing_price;
    let bid            = &ctx.accounts.bid;

    let (pt_to_receive, lamports_to_refund): (u64, u64) =
        if bid.price >= clearing_price {
            let cost   = clearing_price.checked_mul(bid.quantity).ok_or(FentError::MathOverflow)?;
            let refund = bid.escrowed_lamports.saturating_sub(cost);
            (bid.quantity, refund)
        } else {
            (0, bid.escrowed_lamports)
        };

    let market      = &ctx.accounts.market;
    let lst_mint    = market.lst_mint;
    let maturity_ts = market.maturity_ts;
    let market_bump = market.bump;

    let seeds: &[&[&[u8]]] = &[&[
        b"market",
        lst_mint.as_ref(),
        &maturity_ts.to_le_bytes(),
        &[market_bump],
    ]];

    // ── Mint PT to filled bidder ─────────────────────────────────
    if pt_to_receive > 0 {
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint:      ctx.accounts.pt_mint.to_account_info(),
                    to:        ctx.accounts.bidder_pt_account.to_account_info(),
                    authority: ctx.accounts.market.to_account_info(),
                },
                seeds,
            ),
            pt_to_receive,
        )?;
    }

    // ── Refund excess SOL ────────────────────────────────────────
    if lamports_to_refund > 0 {
        let bid_info    = ctx.accounts.bid.to_account_info();
        let bidder_info = ctx.accounts.bidder.to_account_info();
        **bid_info.try_borrow_mut_lamports()?    -= lamports_to_refund;
        **bidder_info.try_borrow_mut_lamports()? += lamports_to_refund;
    }

    let bid              = &mut ctx.accounts.bid;
    bid.filled_quantity  = pt_to_receive;
    bid.withdrawn        = true;

    let activity_type    = if pt_to_receive > 0 { ActivityType::AuctionFill } else { ActivityType::BidRefund };
    let counter          = &mut ctx.accounts.activity_counter;
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.bidder.key();
    record.index         = counter.count;
    record.activity_type = activity_type;
    record.market        = ctx.accounts.market.key();
    record.amount        = pt_to_receive.max(lamports_to_refund);
    record.timestamp     = now;
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(FentError::MathOverflow)?;

    emit!(BidWithdrawn {
        auction:           ctx.accounts.auction.key(),
        bidder:            ctx.accounts.bidder.key(),
        pt_received:       pt_to_receive,
        lamports_refunded: lamports_to_refund,
        timestamp:         now,
    });

    msg!("Withdrawn. PT: {} | SOL refund: {}", pt_to_receive, lamports_to_refund);
    Ok(())
}