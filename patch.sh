#!/usr/bin/env bash
# patch.sh
#
# Run this from your FENT project root:
#   cd ~/FENT
#   bash patch.sh
#
# It writes every fixed file directly into programs/fent/src/
# to resolve the Anchor 0.31 build errors.

set -euo pipefail
SRC="programs/fent/src"

echo "==> Patching $SRC ..."

# ── lib.rs ──────────────────────────────────────────────────────
cat > "$SRC/lib.rs" << 'RUST'
use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

// Explicit imports only — NO glob.
// Anchor 0.31 generates __client_accounts_* structs inside each module.
// A glob re-export pulls those in and causes "unresolved import" on #[program].
use instructions::admin::{InitializeProtocol, RegisterLst};
use instructions::market::InitializeMarket;
use instructions::deposit::Deposit;
use instructions::split::SplitPosition;
use instructions::redeem::{ClaimYield, RedeemPt};
use instructions::auction::{CreateAuction, PlaceBid, SettleAuction, WithdrawBid};

declare_id!("YieLDrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod fent {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, fee_bps: u16) -> Result<()> {
        instructions::admin::initialize_protocol(ctx, fee_bps)
    }
    pub fn register_lst(ctx: Context<RegisterLst>, symbol: String, name: String) -> Result<()> {
        instructions::admin::register_lst(ctx, symbol, name)
    }
    pub fn initialize_market(ctx: Context<InitializeMarket>, maturity_ts: i64) -> Result<()> {
        instructions::market::initialize_market(ctx, maturity_ts)
    }
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, amount)
    }
    pub fn split_position(ctx: Context<SplitPosition>, amount: u64) -> Result<()> {
        instructions::split::split_position(ctx, amount)
    }
    pub fn redeem_pt(ctx: Context<RedeemPt>, amount: u64) -> Result<()> {
        instructions::redeem::redeem_pt(ctx, amount)
    }
    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        instructions::redeem::claim_yield(ctx)
    }
    pub fn create_auction(ctx: Context<CreateAuction>, round: u64, duration_secs: i64, min_bid_price: u64) -> Result<()> {
        instructions::auction::create_auction(ctx, round, duration_secs, min_bid_price)
    }
    pub fn place_bid(ctx: Context<PlaceBid>, price: u64, quantity: u64) -> Result<()> {
        instructions::auction::place_bid(ctx, price, quantity)
    }
    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        instructions::auction::settle_auction(ctx)
    }
    pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
        instructions::auction::withdraw_bid(ctx)
    }
}
RUST

# ── instructions/mod.rs ──────────────────────────────────────────
cat > "$SRC/instructions/mod.rs" << 'RUST'
// No pub use wildcard re-exports here — that causes __client_accounts_* collisions.
pub mod admin;
pub mod auction;
pub mod deposit;
pub mod market;
pub mod redeem;
pub mod split;
RUST

