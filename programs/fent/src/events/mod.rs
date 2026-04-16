use anchor_lang::prelude::*;

// ─── Protocol ─────────────────────────────────────────────────

#[event]
pub struct ProtocolInitialized {
    pub admin: Pubkey,
    pub fee_bps: u16,
    pub timestamp: i64,
}

#[event]
pub struct LstRegistered {
    pub mint: Pubkey,
    pub symbol: String,
    pub timestamp: i64,
}

// ─── Market ───────────────────────────────────────────────────

#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub lst_mint: Pubkey,
    pub pt_mint: Pubkey,
    pub yt_mint: Pubkey,
    pub maturity_ts: i64,
    pub timestamp: i64,
}

// ─── Deposit / Split ──────────────────────────────────────────

#[event]
pub struct Deposited {
    pub user: Pubkey,
    pub market: Pubkey,
    pub lst_mint: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PositionSplit {
    pub user: Pubkey,
    pub market: Pubkey,
    pub amount: u64,      // both PT and YT minted in equal quantity
    pub timestamp: i64,
}

// ─── Redemption ───────────────────────────────────────────────

#[event]
pub struct PtRedeemed {
    pub user: Pubkey,
    pub market: Pubkey,
    pub pt_burned: u64,
    pub lst_received: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldClaimed {
    pub user: Pubkey,
    pub market: Pubkey,
    pub yield_amount: u64,    // LST lamports received
    pub timestamp: i64,
}

// ─── Auction ──────────────────────────────────────────────────

#[event]
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub market: Pubkey,
    pub round: u64,
    pub start_ts: i64,
    pub end_ts: i64,
    pub min_bid_price: u64,
}

#[event]
pub struct BidPlaced {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub price: u64,
    pub quantity: u64,
    pub escrowed_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct AuctionSettled {
    pub auction: Pubkey,
    pub market: Pubkey,
    pub round: u64,
    pub clearing_price: u64,
    pub total_filled: u64,
    pub total_bid_volume: u64,
    pub implied_apy_bps: u64,   // basis points — e.g. 784 = 7.84%
    pub timestamp: i64,
}

#[event]
pub struct BidWithdrawn {
    pub auction: Pubkey,
    pub bidder: Pubkey,
    pub pt_received: u64,
    pub lamports_refunded: u64,
    pub timestamp: i64,
}