use anchor_lang::prelude::*;

#[error_code]
pub enum FentError {
    // ── Admin ─────────────────────────────────────────────────
    #[msg("Only the protocol admin can call this instruction")]
    Unauthorized,

    #[msg("LST mint is already registered")]
    LstAlreadyRegistered,

    #[msg("LST mint is not registered or has been deactivated")]
    LstNotRegistered,

    // ── Market ────────────────────────────────────────────────
    #[msg("Market maturity date is in the past")]
    MaturityInPast,

    #[msg("A market for this LST + maturity pair already exists")]
    MarketAlreadyExists,

    // ── Deposit / Split ───────────────────────────────────────
    #[msg("Deposit amount must be greater than zero")]
    ZeroAmount,

    #[msg("Insufficient deposited balance to split")]
    InsufficientDeposit,

    #[msg("Cannot split a position that has already matured")]
    MarketMatured,

    // ── Redemption ────────────────────────────────────────────
    #[msg("Market has not reached maturity yet — cannot redeem PT")]
    NotMaturedYet,

    #[msg("Insufficient PT balance to redeem")]
    InsufficientPt,

    #[msg("No yield accrued since last claim")]
    NoYieldToClaim,

    // ── Auction ───────────────────────────────────────────────
    #[msg("Auction is not currently open for bidding")]
    AuctionNotOpen,

    #[msg("Auction has not ended yet — cannot settle")]
    AuctionNotEnded,

    #[msg("Auction is already settled")]
    AuctionAlreadySettled,

    #[msg("Bid price is below the minimum allowed")]
    BidPriceTooLow,

    #[msg("Bid quantity must be greater than zero")]
    ZeroBidQuantity,

    #[msg("Bid has already been withdrawn")]
    BidAlreadyWithdrawn,

    #[msg("Cannot withdraw before auction is settled")]
    AuctionNotSettled,

    // ── Math ──────────────────────────────────────────────────
    #[msg("Arithmetic overflow")]
    MathOverflow,
}