# ── instructions/admin.rs ────────────────────────────────────────
cat > "$SRC/instructions/admin.rs" << 'RUST'
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::{errors::YieldrError, events::{LstRegistered, ProtocolInitialized}, state::{LstInfo, ProtocolConfig}};

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(init, payer = admin, space = ProtocolConfig::LEN, seeds = [b"protocol_config"], bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_protocol(ctx: Context<InitializeProtocol>, fee_bps: u16) -> Result<()> {
    let cfg = &mut ctx.accounts.protocol_config;
    cfg.admin        = ctx.accounts.admin.key();
    cfg.fee_bps      = fee_bps;
    cfg.total_tvl    = 0;
    cfg.market_count = 0;
    cfg.bump         = ctx.bumps.protocol_config;
    emit!(ProtocolInitialized { admin: cfg.admin, fee_bps, timestamp: Clock::get()?.unix_timestamp });
    Ok(())
}

#[derive(Accounts)]
pub struct RegisterLst<'info> {
    #[account(init, payer = admin, space = LstInfo::LEN, seeds = [b"lst_info", lst_mint.key().as_ref()], bump)]
    pub lst_info: Account<'info, LstInfo>,
    pub lst_mint: Account<'info, Mint>,
    #[account(seeds = [b"protocol_config"], bump = protocol_config.bump, has_one = admin @ YieldrError::Unauthorized)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn register_lst(ctx: Context<RegisterLst>, symbol: String, name: String) -> Result<()> {
    require!(symbol.len() <= 16, YieldrError::LstAlreadyRegistered);
    require!(name.len()   <= 64, YieldrError::LstAlreadyRegistered);
    let i          = &mut ctx.accounts.lst_info;
    i.mint          = ctx.accounts.lst_mint.key();
    i.symbol        = symbol.clone();
    i.name          = name;
    i.is_active     = true;
    i.registered_at = Clock::get()?.unix_timestamp;
    i.bump          = ctx.bumps.lst_info;
    emit!(LstRegistered { mint: i.mint, symbol, timestamp: i.registered_at });
    Ok(())
}
RUST

# ── instructions/market.rs ───────────────────────────────────────
cat > "$SRC/instructions/market.rs" << 'RUST'
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
use crate::{errors::YieldrError, events::MarketCreated, state::{LstInfo, Market, ProtocolConfig}};

#[derive(Accounts)]
#[instruction(maturity_ts: i64)]
pub struct InitializeMarket<'info> {
    #[account(init, payer = payer, space = Market::LEN,
        seeds = [b"market", lst_mint.key().as_ref(), &maturity_ts.to_le_bytes()], bump)]
    pub market: Account<'info, Market>,
    #[account(init, payer = payer, mint::decimals = lst_mint.decimals, mint::authority = market,
        seeds = [b"pt_mint", market.key().as_ref()], bump)]
    pub pt_mint: Account<'info, Mint>,
    #[account(init, payer = payer, mint::decimals = lst_mint.decimals, mint::authority = market,
        seeds = [b"yt_mint", market.key().as_ref()], bump)]
    pub yt_mint: Account<'info, Mint>,
    #[account(init, payer = payer, token::mint = lst_mint, token::authority = market,
        seeds = [b"vault", market.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,
    #[account(seeds = [b"lst_info", lst_mint.key().as_ref()], bump = lst_info.bump,
        constraint = lst_info.is_active @ YieldrError::LstNotRegistered)]
    pub lst_info: Account<'info, LstInfo>,
    pub lst_mint: Account<'info, Mint>,
    #[account(mut, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program:            Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program:           Program<'info, System>,
    pub rent:                     Sysvar<'info, Rent>,
}

pub fn initialize_market(ctx: Context<InitializeMarket>, maturity_ts: i64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(maturity_ts > now, YieldrError::MaturityInPast);
    let m = &mut ctx.accounts.market;
    m.lst_mint              = ctx.accounts.lst_mint.key();
    m.maturity_ts           = maturity_ts;
    m.pt_mint               = ctx.accounts.pt_mint.key();
    m.yt_mint               = ctx.accounts.yt_mint.key();
    m.vault                 = ctx.accounts.vault.key();
    m.total_deposited       = 0;
    m.total_pt_minted       = 0;
    m.total_yt_minted       = 0;
    m.yield_index           = 1_000_000_000;
    m.yield_updated_at      = now;
    m.current_auction_round = 0;
    m.is_settled            = false;
    m.bump                  = ctx.bumps.market;
    ctx.accounts.protocol_config.market_count =
        ctx.accounts.protocol_config.market_count.checked_add(1).ok_or(YieldrError::MathOverflow)?;
    emit!(MarketCreated { market: m.key(), lst_mint: m.lst_mint, pt_mint: m.pt_mint, yt_mint: m.yt_mint, maturity_ts, timestamp: now });
    Ok(())
}
RUST

