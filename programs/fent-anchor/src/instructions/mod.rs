use anchor_lang::prelude::*;
use crate::{LstType, BidCurrency, AuctionStatus};

// ─── Protocol Config ──────────────────────────────────────────────────────────


#[account]
pub struct ProtocolConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,      
    pub paused: bool,
    pub bump: u8,
}

impl ProtocolConfig {
    pub const LEN: usize = 8 + 32 + 32 + 2 + 1 + 1;
}

// ─── Market ───────────────────────────────────────────────────────────────────


#[account]
pub struct Market {
    pub lst_mint: Pubkey,         
    pub pt_mint: Pubkey,         
    pub yt_mint: Pubkey,         
    pub lst_vault: Pubkey,       
    pub maturity_ts: i64,         
    pub lst_type: LstType,
    pub total_lst_locked: u64,    
    pub total_yield_claimed: u64, 
    pub last_yield_index: u128,  
    pub bump: u8,
}

impl Market {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 1 + 8 + 8 + 16 + 1;

    pub fn is_mature(&self) -> bool {
        let now = Clock::get().unwrap().unix_timestamp;
        now >= self.maturity_ts
    }
}

// ─── User Position ────────────────────────────────────────────────────────────


#[account]
pub struct UserPosition {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub yt_balance: u64,          
    pub yield_index_snapshot: u128, 
    pub unclaimed_yield: u64,     
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 16 + 8 + 1;
}

// ─── Auction ──────────────────────────────────────────────────────────────────


#[account]
pub struct Auction {
    pub market: Pubkey,
    pub seller: Pubkey,
    pub yt_escrow: Pubkey,        
    pub bid_escrow: Pubkey,      
    pub yt_amount: u64,
    pub reserve_price: u64,
    pub highest_bid: u64,
    pub highest_bidder: Pubkey,
    pub bid_currency: BidCurrency,
    pub start_ts: i64,
    pub end_ts: i64,
    pub status: AuctionStatus,
    pub nonce: u64,              
    pub bump: u8,
}

impl Auction {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 32 + 1 + 8 + 8 + 1 + 8 + 1;

    pub fn is_ended(&self) -> bool {
        let now = Clock::get().unwrap().unix_timestamp;
        now >= self.end_ts
    }

    pub fn is_active(&self) -> bool {
        self.status == AuctionStatus::Active && !self.is_ended()
    }


    pub fn implied_apy_bps(&self, bid: u64) -> u64 {
        let now = Clock::get().unwrap().unix_timestamp;
        let time_to_maturity = self.end_ts.saturating_sub(now).max(1) as u64;
        let secs_per_year: u64 = 365 * 24 * 3600;
        let numerator = (bid as u128)
            .saturating_mul(secs_per_year as u128)
            .saturating_mul(10_000);
        let denominator = (self.yt_amount as u128).saturating_mul(time_to_maturity as u128);
        if denominator == 0 { return 0; }
        (numerator / denominator) as u64
    }
}