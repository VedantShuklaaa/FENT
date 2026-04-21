use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

// Explicit imports only — NO glob.
// Anchor 0.31 generates __client_accounts_* structs inside each module.
// A glob re-export pulls those in and causes "unresolved import" on #[program].
use instructions::admin::{InitializeProtocol, RegisterLst};
use instructions::market::InitializeMarket;
use instructions::deposit::Deposit;
use instructions::split::SplitPosition;
use instructions::redeem::{ClaimYield, RedeemPt};
use instructions::auction::{CreateAuction, PlaceBid, SettleAuction, WithdrawBid};

declare_id!("6Kkk6nvLC4RombhmjQvRD77ZE1UKLoXMPBLup7gZN7ZR");

#[program]
pub mod fent {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, fee_bps: u16) -> Result<()> {
        instructions::admin::initialize_protocol(ctx, fee_bps)
    }
    pub fn register_lst(ctx: Context<RegisterLst>, symbol: String, name: String) -> Result<()> {
        instructions::admin::register_lst(ctx, symbol, name)
    }
    pub fn initialize_market(ctx: Context<InitializeMarket>, maturity_ts: i64) -> Result<()> {
        instructions::market::initialize_market(ctx, maturity_ts)
    }
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit(ctx, amount)
    }
    pub fn split_position(ctx: Context<SplitPosition>, amount: u64) -> Result<()> {
        instructions::split::split_position(ctx, amount)
    }
    pub fn redeem_pt(ctx: Context<RedeemPt>, amount: u64) -> Result<()> {
        instructions::redeem::redeem_pt(ctx, amount)
    }
    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        instructions::redeem::claim_yield(ctx)
    }
    pub fn create_auction(ctx: Context<CreateAuction>, round: u64, duration_secs: i64, min_bid_price: u64) -> Result<()> {
        instructions::auction::create_auction(ctx, round, duration_secs, min_bid_price)
    }
    pub fn place_bid(ctx: Context<PlaceBid>, price: u64, quantity: u64) -> Result<()> {
        instructions::auction::place_bid(ctx, price, quantity)
    }
    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        instructions::auction::settle_auction(ctx)
    }
    pub fn withdraw_bid(ctx: Context<WithdrawBid>) -> Result<()> {
        instructions::auction::withdraw_bid(ctx)
    }
}
