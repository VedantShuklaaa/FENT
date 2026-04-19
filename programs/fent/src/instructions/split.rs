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
