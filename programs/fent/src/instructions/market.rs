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
