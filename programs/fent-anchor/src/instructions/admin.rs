// ─── admin.rs ─────────────────────────────────────────────────────────────────

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::{Market, ProtocolConfig};
use crate::{LstType};

pub fn initialize_protocol(
    ctx: Context<InitializeProtocol>,
    fee_bps: u16,
    treasury: Pubkey,
) -> Result<()> {
    require!(fee_bps <= 500, crate::errors::FentError::Overflow); // max 5%
    let config = &mut ctx.accounts.protocol_config;
    config.authority = ctx.accounts.authority.key();
    config.treasury = treasury;
    config.fee_bps = fee_bps;
    config.paused = false;
    config.bump = ctx.bumps.protocol_config;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)] pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = ProtocolConfig::LEN,
        seeds = [b"protocol"],
        bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub system_program: Program<'info, System>,
}

// ─── market.rs ────────────────────────────────────────────────────────────────

pub fn create_market(
    ctx: Context<CreateMarket>,
    maturity_ts: i64,
    lst_type: LstType,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    require!(maturity_ts > now, crate::errors::FentError::MarketMatured);

    let market = &mut ctx.accounts.market;
    market.lst_mint = ctx.accounts.lst_mint.key();
    market.pt_mint = ctx.accounts.pt_mint.key();
    market.yt_mint = ctx.accounts.yt_mint.key();
    market.lst_vault = ctx.accounts.lst_vault.key();
    market.maturity_ts = maturity_ts;
    market.lst_type = lst_type;
    market.total_lst_locked = 0;
    market.total_yield_claimed = 0;
    market.last_yield_index = 0;
    market.bump = ctx.bumps.market;
    Ok(())
}

#[derive(Accounts)]
#[instruction(maturity_ts: i64)]
pub struct CreateMarket<'info> {
    #[account(mut)] pub creator: Signer<'info>,
    pub protocol_config: Account<'info, ProtocolConfig>,

    /// The LST mint (jitoSOL / mSOL / bSOL)
    pub lst_mint: Account<'info, Mint>,

    /// PT mint — created fresh for this (lst_mint, maturity) pair
    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = market,
        seeds = [b"pt_mint", lst_mint.key().as_ref(), &maturity_ts.to_le_bytes()],
        bump,
    )]
    pub pt_mint: Account<'info, Mint>,

    /// YT mint — created fresh for this (lst_mint, maturity) pair
    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = market,
        seeds = [b"yt_mint", lst_mint.key().as_ref(), &maturity_ts.to_le_bytes()],
        bump,
    )]
    pub yt_mint: Account<'info, Mint>,

    /// Vault that holds deposited LSTs
    #[account(
        init,
        payer = creator,
        token::mint = lst_mint,
        token::authority = market,
        seeds = [b"lst_vault", lst_mint.key().as_ref(), &maturity_ts.to_le_bytes()],
        bump,
    )]
    pub lst_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        space = Market::LEN,
        seeds = [b"market", lst_mint.key().as_ref(), &maturity_ts.to_le_bytes()],
        bump,
    )]
    pub market: Account<'info, Market>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}