use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Token, TokenAccount, Transfer};
use crate::state::{Market, UserPosition};
use crate::errors::FentError;

// ─── Redeem Principal (PT → LST) ──────────────────────────────────────────────

/// Burn PT tokens after maturity and receive original LST amount back.
pub fn redeem_principal(ctx: Context<RedeemPrincipal>, pt_amount: u64) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(market.is_mature(), FentError::MarketNotYetMature);
    require!(pt_amount > 0, FentError::ZeroAmount);

    let seeds = &[b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes(), &[market.bump]];
    let signer = &[&seeds[..]];

    // Burn PT
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.pt_mint.to_account_info(),
                from: ctx.accounts.user_pt_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        pt_amount,
    )?;

    // Transfer LST from vault → user (1:1)
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lst_vault.to_account_info(),
                to: ctx.accounts.user_lst_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer,
        ),
        pt_amount,
    )?;

    market.total_lst_locked = market.total_lst_locked.saturating_sub(pt_amount);

    emit!(PrincipalRedeemedEvent {
        user: ctx.accounts.user.key(),
        market: market.key(),
        pt_burned: pt_amount,
        lst_returned: pt_amount,
    });

    Ok(())
}

// ─── Claim Yield (YT → staking rewards) ──────────────────────────────────────

/// YT holders call this to claim their share of LST staking yield.
/// The yield index tracks cumulative yield per YT outstanding.
/// Claimable = (current_index - user_snapshot) * user_yt_balance
pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let position = &mut ctx.accounts.user_position;

    // Calculate pending yield since last claim
    let index_delta = market.last_yield_index
        .saturating_sub(position.yield_index_snapshot);

    let pending = (index_delta as u128)
        .checked_mul(position.yt_balance as u128)
        .unwrap_or(0)
        .checked_div(1_000_000_000_000) 
        .unwrap_or(0) as u64;

    let total_claimable = position.unclaimed_yield.saturating_add(pending);
    require!(total_claimable > 0, FentError::NoYieldToClaim);

    let seeds = &[b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes(), &[market.bump]];
    let signer = &[&seeds[..]];

    // Transfer yield (as LST or USDC depending on market config) to user
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.yield_vault.to_account_info(),
                to: ctx.accounts.user_yield_account.to_account_info(),
                authority: market.to_account_info(),
            },
            signer,
        ),
        total_claimable,
    )?;

    market.total_yield_claimed = market.total_yield_claimed
        .checked_add(total_claimable)
        .ok_or(FentError::Overflow)?;

    position.yield_index_snapshot = market.last_yield_index;
    position.unclaimed_yield = 0;

    emit!(YieldClaimedEvent {
        user: ctx.accounts.user.key(),
        market: market.key(),
        amount: total_claimable,
    });

    Ok(())
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct RedeemPrincipal<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(mut, seeds = [b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut, address = market.pt_mint)] pub pt_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(mut, address = market.lst_vault)] pub lst_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub user_pt_account: Account<'info, TokenAccount>,
    #[account(mut)] pub user_lst_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(mut, seeds = [b"market", market.lst_mint.as_ref(), &market.maturity_ts.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", market.key().as_ref(), user.key().as_ref()], bump = user_position.bump)]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)] pub yield_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub user_yield_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct PrincipalRedeemedEvent {
    pub user: Pubkey,
    pub market: Pubkey,
    pub pt_burned: u64,
    pub lst_returned: u64,
}

#[event]
pub struct YieldClaimedEvent {
    pub user: Pubkey,
    pub market: Pubkey,
    pub amount: u64,
}