use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Auction, Market, ProtocolConfig};
use crate::errors::FentError;
use crate::{AuctionStatus, BidCurrency};

// ─── Create Auction ───────────────────────────────────────────────────────────

pub fn create_auction(
    ctx: Context<CreateAuction>,
    yt_amount: u64,
    reserve_price: u64,
    duration_secs: u64,
    bid_currency: BidCurrency,
) -> Result<()> {
    require!(yt_amount > 0, FentError::ZeroAmount);
    require!(duration_secs >= 60, FentError::DurationTooShort);
    require!(!ctx.accounts.market.is_mature(), FentError::MarketMatured);

    let now = Clock::get()?.unix_timestamp;
    let auction = &mut ctx.accounts.auction;

    // Transfer YTs from seller → escrow
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_yt_account.to_account_info(),
                to: ctx.accounts.yt_escrow.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        ),
        yt_amount,
    )?;

    auction.market = ctx.accounts.market.key();
    auction.seller = ctx.accounts.seller.key();
    auction.yt_escrow = ctx.accounts.yt_escrow.key();
    auction.bid_escrow = ctx.accounts.bid_escrow.key();
    auction.yt_amount = yt_amount;
    auction.reserve_price = reserve_price;
    auction.highest_bid = 0;
    auction.highest_bidder = Pubkey::default();
    auction.bid_currency = bid_currency;
    auction.start_ts = now;
    auction.end_ts = now.checked_add(duration_secs as i64).ok_or(FentError::Overflow)?;
    auction.status = AuctionStatus::Active;
    auction.nonce = ctx.accounts.seller_auction_nonce.nonce;
    auction.bump = ctx.bumps.auction;

    // Increment seller nonce
    ctx.accounts.seller_auction_nonce.nonce += 1;

    emit!(AuctionCreatedEvent {
        auction: auction.key(),
        market: auction.market,
        seller: auction.seller,
        yt_amount,
        reserve_price,
        end_ts: auction.end_ts,
    });

    Ok(())
}

// ─── Place Bid ────────────────────────────────────────────────────────────────

pub fn place_bid(ctx: Context<PlaceBid>, bid_amount: u64) -> Result<()> {
    let auction = &mut ctx.accounts.auction;

    require!(auction.is_active(), FentError::AuctionNotActive);
    require!(bid_amount > auction.highest_bid, FentError::BidTooLow);
    require!(bid_amount >= auction.reserve_price, FentError::BidBelowReserve);

    // Refund previous highest bidder if exists
    if auction.highest_bid > 0 && auction.highest_bidder != Pubkey::default() {
        // Transfer previous bid back from escrow to previous bidder
        let market_key = auction.market;
        let seeds = &[b"auction", market_key.as_ref(), auction.seller.as_ref(), &auction.nonce.to_le_bytes(), &[auction.bump]];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bid_escrow.to_account_info(),
                    to: ctx.accounts.prev_bidder_account.to_account_info(),
                    authority: auction.to_account_info(),
                },
                signer,
            ),
            auction.highest_bid,
        )?;
    }

    // Transfer new bid from bidder → escrow
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bidder_currency_account.to_account_info(),
                to: ctx.accounts.bid_escrow.to_account_info(),
                authority: ctx.accounts.bidder.to_account_info(),
            },
        ),
        bid_amount,
    )?;

    let prev_bid = auction.highest_bid;
    auction.highest_bid = bid_amount;
    auction.highest_bidder = ctx.accounts.bidder.key();

    emit!(BidPlacedEvent {
        auction: auction.key(),
        bidder: ctx.accounts.bidder.key(),
        bid_amount,
        prev_bid,
        implied_apy_bps: auction.implied_apy_bps(bid_amount),
    });

    Ok(())
}

// ─── Settle Auction ───────────────────────────────────────────────────────────

pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
    let auction = &mut ctx.accounts.auction;

    require!(auction.is_ended(), FentError::AuctionNotEnded);
    require!(auction.status == AuctionStatus::Active, FentError::AuctionAlreadySettled);

    let market_key = auction.market;
    let seeds = &[b"auction", market_key.as_ref(), auction.seller.as_ref(), &auction.nonce.to_le_bytes(), &[auction.bump]];
    let signer = &[&seeds[..]];

    if auction.highest_bid == 0 || auction.highest_bidder == Pubkey::default() {
        // No bids — return YTs to seller
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.yt_escrow.to_account_info(),
                    to: ctx.accounts.seller_yt_account.to_account_info(),
                    authority: auction.to_account_info(),
                },
                signer,
            ),
            auction.yt_amount,
        )?;
    } else {
        // Happy path: winner gets YTs, seller gets bid minus fee
        let config = &ctx.accounts.protocol_config;
        let fee = (auction.highest_bid as u128)
            .checked_mul(config.fee_bps as u128).unwrap()
            .checked_div(10_000).unwrap() as u64;
        let seller_proceeds = auction.highest_bid.checked_sub(fee).ok_or(FentError::Overflow)?;

        // YTs → winner
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.yt_escrow.to_account_info(),
                    to: ctx.accounts.winner_yt_account.to_account_info(),
                    authority: auction.to_account_info(),
                },
                signer,
            ),
            auction.yt_amount,
        )?;

        // Bid proceeds → seller
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.bid_escrow.to_account_info(),
                    to: ctx.accounts.seller_proceeds_account.to_account_info(),
                    authority: auction.to_account_info(),
                },
                signer,
            ),
            seller_proceeds,
        )?;

        // Fee → treasury
        if fee > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.bid_escrow.to_account_info(),
                        to: ctx.accounts.treasury_account.to_account_info(),
                        authority: auction.to_account_info(),
                    },
                    signer,
                ),
                fee,
            )?;
        }
    }

    auction.status = AuctionStatus::Settled;

    emit!(AuctionSettledEvent {
        auction: auction.key(),
        winner: auction.highest_bidder,
        winning_bid: auction.highest_bid,
        yt_amount: auction.yt_amount,
    });

    Ok(())
}

