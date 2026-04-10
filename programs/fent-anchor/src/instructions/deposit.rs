use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};
use crate::state::{Market, UserPosition};
use crate::errors::FentError;


pub fn deposit(ctx: Context<Deposit>, lst_amount: u64) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(!market.is_mature(), FentError::MarketMatured);
    require!(lst_amount > 0, FentError::ZeroAmount);

    // 1. Transfer LST from user → vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_lst_account.to_account_info(),
                to: ctx.accounts.lst_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        lst_amount,
    )?;

    // 2. Mint PT to user (1:1)
    let seeds = &[b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes(), &[market.bump]];
    let signer = &[&seeds[..]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.pt_mint.to_account_info(),
                to: ctx.accounts.user_pt_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer,
        ),
        lst_amount,
    )?;

    // 3. Mint YT to user (1:1)
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.yt_mint.to_account_info(),
                to: ctx.accounts.user_yt_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer,
        ),
        lst_amount,
    )?;

    // 4. Update market state
    market.total_lst_locked = market.total_lst_locked.checked_add(lst_amount)
        .ok_or(FentError::Overflow)?;

    // 5. Update user position (for yield tracking)
    let position = &mut ctx.accounts.user_position;
    position.yt_balance = position.yt_balance.checked_add(lst_amount)
        .ok_or(FentError::Overflow)?;
    position.yield_index_snapshot = market.last_yield_index;

    emit!(DepositEvent {
        user: ctx.accounts.user.key(),
        market: market.key(),
        lst_amount,
        pt_minted: lst_amount,
        yt_minted: lst_amount,
    });

    Ok(())
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        address = market.pt_mint,
    )]
    pub pt_mint: Account<'info, Mint>,

    #[account(
        mut,
        address = market.yt_mint,
    )]
    pub yt_mint: Account<'info, Mint>,

    #[account(
        mut,
        address = market.lst_vault,
    )]
    pub lst_vault: Account<'info, TokenAccount>,

    /// User's LST token account (source)
    #[account(
        mut,
        constraint = user_lst_account.mint == market.lst_mint,
        constraint = user_lst_account.owner == user.key(),
    )]
    pub user_lst_account: Account<'info, TokenAccount>,

    /// User's PT token account (destination)
    #[account(
        mut,
        constraint = user_pt_account.mint == market.pt_mint,
        constraint = user_pt_account.owner == user.key(),
    )]
    pub user_pt_account: Account<'info, TokenAccount>,

    /// User's YT token account (destination)
    #[account(
        mut,
        constraint = user_yt_account.mint == market.yt_mint,
        constraint = user_yt_account.owner == user.key(),
    )]
    pub user_yt_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = UserPosition::LEN,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_position: Account<'info, UserPosition>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub market: Pubkey,
    pub lst_amount: u64,
    pub pt_minted: u64,
    pub yt_minted: u64,
}