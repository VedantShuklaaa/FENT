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
