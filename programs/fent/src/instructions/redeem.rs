use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use crate::{
    errors::FentError,
    events::{PtRedeemed, YieldClaimed},
    state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position},
};

// ─── redeem_pt ──────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RedeemPt<'info> {
    // Maturity check is in handler body
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()],
        bump = position.bump,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"pt_mint", market.key().as_ref()],
        bump,
    )]
    pub pt_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint      = pt_mint,
        token::authority = user,
    )]
    pub user_pt_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump,
        token::authority = market,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint      = market.lst_mint,
        token::authority = user,
    )]
    pub user_lst_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"activity_counter", user.key().as_ref()],
        bump = activity_counter.bump,
    )]
    pub activity_counter: Account<'info, ActivityCounter>,

    #[account(
        init,
        payer = user,
        space = ActivityRecord::LEN,
        seeds = [
            b"activity",
            user.key().as_ref(),
            &activity_counter.count.to_le_bytes(),
        ],
        bump,
    )]
    pub activity_record: Account<'info, ActivityRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn redeem_pt(ctx: Context<RedeemPt>, amount: u64) -> Result<()> {
    require!(amount > 0, FentError::ZeroAmount);

    let now = Clock::get()?.unix_timestamp;

    // ── Maturity check in handler ────────────────────────────────
    require!(
        ctx.accounts.market.maturity_ts <= now,
        FentError::NotMaturedYet
    );
    require!(
        ctx.accounts.user_pt_account.amount >= amount,
        FentError::InsufficientPt
    );

    let market_key  = ctx.accounts.market.key();
    let lst_mint    = ctx.accounts.market.lst_mint;
    let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump;

    let seeds: &[&[&[u8]]] = &[&[
        b"market",
        lst_mint.as_ref(),
        &maturity_ts.to_le_bytes(),
        &[market_bump],
    ]];

    // ── Burn PT (user is the token account owner) ────────────────
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint:      ctx.accounts.pt_mint.to_account_info(),
                from:      ctx.accounts.user_pt_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // ── Transfer 1:1 LST from vault → user ──────────────────────
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.vault.to_account_info(),
                to:        ctx.accounts.user_lst_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            seeds,
        ),
        amount,
    )?;

    let position = &mut ctx.accounts.position;
    position.pt_amount        = position.pt_amount.checked_sub(amount).ok_or(FentError::MathOverflow)?;
    position.last_activity_at = now;

    let market = &mut ctx.accounts.market;
    market.total_deposited = market.total_deposited.checked_sub(amount).ok_or(FentError::MathOverflow)?;

    let counter          = &mut ctx.accounts.activity_counter;
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.user.key();
    record.index         = counter.count;
    record.activity_type = ActivityType::RedeemPt;
    record.market        = market_key;
    record.amount        = amount;
    record.timestamp     = now;
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(FentError::MathOverflow)?;

    emit!(PtRedeemed { user: ctx.accounts.user.key(), market: market_key, pt_burned: amount, lst_received: amount, timestamp: now });
    msg!("Redeemed {} PT → {} LST", amount, amount);
    Ok(())
}

// ─── claim_yield ────────────────────────────────────────────────

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()],
        bump = position.bump,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump,
        token::authority = market,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint      = market.lst_mint,
        token::authority = user,
    )]
    pub user_lst_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"activity_counter", user.key().as_ref()],
        bump = activity_counter.bump,
    )]
    pub activity_counter: Account<'info, ActivityCounter>,

    #[account(
        init,
        payer = user,
        space = ActivityRecord::LEN,
        seeds = [
            b"activity",
            user.key().as_ref(),
            &activity_counter.count.to_le_bytes(),
        ],
        bump,
    )]
    pub activity_record: Account<'info, ActivityRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    let current_index = ctx.accounts.market.yield_index;
    let last_index    = ctx.accounts.position.yield_index_at_last_claim;
    let yt_amount     = ctx.accounts.position.yt_amount;

    let index_delta = current_index.checked_sub(last_index).ok_or(FentError::MathOverflow)?;
    let yield_amount = (yt_amount as u128)
        .checked_mul(index_delta)
        .ok_or(FentError::MathOverflow)?
        .checked_div(1_000_000_000)
        .ok_or(FentError::MathOverflow)? as u64;

    require!(yield_amount > 0, FentError::NoYieldToClaim);

    let market_key  = ctx.accounts.market.key();
    let lst_mint    = ctx.accounts.market.lst_mint;
    let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump;

    let seeds: &[&[&[u8]]] = &[&[
        b"market",
        lst_mint.as_ref(),
        &maturity_ts.to_le_bytes(),
        &[market_bump],
    ]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from:      ctx.accounts.vault.to_account_info(),
                to:        ctx.accounts.user_lst_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            seeds,
        ),
        yield_amount,
    )?;

    let position = &mut ctx.accounts.position;
    position.yield_index_at_last_claim = current_index;
    position.total_yield_claimed       = position.total_yield_claimed.checked_add(yield_amount).ok_or(FentError::MathOverflow)?;
    position.last_activity_at          = now;

    let counter          = &mut ctx.accounts.activity_counter;
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.user.key();
    record.index         = counter.count;
    record.activity_type = ActivityType::ClaimYield;
    record.market        = market_key;
    record.amount        = yield_amount;
    record.timestamp     = now;
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(FentError::MathOverflow)?;

    emit!(YieldClaimed { user: ctx.accounts.user.key(), market: market_key, yield_amount, timestamp: now });
    msg!("Claimed {} LST yield", yield_amount);
    Ok(())
}