# ── instructions/deposit.rs ──────────────────────────────────────
cat > "$SRC/instructions/deposit.rs" << 'RUST'
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::{errors::YieldrError, events::Deposited, state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position, ProtocolConfig}};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, constraint = !market.is_settled @ YieldrError::MarketMatured)]
    pub market: Account<'info, Market>,
    #[account(init_if_needed, payer = user, space = Position::LEN,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()], bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump,
        token::mint = market.lst_mint, token::authority = market)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = market.lst_mint, token::authority = user)]
    pub user_lst_account: Account<'info, TokenAccount>,
    pub lst_mint: Account<'info, Mint>,
    #[account(init_if_needed, payer = user, space = ActivityCounter::LEN,
        seeds = [b"activity_counter", user.key().as_ref()], bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = user, space = ActivityRecord::LEN,
        seeds = [b"activity", user.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, YieldrError::ZeroAmount);
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.market.maturity_ts > now, YieldrError::MarketMatured);

    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(),
        Transfer { from: ctx.accounts.user_lst_account.to_account_info(),
                   to:   ctx.accounts.vault.to_account_info(),
                   authority: ctx.accounts.user.to_account_info() }), amount)?;

    let market = &mut ctx.accounts.market;
    market.total_deposited = market.total_deposited.checked_add(amount).ok_or(YieldrError::MathOverflow)?;

    let position = &mut ctx.accounts.position;
    if position.opened_at == 0 {
        position.owner                     = ctx.accounts.user.key();
        position.market                    = market.key();
        position.yield_index_at_last_claim = market.yield_index;
        position.opened_at                 = now;
        position.bump                      = ctx.bumps.position;
    }
    position.deposited_amount = position.deposited_amount.checked_add(amount).ok_or(YieldrError::MathOverflow)?;
    position.last_activity_at = now;

    ctx.accounts.protocol_config.total_tvl =
        ctx.accounts.protocol_config.total_tvl.checked_add(amount).ok_or(YieldrError::MathOverflow)?;

    let counter = &mut ctx.accounts.activity_counter;
    if counter.count == 0 { counter.owner = ctx.accounts.user.key(); counter.bump = ctx.bumps.activity_counter; }
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.user.key();
    record.index         = counter.count;
    record.activity_type = ActivityType::Deposit;
    record.market        = market.key();
    record.amount        = amount;
    record.timestamp     = now;
    record.tx_sig        = [0u8; 64];
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(Deposited { user: ctx.accounts.user.key(), market: market.key(), lst_mint: market.lst_mint, amount, timestamp: now });
    Ok(())
}
RUST

# ── instructions/split.rs ────────────────────────────────────────
cat > "$SRC/instructions/split.rs" << 'RUST'
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, MintTo, Token, TokenAccount}};
use crate::{errors::YieldrError, events::PositionSplit, state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position}};

#[derive(Accounts)]
pub struct SplitPosition<'info> {
    #[account(mut, constraint = !market.is_settled @ YieldrError::MarketMatured)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", user.key().as_ref(), market.key().as_ref()], bump = position.bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"pt_mint", market.key().as_ref()], bump, mint::authority = market)]
    pub pt_mint: Account<'info, Mint>,
    #[account(mut, seeds = [b"yt_mint", market.key().as_ref()], bump, mint::authority = market)]
    pub yt_mint: Account<'info, Mint>,
    #[account(init_if_needed, payer = user, associated_token::mint = pt_mint, associated_token::authority = user)]
    pub user_pt_account: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = user, associated_token::mint = yt_mint, associated_token::authority = user)]
    pub user_yt_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"activity_counter", user.key().as_ref()], bump = activity_counter.bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = user, space = ActivityRecord::LEN,
        seeds = [b"activity", user.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program:            Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program:           Program<'info, System>,
    pub rent:                     Sysvar<'info, Rent>,
}

