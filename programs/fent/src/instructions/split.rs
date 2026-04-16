use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    errors::FentError,
    events::PositionSplit,
    state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position},
};

#[derive(Accounts)]
pub struct SplitPosition<'info> {
    /// Market must not be settled — time check is in handler.
    #[account(
        mut,
        constraint = !market.is_settled @ FentError::MarketMatured,
    )]
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
        mint::authority = market,
    )]
    pub pt_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"yt_mint", market.key().as_ref()],
        bump,
        mint::authority = market,
    )]
    pub yt_mint: Account<'info, Mint>,

    /// User's PT token account — created if it doesn't exist.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint      = pt_mint,
        associated_token::authority = user,
    )]
    pub user_pt_account: Account<'info, TokenAccount>,

    /// User's YT token account — created if it doesn't exist.
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint      = yt_mint,
        associated_token::authority = user,
    )]
    pub user_yt_account: Account<'info, TokenAccount>,

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

    pub token_program:            Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program:           Program<'info, System>,
    pub rent:                     Sysvar<'info, Rent>,
}

pub fn split_position(ctx: Context<SplitPosition>, amount: u64) -> Result<()> {
    require!(amount > 0, FentError::ZeroAmount);

    let now = Clock::get()?.unix_timestamp;

    // ── Owner + maturity checks in handler ───────────────────────
    require!(
        ctx.accounts.position.owner == ctx.accounts.user.key(),
        FentError::Unauthorized
    );
    require!(
        ctx.accounts.market.maturity_ts > now,
        FentError::MarketMatured
    );
    require!(
        ctx.accounts.position.deposited_amount >= amount,
        FentError::InsufficientDeposit
    );

    let market_key  = ctx.accounts.market.key();
    let lst_mint    = ctx.accounts.market.lst_mint;
    let maturity_ts = ctx.accounts.market.maturity_ts;
    let market_bump = ctx.accounts.market.bump;

    // ── PDA signer seeds (market is the mint authority) ──────────
    let seeds: &[&[&[u8]]] = &[&[
        b"market",
        lst_mint.as_ref(),
        &maturity_ts.to_le_bytes(),
        &[market_bump],
    ]];

    // ── Mint PT ──────────────────────────────────────────────────
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint:      ctx.accounts.pt_mint.to_account_info(),
                to:        ctx.accounts.user_pt_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            seeds,
        ),
        amount,
    )?;

    // ── Mint YT ──────────────────────────────────────────────────
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint:      ctx.accounts.yt_mint.to_account_info(),
                to:        ctx.accounts.user_yt_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            seeds,
        ),
        amount,
    )?;

    // ── Update position ──────────────────────────────────────────
    let position = &mut ctx.accounts.position;
    position.deposited_amount = position.deposited_amount.checked_sub(amount).ok_or(FentError::MathOverflow)?;
    position.pt_amount        = position.pt_amount.checked_add(amount).ok_or(FentError::MathOverflow)?;
    position.yt_amount        = position.yt_amount.checked_add(amount).ok_or(FentError::MathOverflow)?;
    position.last_activity_at = now;

    // ── Update market mint counters ──────────────────────────────
    let market = &mut ctx.accounts.market;
    market.total_pt_minted = market.total_pt_minted.checked_add(amount).ok_or(FentError::MathOverflow)?;
    market.total_yt_minted = market.total_yt_minted.checked_add(amount).ok_or(FentError::MathOverflow)?;

    // ── Activity record ──────────────────────────────────────────
    let counter          = &mut ctx.accounts.activity_counter;
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.user.key();
    record.index         = counter.count;
    record.activity_type = ActivityType::Split;
    record.market        = market_key;
    record.amount        = amount;
    record.timestamp     = now;
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(FentError::MathOverflow)?;

    emit!(PositionSplit { user: ctx.accounts.user.key(), market: market_key, amount, timestamp: now });
    msg!("Split {} LST → {} PT + {} YT", amount, amount, amount);
    Ok(())
}