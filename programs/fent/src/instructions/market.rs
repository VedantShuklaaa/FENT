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