pub fn split_position(ctx: Context<SplitPosition>, amount: u64) -> Result<()> {
    require!(amount > 0, YieldrError::ZeroAmount);
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.position.owner == ctx.accounts.user.key(), YieldrError::Unauthorized);
    require!(ctx.accounts.market.maturity_ts > now, YieldrError::MarketMatured);
    require!(ctx.accounts.position.deposited_amount >= amount, YieldrError::InsufficientDeposit);

    let market_key  = ctx.accounts.market.key();
    let lst_mint    = ctx.accounts.market.lst_mint;
    let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump;
    let seeds: &[&[&[u8]]] = &[&[b"market", lst_mint.as_ref(), &maturity_ts.to_le_bytes(), &[market_bump]]];

    token::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
        MintTo { mint: ctx.accounts.pt_mint.to_account_info(), to: ctx.accounts.user_pt_account.to_account_info(),
                 authority: ctx.accounts.market.to_account_info() }, seeds), amount)?;
    token::mint_to(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
        MintTo { mint: ctx.accounts.yt_mint.to_account_info(), to: ctx.accounts.user_yt_account.to_account_info(),
                 authority: ctx.accounts.market.to_account_info() }, seeds), amount)?;

    let p = &mut ctx.accounts.position;
    p.deposited_amount = p.deposited_amount.checked_sub(amount).ok_or(YieldrError::MathOverflow)?;
    p.pt_amount        = p.pt_amount.checked_add(amount).ok_or(YieldrError::MathOverflow)?;
    p.yt_amount        = p.yt_amount.checked_add(amount).ok_or(YieldrError::MathOverflow)?;
    p.last_activity_at = now;
    let m = &mut ctx.accounts.market;
    m.total_pt_minted  = m.total_pt_minted.checked_add(amount).ok_or(YieldrError::MathOverflow)?;
    m.total_yt_minted  = m.total_yt_minted.checked_add(amount).ok_or(YieldrError::MathOverflow)?;

    let c = &mut ctx.accounts.activity_counter;
    let r = &mut ctx.accounts.activity_record;
    r.owner = ctx.accounts.user.key(); r.index = c.count; r.activity_type = ActivityType::Split;
    r.market = market_key; r.amount = amount; r.timestamp = now; r.bump = ctx.bumps.activity_record;
    c.count = c.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(PositionSplit { user: ctx.accounts.user.key(), market: market_key, amount, timestamp: now });
    Ok(())
}
RUST

# ── instructions/redeem.rs ───────────────────────────────────────
cat > "$SRC/instructions/redeem.rs" << 'RUST'
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};
use crate::{errors::YieldrError, events::{PtRedeemed, YieldClaimed}, state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position}};

