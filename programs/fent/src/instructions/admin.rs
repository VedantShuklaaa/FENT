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
