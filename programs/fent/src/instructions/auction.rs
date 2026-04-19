use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use crate::{errors::YieldrError, events::{AuctionCreated, AuctionSettled, BidPlaced, BidWithdrawn},
            state::{ActivityCounter, ActivityRecord, ActivityType, Auction, AuctionStatus, Bid, Market}};

#[derive(Accounts)]
#[instruction(round: u64)]
pub struct CreateAuction<'info> {
    #[account(init, payer = payer, space = Auction::LEN,
        seeds = [b"auction", market.key().as_ref(), &round.to_le_bytes()], bump)]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_auction(ctx: Context<CreateAuction>, round: u64, duration_secs: i64, min_bid_price: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let a = &mut ctx.accounts.auction;
    a.market = ctx.accounts.market.key(); a.round = round;
    a.start_ts = now; a.end_ts = now.checked_add(duration_secs).ok_or(YieldrError::MathOverflow)?;
    a.min_bid_price = min_bid_price; a.clearing_price = 0; a.total_bid_volume = 0;
    a.total_supply = 0; a.total_filled = 0; a.status = AuctionStatus::Open; a.bump = ctx.bumps.auction;
    ctx.accounts.market.current_auction_round = round;
    emit!(AuctionCreated { auction: a.key(), market: a.market, round, start_ts: a.start_ts, end_ts: a.end_ts, min_bid_price });
    Ok(())
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(init, payer = bidder, space = Bid::LEN,
        seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()], bump)]
    pub bid: Account<'info, Bid>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn place_bid(ctx: Context<PlaceBid>, price: u64, quantity: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.auction.status == AuctionStatus::Open, YieldrError::AuctionNotOpen);
    require!(now <= ctx.accounts.auction.end_ts, YieldrError::AuctionNotOpen);
    require!(quantity > 0, YieldrError::ZeroBidQuantity);
    require!(price >= ctx.accounts.auction.min_bid_price, YieldrError::BidPriceTooLow);
    let escrowed = price.checked_mul(quantity).ok_or(YieldrError::MathOverflow)?;
    anchor_lang::system_program::transfer(CpiContext::new(ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer { from: ctx.accounts.bidder.to_account_info(),
                                                to:   ctx.accounts.bid.to_account_info() }), escrowed)?;
    let b = &mut ctx.accounts.bid;
    b.auction = ctx.accounts.auction.key(); b.bidder = ctx.accounts.bidder.key();
    b.price = price; b.quantity = quantity; b.escrowed_lamports = escrowed;
    b.filled_quantity = 0; b.withdrawn = false; b.bump = ctx.bumps.bid;
    ctx.accounts.auction.total_bid_volume = ctx.accounts.auction.total_bid_volume.checked_add(escrowed).ok_or(YieldrError::MathOverflow)?;
    emit!(BidPlaced { auction: ctx.accounts.auction.key(), bidder: ctx.accounts.bidder.key(), price, quantity, escrowed_lamports: escrowed, timestamp: now });
    Ok(())
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    pub settler: Signer<'info>,
}

pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.auction.status == AuctionStatus::Open, YieldrError::AuctionAlreadySettled);
    require!(now > ctx.accounts.auction.end_ts, YieldrError::AuctionNotEnded);
    let clearing_price = ctx.accounts.auction.min_bid_price;
    let days = (ctx.accounts.market.maturity_ts - now).max(1);
    let years_scaled = days as u128 * 1_000_000 / 365;
    let implied_apy_bps = if (clearing_price as u128 * 1_000_000) < 1_000_000_000u128 {
        ((1_000_000_000u128 - clearing_price as u128 * 1_000_000) * 10_000 / years_scaled) as u64
    } else { 0 };
    let a = &mut ctx.accounts.auction;
    a.clearing_price = clearing_price; a.total_filled = 0; a.status = AuctionStatus::Settled;
    emit!(AuctionSettled { auction: a.key(), market: ctx.accounts.market.key(), round: a.round,
        clearing_price, total_filled: 0, total_bid_volume: a.total_bid_volume, implied_apy_bps, timestamp: now });
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"bid", auction.key().as_ref(), bidder.key().as_ref()], bump = bid.bump, has_one = bidder)]
    pub bid: Account<'info, Bid>,
    #[account(mut, seeds = [b"pt_mint", market.key().as_ref()], bump)]
    pub pt_mint: Account<'info, Mint>,
    #[account(mut, token::mint = pt_mint, token::authority = bidder)]
    pub bidder_pt_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"activity_counter", bidder.key().as_ref()], bump = activity_counter.bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = bidder, space = ActivityRecord::LEN,
        seeds = [b"activity", bidder.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.auction.status == AuctionStatus::Settled, YieldrError::AuctionNotSettled);
    require!(!ctx.accounts.bid.withdrawn, YieldrError::BidAlreadyWithdrawn);
    let clearing_price = ctx.accounts.auction.clearing_price;
    let bid = &ctx.accounts.bid;
    let (pt_to_receive, lamports_to_refund) = if bid.price >= clearing_price {
        let cost = clearing_price.checked_mul(bid.quantity).ok_or(YieldrError::MathOverflow)?;
        (bid.quantity, bid.escrowed_lamports.saturating_sub(cost))
    } else { (0u64, bid.escrowed_lamports) };

    let lst_mint = ctx.accounts.market.lst_mint; let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump;
    let seeds: &[&[&[u8]]] = &[&[b"market", lst_mint.as_ref(), &maturity_ts.to_le_bytes(), &[market_bump]]];

    if pt_to_receive > 0 {
        token::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
            MintTo { mint: ctx.accounts.pt_mint.to_account_info(), to: ctx.accounts.bidder_pt_account.to_account_info(),
                     authority: ctx.accounts.market.to_account_info() }, seeds), pt_to_receive)?;
    }
    if lamports_to_refund > 0 {
        **ctx.accounts.bid.to_account_info().try_borrow_mut_lamports()?    -= lamports_to_refund;
        **ctx.accounts.bidder.to_account_info().try_borrow_mut_lamports()? += lamports_to_refund;
    }

    ctx.accounts.bid.filled_quantity = pt_to_receive; ctx.accounts.bid.withdrawn = true;
    let activity_type = if pt_to_receive > 0 { ActivityType::AuctionFill } else { ActivityType::BidRefund };
    let c = &mut ctx.accounts.activity_counter; let r = &mut ctx.accounts.activity_record;
    r.owner = ctx.accounts.bidder.key(); r.index = c.count; r.activity_type = activity_type;
    r.market = ctx.accounts.market.key(); r.amount = pt_to_receive.max(lamports_to_refund);
    r.timestamp = now; r.bump = ctx.bumps.activity_record;
    c.count = c.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(BidWithdrawn { auction: ctx.accounts.auction.key(), bidder: ctx.accounts.bidder.key(),
        pt_received: pt_to_receive, lamports_refunded: lamports_to_refund, timestamp: now });
    Ok(())
}