#[derive(Accounts)]
pub struct RedeemPt<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", user.key().as_ref(), market.key().as_ref()], bump = position.bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"pt_mint", market.key().as_ref()], bump)]
    pub pt_mint: Account<'info, Mint>,
    #[account(mut, token::mint = pt_mint, token::authority = user)]
    pub user_pt_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump, token::authority = market)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = market.lst_mint, token::authority = user)]
    pub user_lst_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"activity_counter", user.key().as_ref()], bump = activity_counter.bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = user, space = ActivityRecord::LEN,
        seeds = [b"activity", user.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn redeem_pt(ctx: Context<RedeemPt>, amount: u64) -> Result<()> {
    require!(amount > 0, YieldrError::ZeroAmount);
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.market.maturity_ts <= now, YieldrError::NotMaturedYet);
    require!(ctx.accounts.user_pt_account.amount >= amount, YieldrError::InsufficientPt);

    let lst_mint = ctx.accounts.market.lst_mint; let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump; let market_key = ctx.accounts.market.key();
    let seeds: &[&[&[u8]]] = &[&[b"market", lst_mint.as_ref(), &maturity_ts.to_le_bytes(), &[market_bump]]];

    token::burn(CpiContext::new(ctx.accounts.token_program.to_account_info(),
        Burn { mint: ctx.accounts.pt_mint.to_account_info(), from: ctx.accounts.user_pt_account.to_account_info(),
               authority: ctx.accounts.user.to_account_info() }), amount)?;
    token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
        Transfer { from: ctx.accounts.vault.to_account_info(), to: ctx.accounts.user_lst_account.to_account_info(),
                   authority: ctx.accounts.market.to_account_info() }, seeds), amount)?;

    ctx.accounts.position.pt_amount        = ctx.accounts.position.pt_amount.checked_sub(amount).ok_or(YieldrError::MathOverflow)?;
    ctx.accounts.position.last_activity_at = now;
    ctx.accounts.market.total_deposited    = ctx.accounts.market.total_deposited.checked_sub(amount).ok_or(YieldrError::MathOverflow)?;

    let c = &mut ctx.accounts.activity_counter; let r = &mut ctx.accounts.activity_record;
    r.owner = ctx.accounts.user.key(); r.index = c.count; r.activity_type = ActivityType::RedeemPt;
    r.market = market_key; r.amount = amount; r.timestamp = now; r.bump = ctx.bumps.activity_record;
    c.count = c.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(PtRedeemed { user: ctx.accounts.user.key(), market: market_key, pt_burned: amount, lst_received: amount, timestamp: now });
    Ok(())
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", user.key().as_ref(), market.key().as_ref()], bump = position.bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump, token::authority = market)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = market.lst_mint, token::authority = user)]
    pub user_lst_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"activity_counter", user.key().as_ref()], bump = activity_counter.bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = user, space = ActivityRecord::LEN,
        seeds = [b"activity", user.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
    let now           = Clock::get()?.unix_timestamp;
    let current_index = ctx.accounts.market.yield_index;
    let last_index    = ctx.accounts.position.yield_index_at_last_claim;
    let yt_amount     = ctx.accounts.position.yt_amount;
    let index_delta   = current_index.checked_sub(last_index).ok_or(YieldrError::MathOverflow)?;
    let yield_amount  = (yt_amount as u128).checked_mul(index_delta).ok_or(YieldrError::MathOverflow)?
                        .checked_div(1_000_000_000).ok_or(YieldrError::MathOverflow)? as u64;
    require!(yield_amount > 0, YieldrError::NoYieldToClaim);

    let lst_mint = ctx.accounts.market.lst_mint; let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump; let market_key = ctx.accounts.market.key();
    let seeds: &[&[&[u8]]] = &[&[b"market", lst_mint.as_ref(), &maturity_ts.to_le_bytes(), &[market_bump]]];

    token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(),
        Transfer { from: ctx.accounts.vault.to_account_info(), to: ctx.accounts.user_lst_account.to_account_info(),
                   authority: ctx.accounts.market.to_account_info() }, seeds), yield_amount)?;

    ctx.accounts.position.yield_index_at_last_claim = current_index;
    ctx.accounts.position.total_yield_claimed = ctx.accounts.position.total_yield_claimed.checked_add(yield_amount).ok_or(YieldrError::MathOverflow)?;
    ctx.accounts.position.last_activity_at = now;

    let c = &mut ctx.accounts.activity_counter; let r = &mut ctx.accounts.activity_record;
    r.owner = ctx.accounts.user.key(); r.index = c.count; r.activity_type = ActivityType::ClaimYield;
    r.market = market_key; r.amount = yield_amount; r.timestamp = now; r.bump = ctx.bumps.activity_record;
    c.count = c.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(YieldClaimed { user: ctx.accounts.user.key(), market: market_key, yield_amount, timestamp: now });
    Ok(())
}
RUST

# ── instructions/auction.rs ──────────────────────────────────────
cat > "$SRC/instructions/auction.rs" << 'RUST'
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
RUST

echo ""
echo "==> All files patched. Now run: cargo update && anchor build"