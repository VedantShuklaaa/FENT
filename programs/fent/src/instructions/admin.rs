use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::{
    errors::FentError,
    events::{LstRegistered, ProtocolInitialized},
    state::{LstInfo, ProtocolConfig},
};

// ─── initialize_protocol ────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::LEN,
        seeds = [b"protocol_config"],
        bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_protocol(
    ctx: Context<InitializeProtocol>,
    fee_bps: u16,
) -> Result<()> {
    let cfg      = &mut ctx.accounts.protocol_config;
    cfg.admin        = ctx.accounts.admin.key();
    cfg.fee_bps      = fee_bps;
    cfg.total_tvl    = 0;
    cfg.market_count = 0;
    cfg.bump         = ctx.bumps.protocol_config;

    emit!(ProtocolInitialized {
        admin:     cfg.admin,
        fee_bps,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Protocol initialized. Admin: {}", cfg.admin);
    Ok(())
}

// ─── register_lst ───────────────────────────────────────────────

#[derive(Accounts)]
pub struct RegisterLst<'info> {
    #[account(
        init,
        payer = admin,
        space = LstInfo::LEN,
        seeds = [b"lst_info", lst_mint.key().as_ref()],
        bump,
    )]
    pub lst_info: Account<'info, LstInfo>,

    pub lst_mint: Account<'info, Mint>,

    // has_one = admin checks that protocol_config.admin == admin.key()
    #[account(
        seeds = [b"protocol_config"],
        bump = protocol_config.bump,
        has_one = admin @ FentError::Unauthorized,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn register_lst(
    ctx: Context<RegisterLst>,
    symbol: String,
    name: String,
) -> Result<()> {
    // Validate string lengths
    require!(symbol.len() <= 16, FentError::LstAlreadyRegistered);
    require!(name.len()   <= 64, FentError::LstAlreadyRegistered);

    let lst_info           = &mut ctx.accounts.lst_info;
    lst_info.mint          = ctx.accounts.lst_mint.key();
    lst_info.symbol        = symbol.clone();
    lst_info.name          = name;
    lst_info.is_active     = true;
    lst_info.registered_at = Clock::get()?.unix_timestamp;
    lst_info.bump          = ctx.bumps.lst_info;

    emit!(LstRegistered {
        mint:      lst_info.mint,
        symbol,
        timestamp: lst_info.registered_at,
    });

    msg!("LST registered: {} ({})", lst_info.symbol, lst_info.mint);
    Ok(())
}