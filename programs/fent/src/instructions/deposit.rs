use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::{errors::YieldrError, events::Deposited, state::{ActivityCounter, ActivityRecord, ActivityType, Market, Position, ProtocolConfig}};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, constraint = !market.is_settled @ YieldrError::MarketMatured)]
    pub market: Account<'info, Market>,
    #[account(init_if_needed, payer = user, space = Position::LEN,
        seeds = [b"position", user.key().as_ref(), market.key().as_ref()], bump)]
    pub position: Account<'info, Position>,
    #[account(mut, seeds = [b"vault", market.key().as_ref()], bump,
        token::mint = market.lst_mint, token::authority = market)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = market.lst_mint, token::authority = user)]
    pub user_lst_account: Account<'info, TokenAccount>,
    pub lst_mint: Account<'info, Mint>,
    #[account(init_if_needed, payer = user, space = ActivityCounter::LEN,
        seeds = [b"activity_counter", user.key().as_ref()], bump)]
    pub activity_counter: Account<'info, ActivityCounter>,
    #[account(init, payer = user, space = ActivityRecord::LEN,
        seeds = [b"activity", user.key().as_ref(), &activity_counter.count.to_le_bytes()], bump)]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"protocol_config"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub token_program:  Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, YieldrError::ZeroAmount);
    let now = Clock::get()?.unix_timestamp;
    require!(ctx.accounts.market.maturity_ts > now, YieldrError::MarketMatured);

    token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(),
        Transfer { from: ctx.accounts.user_lst_account.to_account_info(),
                   to:   ctx.accounts.vault.to_account_info(),
                   authority: ctx.accounts.user.to_account_info() }), amount)?;

    let market = &mut ctx.accounts.market;
    market.total_deposited = market.total_deposited.checked_add(amount).ok_or(YieldrError::MathOverflow)?;

    let position = &mut ctx.accounts.position;
    if position.opened_at == 0 {
        position.owner                     = ctx.accounts.user.key();
        position.market                    = market.key();
        position.yield_index_at_last_claim = market.yield_index;
        position.opened_at                 = now;
        position.bump                      = ctx.bumps.position;
    }
    position.deposited_amount = position.deposited_amount.checked_add(amount).ok_or(YieldrError::MathOverflow)?;
    position.last_activity_at = now;

    ctx.accounts.protocol_config.total_tvl =
        ctx.accounts.protocol_config.total_tvl.checked_add(amount).ok_or(YieldrError::MathOverflow)?;

    let counter = &mut ctx.accounts.activity_counter;
    if counter.count == 0 { counter.owner = ctx.accounts.user.key(); counter.bump = ctx.bumps.activity_counter; }
    let record           = &mut ctx.accounts.activity_record;
    record.owner         = ctx.accounts.user.key();
    record.index         = counter.count;
    record.activity_type = ActivityType::Deposit;
    record.market        = market.key();
    record.amount        = amount;
    record.timestamp     = now;
    record.tx_sig        = [0u8; 64];
    record.bump          = ctx.bumps.activity_record;
    counter.count        = counter.count.checked_add(1).ok_or(YieldrError::MathOverflow)?;

    emit!(Deposited { user: ctx.accounts.user.key(), market: market.key(), lst_mint: market.lst_mint, amount, timestamp: now });
    Ok(())
}
