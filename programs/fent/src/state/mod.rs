use anchor_lang::prelude::*;

// ─── Protocol Config ────────────────────────────────────────────

#[account]
#[derive(Default)]
pub struct ProtocolConfig {
    /// The admin who can register LSTs and update fees.
    pub admin: Pubkey,
    /// Protocol fee in basis points (30 = 0.3%).
    pub fee_bps: u16,
    /// Total value locked across all markets (in lamports).
    pub total_tvl: u64,
    /// Total number of markets created so far.
    pub market_count: u64,
    /// Bump seed so we can re-derive this PDA.
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8    // discriminator
        + 32                    // admin
        + 2                     // fee_bps
        + 8                     // total_tvl
        + 8                     // market_count
        + 1;                    // bump
}

// ─── LST Registry Entry ─────────────────────────────────────────
//
// WHY: The frontend needs to list all supported LSTs (jitoSOL, mSOL, bSOL)
// without hard-coding them. Each registered LST gets one of these.
// PDA: ["lst_info", lst_mint.key()]

#[account]
pub struct LstInfo {
    /// The SPL token mint address of the LST.
    pub mint: Pubkey,
    /// Short ticker e.g. "jitoSOL"
    pub symbol: String,         // max 16 chars
    /// Full name e.g. "Jito Liquid Staking Token"
    pub name: String,           // max 64 chars
    /// Whether this LST is still active.
    pub is_active: bool,
    /// Unix timestamp when this was registered.
    pub registered_at: i64,
    pub bump: u8,
}

impl LstInfo {
    pub const LEN: usize = 8
        + 32                    // mint
        + (4 + 16)              // symbol (4-byte length prefix + max 16 chars)
        + (4 + 64)              // name
        + 1                     // is_active
        + 8                     // registered_at
        + 1;                    // bump
}

// ─── Market ─────────────────────────────────────────────────────
//
// WHY: A market is one (LST, maturity_date) pair.
// jitoSOL maturing Jun-2025 is a different market from
// jitoSOL maturing Sep-2025.
// Each market owns a PT mint and a YT mint.
// PDA: ["market", lst_mint.key(), maturity_ts.to_le_bytes()]

#[account]
pub struct Market {
    /// Which LST this market is for.
    pub lst_mint: Pubkey,
    /// When PT tokens become redeemable (Unix timestamp).
    pub maturity_ts: i64,
    /// The PT SPL token mint. Controlled by this program.
    pub pt_mint: Pubkey,
    /// The YT SPL token mint. Controlled by this program.
    pub yt_mint: Pubkey,
    /// Vault holding deposited LST tokens.
    pub vault: Pubkey,
    /// Total LST deposited into this market.
    pub total_deposited: u64,
    /// Total PT tokens minted (= total_deposited at split time).
    pub total_pt_minted: u64,
    /// Total YT tokens minted.
    pub total_yt_minted: u64,
    /// Cumulative yield index — increases as staking rewards arrive.
    /// Stored as a fixed-point number (scaled by 1e9).
    pub yield_index: u128,
    /// Last time yield_index was updated.
    pub yield_updated_at: i64,
    /// Current auction round number (0 = no auction yet).
    pub current_auction_round: u64,
    /// Whether this market has been settled (past maturity).
    pub is_settled: bool,
    pub bump: u8,
}

impl Market {
    pub const LEN: usize = 8
        + 32  // lst_mint
        + 8   // maturity_ts
        + 32  // pt_mint
        + 32  // yt_mint
        + 32  // vault
        + 8   // total_deposited
        + 8   // total_pt_minted
        + 8   // total_yt_minted
        + 16  // yield_index (u128)
        + 8   // yield_updated_at
        + 8   // current_auction_round
        + 1   // is_settled
        + 1;  // bump
}

// ─── Position ────────────────────────────────────────────────────
//
// WHY: Tracks everything about one user's stake in one market.
// Without this account the frontend can't show the positions table.
// PDA: ["position", user.key(), market.key()]

#[account]
#[derive(Default)]
pub struct Position {
    /// The user who owns this position.
    pub owner: Pubkey,
    /// Which market this position is in.
    pub market: Pubkey,
    /// Raw LST tokens still in the vault (not yet split).
    pub deposited_amount: u64,
    /// PT tokens currently held (after splitting).
    pub pt_amount: u64,
    /// YT tokens currently held.
    pub yt_amount: u64,
    /// Yield index snapshot at last claim. Used to calculate
    /// how much yield has accrued since then.
    pub yield_index_at_last_claim: u128,
    /// Total yield claimed so far (in LST lamports).
    pub total_yield_claimed: u64,
    /// Unix timestamp of the very first deposit.
    pub opened_at: i64,
    /// Last activity timestamp (for frontend history ordering).
    pub last_activity_at: i64,
    pub bump: u8,
}

