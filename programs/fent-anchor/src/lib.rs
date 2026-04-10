use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("8MxGhEUFBgCXRv8SY4DjEMbDA7uKKetpSYuHPZBGpyhn");

#[program]
pub mod fent_anchor {
    use super::*;

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        fee_bps: u16,
        treasury: Pubkey,
    ) -> Result<()> {
        instructions::admin::initialize_protocol(ctx, fee_bps, treasury)
    }

    pub fn create_market(
        ctx: Context<CreateMarket>,
        maturity_ts: i64,
        lst_type: LstType,
    ) -> Result<()> {
        instructions::market::create_market(ctx, maturity_ts, lst_type)
    }

    pub fn deposit(
        ctx: Context<Deposit>, 
        lst_amount: u64
    ) -> Result<()> {
        instructions::deposit::deposit(ctx, lst_amount)
    }

    pub fn redeem_principal(
        ctx: Context<RedeemPrincipal>, 
        pt_amount: u64
    ) -> Result<()> {
        instructions::redeem::redeem_principal(ctx, pt_amount)
    }

    pub fn claim_yield(
        ctx: Context<ClaimYield>
    ) -> Result<()> {
        instructions::redeem::claim_yield(ctx)
    }

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        yt_amount: u64,
        reserve_price: u64,
        duration_secs: u64,
        bid_currency: BidCurrency,
    ) -> Result<()> {
        instructions::auction::create_auction(
            ctx,
            yt_amount,
            reserve_price,
            duration_secs,
            bid_currency,
        )
    }

    pub fn place_bid(
        ctx: Context<PlaceBid>, 
        bid_amount: u64
    ) -> Result<()> {
        instructions::auction::place_bid(ctx, bid_amount)
    }

    pub fn settle_auction(
        ctx: Context<SettleAuction>
    ) -> Result<()> {
        instructions::auction::settle_auction(ctx)
    }

    pub fn cancel_auction(
        ctx: Context<CancelAuction>
    ) -> Result<()> {
        instructions::auction::cancel_auction(ctx)
    }
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum LstType {
    JitoSOL,
    MSOL,
    BSOL,
}
 
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BidCurrency {
    SOL,
    USDC,
}
 
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AuctionStatus {
    Active,
    Settled,
    Cancelled,
}