// ─── Cancel Auction ───────────────────────────────────────────────────────────

pub fn cancel_auction(ctx: Context<CancelAuction>) -> Result<()> {
    let auction = &mut ctx.accounts.auction;

    require!(auction.status == AuctionStatus::Active, FentError::AuctionAlreadySettled);
    require!(auction.highest_bid == 0, FentError::CannotCancelWithBids);
    require!(ctx.accounts.seller.key() == auction.seller, FentError::Unauthorized);

    let market_key = auction.market;
    let seeds = &[b"auction", market_key.as_ref(), auction.seller.as_ref(), &auction.nonce.to_le_bytes(), &[auction.bump]];
    let signer = &[&seeds[..]];

    // Return YTs to seller
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.yt_escrow.to_account_info(),
                to: ctx.accounts.seller_yt_account.to_account_info(),
                authority: auction.to_account_info(),
            },
            signer,
        ),
        auction.yt_amount,
    )?;

    auction.status = AuctionStatus::Cancelled;
    Ok(())
}

// ─── Accounts structs (abbreviated — full constraints in production) ──────────

#[derive(Accounts)]
#[instruction(yt_amount: u64, reserve_price: u64, duration_secs: u64)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = seller,
        space = Auction::LEN,
        seeds = [b"auction", market.key().as_ref(), seller.key().as_ref(), &seller_auction_nonce.nonce.to_le_bytes()],
        bump,
    )]
    pub auction: Account<'info, Auction>,
    #[account(init_if_needed, payer = seller, space = 8 + 8, seeds = [b"nonce", seller.key().as_ref()], bump)]
    pub seller_auction_nonce: Account<'info, SellerNonce>,
    #[account(mut)] pub seller_yt_account: Account<'info, TokenAccount>,
    #[account(mut)] pub yt_escrow: Account<'info, TokenAccount>,
    #[account(mut)] pub bid_escrow: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)] pub bidder: Signer<'info>,
    #[account(mut)] pub auction: Account<'info, Auction>,
    #[account(mut)] pub bidder_currency_account: Account<'info, TokenAccount>,
    #[account(mut)] pub bid_escrow: Account<'info, TokenAccount>,
    /// CHECK: validated against auction.highest_bidder
    #[account(mut)] pub prev_bidder_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SettleAuction<'info> {
    #[account(mut)] pub auction: Account<'info, Auction>,
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)] pub yt_escrow: Account<'info, TokenAccount>,
    #[account(mut)] pub bid_escrow: Account<'info, TokenAccount>,
    #[account(mut)] pub winner_yt_account: Account<'info, TokenAccount>,
    #[account(mut)] pub seller_yt_account: Account<'info, TokenAccount>,
    #[account(mut)] pub seller_proceeds_account: Account<'info, TokenAccount>,
    #[account(mut)] pub treasury_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelAuction<'info> {
    pub seller: Signer<'info>,
    #[account(mut)] pub auction: Account<'info, Auction>,
    #[account(mut)] pub yt_escrow: Account<'info, TokenAccount>,
    #[account(mut)] pub seller_yt_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// ─── Helper account ───────────────────────────────────────────────────────────

#[account]
pub struct SellerNonce {
    pub nonce: u64,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct AuctionCreatedEvent {
    pub auction: Pubkey,
    pub market: Pubkey,
    pub seller: Pubkey,
    pub yt_amount: u64,
    pub reserve_price: u64,
    pub end_ts: i64,
}

#[event]
pub struct BidPlacedEvent {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub bid_amount: u64,
    pub prev_bid: u64,
    pub implied_apy_bps: u64,    // this is what agents watch
}

#[event]
pub struct AuctionSettledEvent {
    pub auction: Pubkey,
    pub winner: Pubkey,
    pub winning_bid: u64,
    pub yt_amount: u64,
}