impl Position {
    pub const LEN: usize = 8
        + 32  // owner
        + 32  // market
        + 8   // deposited_amount
        + 8   // pt_amount
        + 8   // yt_amount
        + 16  // yield_index_at_last_claim
        + 8   // total_yield_claimed
        + 8   // opened_at
        + 8   // last_activity_at
        + 1;  // bump
}

// ─── Auction ─────────────────────────────────────────────────────
//
// WHY: Each auction round needs its own account to track
// clearing price, bid volume, fill rate, and countdown.
// PDA: ["auction", market.key(), round.to_le_bytes()]

#[account]
pub struct Auction {
    /// Which market this auction is discovering price for.
    pub market: Pubkey,
    /// Monotonically increasing round number.
    pub round: u64,
    /// When bidding opens.
    pub start_ts: i64,
    /// When bidding closes.
    pub end_ts: i64,
    /// Floor price for bids (in underlying lamports per PT).
    pub min_bid_price: u64,
    /// The price at which all fills happen (set during settlement).
    pub clearing_price: u64,
    /// Total bid volume in underlying lamports.
    pub total_bid_volume: u64,
    /// Total PT tokens available in this auction.
    pub total_supply: u64,
    /// How many PT tokens were actually sold.
    pub total_filled: u64,
    /// Auction lifecycle: Open, Settling, Settled.
    pub status: AuctionStatus,
    pub bump: u8,
}

impl Auction {
    pub const LEN: usize = 8
        + 32  // market
        + 8   // round
        + 8   // start_ts
        + 8   // end_ts
        + 8   // min_bid_price
        + 8   // clearing_price
        + 8   // total_bid_volume
        + 8   // total_supply
        + 8   // total_filled
        + 1   // status
        + 1;  // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AuctionStatus {
    Open,
    Settled,
    Cancelled,
}

// ─── Bid ─────────────────────────────────────────────────────────
//
// WHY: Each user gets one bid account per auction round.
// It holds their escrowed funds and records fill status.
// PDA: ["bid", auction.key(), bidder.key()]

#[account]
pub struct Bid {
    /// The auction this bid belongs to.
    pub auction: Pubkey,
    /// Who placed this bid.
    pub bidder: Pubkey,
    /// Bid price per PT (in underlying lamports).
    pub price: u64,
    /// Number of PT tokens the bidder wants to buy.
    pub quantity: u64,
    /// SOL lamports locked in escrow (= price * quantity).
    pub escrowed_lamports: u64,
    /// How many PT tokens were actually filled.
    pub filled_quantity: u64,
    /// Whether the refund / PT has been withdrawn.
    pub withdrawn: bool,
    pub bump: u8,
}

impl Bid {
    pub const LEN: usize = 8
        + 32  // auction
        + 32  // bidder
        + 8   // price
        + 8   // quantity
        + 8   // escrowed_lamports
        + 8   // filled_quantity
        + 1   // withdrawn
        + 1;  // bump
}

// ─── Activity Log Entry ──────────────────────────────────────────
//
// WHY: The frontend history page needs on-chain records
// so users can see their full transaction history even after
// refreshing. Events alone are ephemeral (they live in tx logs).
// PDA: ["activity", user.key(), activity_index.to_le_bytes()]

#[account]
pub struct ActivityRecord {
    pub owner: Pubkey,
    /// Global index for this user's activity (0, 1, 2, …).
    pub index: u64,
    pub activity_type: ActivityType,
    /// Market involved (zeroes if protocol-level).
    pub market: Pubkey,
    /// Amount in LST lamports (or PT/YT tokens depending on type).
    pub amount: u64,
    /// Unix timestamp.
    pub timestamp: i64,
    /// The Solana transaction signature (truncated to 64 bytes).
    pub tx_sig: [u8; 64],
    pub bump: u8,
}

impl ActivityRecord {
    pub const LEN: usize = 8
        + 32  // owner
        + 8   // index
        + 1   // activity_type
        + 32  // market
        + 8   // amount
        + 8   // timestamp
        + 64  // tx_sig
        + 1;  // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ActivityType {
    Deposit = 0,
    Split = 1,
    RedeemPt = 2,
    ClaimYield = 3,
    PlaceBid = 4,
    AuctionFill = 5,
    BidRefund = 6,
}

// ─── User Activity Counter ───────────────────────────────────────
//
// WHY: We need to know the next index when writing ActivityRecord PDAs.
// PDA: ["activity_counter", user.key()]

#[account]
#[derive(Default)]
pub struct ActivityCounter {
    pub owner: Pubkey,
    pub count: u64,
    pub bump: u8,
}

impl ActivityCounter {
    pub const LEN: usize = 8 + 32 + 8 + 1;
}