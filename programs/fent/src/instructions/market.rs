use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    errors::FentError,
    events::MarketCreated,
    state::{LstInfo, Market, ProtocolConfig},
};

#[derive(Accounts)]
#[instruction(maturity_ts: i64)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = payer,
        space = Market::LEN,
        seeds = [
            b"market",
            lst_mint.key().as_ref(),
            &maturity_ts.to_le_bytes(),
        ],
        bump,
    )]
    pub market: Account<'info, Market>,

    /// PT mint — program (market PDA) is the mint authority.
    #[account(
        init,
        payer = payer,
        mint::decimals = lst_mint.decimals,
        mint::authority = market,
        seeds = [b"pt_mint", market.key().as_ref()],
        bump,
    )]
    pub pt_mint: Account<'info, Mint>,

    /// YT mint — same authority setup.
    #[account(
        init,
        payer = payer,
        mint::decimals = lst_mint.decimals,
        mint::authority = market,
        seeds = [b"yt_mint", market.key().as_ref()],
        bump,
    )]
    pub yt_mint: Account<'info, Mint>,

    /// Vault holding deposited LST — owned by market PDA.
    #[account(
        init,
        payer = payer,
        token::mint = lst_mint,
        token::authority = market,
        seeds = [b"vault", market.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"lst_info", lst_mint.key().as_ref()],
        bump = lst_info.bump,
        constraint = lst_info.is_active @ FentError::LstNotRegistered,
    )]
    pub lst_info: Account<'info, LstInfo>,

    pub lst_mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"protocol_config"],
        bump = protocol_config.bump,
    )]
    pub protocol_config: Account<'info, ProtocolConfig>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program:            Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program:           Program<'info, System>,
    pub rent:                     Sysvar<'info, Rent>,
}

pub fn initialize_market(
    ctx: Context<InitializeMarket>,
    maturity_ts: i64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    // ── Time check in handler (not in #[account] constraint) ────
    require!(maturity_ts > now, FentError::MaturityInPast);

    let market = &mut ctx.accounts.market;
    market.lst_mint              = ctx.accounts.lst_mint.key();
    market.maturity_ts           = maturity_ts;
    market.pt_mint               = ctx.accounts.pt_mint.key();
    market.yt_mint               = ctx.accounts.yt_mint.key();
    market.vault                 = ctx.accounts.vault.key();
    market.total_deposited       = 0;
    market.total_pt_minted       = 0;
    market.total_yt_minted       = 0;
    market.yield_index           = 1_000_000_000; // 1.0 * 10^9
    market.yield_updated_at      = now;
    market.current_auction_round = 0;
    market.is_settled            = false;
    market.bump                  = ctx.bumps.market;

    let config = &mut ctx.accounts.protocol_config;
    config.market_count = config
        .market_count
        .checked_add(1)
        .ok_or(FentError::MathOverflow)?;

    emit!(MarketCreated {
        market:      market.key(),
        lst_mint:    market.lst_mint,
        pt_mint:     market.pt_mint,
        yt_mint:     market.yt_mint,
        maturity_ts: market.maturity_ts,
        timestamp:   now,
    });

    msg!("Market created. LST: {} Maturity: {}", market.lst_mint, market.maturity_ts);
    Ok(())
}