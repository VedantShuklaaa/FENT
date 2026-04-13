use anchor_lang::prelude::*;
 
pub mod errors;
pub mod instructions;
pub mod state;
 
use instructions::*;

declare_id!("FLp9vpfqWwoFA6RejXxZAWKmgfcb98TNFnLeAbZqk6QD");

#[program]
pub mod fent {
    use super::*;
 
    // ─── Admin ───────────────────────────────────────────────────────────────
 
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        fee_bps: u16,         // 30 = 0.30%
        treasury: Pubkey,
    ) -> Result<()> {
        instructions::admin::initialize_protocol(ctx, fee_bps, treasury)
    }
 
    // ─── Market ──────────────────────────────────────────────────────────────
 
    /// Create a new PT/YT market for an LST (jitoSOL, mSOL, bSOL …).
    /// One market per (lst_mint, maturity_ts) pair.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        maturity_ts: i64,     // Unix timestamp when PT becomes redeemable
        lst_type: LstType,    // jitoSOL | mSOL | bSOL
    ) -> Result<()> {
        instructions::market::create_market(ctx, maturity_ts, lst_type)
    }
 
    // ─── Deposit / Mint ───────────────────────────────────────────────────────
 
    /// Deposit LST → receive equal-value PT + YT.
    /// PT amount  = lst_amount (1:1 claim on principal at maturity)
    /// YT amount  = lst_amount (1:1 claim on accrued yield until maturity)
    pub fn deposit(
        ctx: Context<Deposit>,
        lst_amount: u64,
    ) -> Result<()> {
        instructions::deposit::deposit(ctx, lst_amount)
    }
 
    // ─── Redemption ───────────────────────────────────────────────────────────
 
    /// Burn PT after maturity → receive original LST amount back.
    pub fn redeem_principal(
        ctx: Context<RedeemPrincipal>,
        pt_amount: u64,
    ) -> Result<()> {
        instructions::redeem::redeem_principal(ctx, pt_amount)
    }
 
    /// Claim accumulated staking yield on a YT position.
    /// Called any time; yield accrues until maturity then stops.
    pub fn claim_yield(
        ctx: Context<ClaimYield>,
    ) -> Result<()> {
        instructions::redeem::claim_yield(ctx)
    }
 
    // ─── Auction (English) ────────────────────────────────────────────────────
 
    /// Seller lists YTs in a new English auction.
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        yt_amount: u64,
        reserve_price: u64,   // lamports (or USDC atoms)
        duration_secs: u64,   // e.g. 3600 = 1 hour
        bid_currency: BidCurrency, // SOL | USDC
    ) -> Result<()> {
        instructions::auction::create_auction(ctx, yt_amount, reserve_price, duration_secs, bid_currency)
    }
 
    /// Place or raise a bid. Previous leading bid is escrowed; losing bids
    /// are refunded immediately.
    pub fn place_bid(
        ctx: Context<PlaceBid>,
        bid_amount: u64,
    ) -> Result<()> {
        instructions::auction::place_bid(ctx, bid_amount)
    }
 
    /// Settle the auction after it ends.
    /// - Winner receives YT
    /// - Seller receives bid proceeds minus protocol fee
    /// - Protocol fee goes to treasury
    pub fn settle_auction(
        ctx: Context<SettleAuction>,
    ) -> Result<()> {
        instructions::auction::settle_auction(ctx)
    }
 
    /// Cancel an auction if no bids have been placed (seller only).
    pub fn cancel_auction(
        ctx: Context<CancelAuction>,
    ) -> Result<()> {
        instructions::auction::cancel_auction(ctx)
    }
}
 
// ─── Shared enums (used across instructions) ─────────────────────────────────
 
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