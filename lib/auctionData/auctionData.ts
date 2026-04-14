// ─── Types ─────────────────────────────────────────────────────

export type AuctionStatus = 'active' | 'settling' | 'settled' | 'cancelled';
export type OrderSide = 'buy' | 'sell';
export type TokenType = 'PT' | 'YT';

export interface ActiveAuction {
  round: number;
  status: AuctionStatus;
  underlying: string;
  maturityDate: string;
  daysToMaturity: number;
  clearingPrice: number;
  parValue: number;
  discountPct: number;
  impliedYield: number;
  totalBidVolume: number;
  totalAskVolume: number;
  fillRate: number;        // % of supply filled
  countdownSecs: number;
  minBid: number;
  maxBid: number;
}

export interface BidLevel {
  price: number;
  volumeSol: number;
  cumVolume: number;
  barPercent: number;
  isClear: boolean;           // true if this level is at/above clearing price
}

export interface AskLevel {
  price: number;
  volumeSol: number;
  cumVolume: number;
  barPercent: number;
}

export interface OrderBookEntry {
  side: OrderSide;
  price: number;
  volumeSol: number;
  filled: number;            // 0–1 fill fraction
  wallet: string;
  timeAgo: string;
}

export interface TradeHistoryEntry {
  id: string;
  side: OrderSide;
  tokenType: TokenType;
  amount: number;
  price: number;
  valueSol: number;
  wallet: string;
  txHash: string;
  timestamp: string;
}

export interface PastAuction {
  round: number;
  date: string;
  underlying: string;
  clearingPrice: number;
  impliedYield: number;
  volumeSol: number;
  fillRate: number;
  status: AuctionStatus;
}

export interface AuctionStat {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

export interface BidFormState {
  tokenType: TokenType;
  amount: string;
  price: string;
}

// ─── Active auction ────────────────────────────────────────────

export const activeAuction: ActiveAuction = {
  round: 14,
  status: 'active',
  underlying: 'jitoSOL',
  maturityDate: 'Jun 30, 2025',
  daysToMaturity: 82,
  clearingPrice: 0.9712,
  parValue: 1.0000,
  discountPct: -2.88,
  impliedYield: 7.84,
  totalBidVolume: 1_482,
  totalAskVolume: 2_100,
  fillRate: 70.6,
  countdownSecs: 4 * 3600 + 22 * 60 + 18,
  minBid: 0.9400,
  maxBid: 0.9950,
};

// ─── Bid depth (buy side) ──────────────────────────────────────

export const bidLevels: BidLevel[] = [
  { price: 0.9720, volumeSol: 184, cumVolume: 184, barPercent: 18, isClear: true },
  { price: 0.9712, volumeSol: 312, cumVolume: 496, barPercent: 47, isClear: true },
  { price: 0.9700, volumeSol: 346, cumVolume: 842, barPercent: 80, isClear: false },
  { price: 0.9688, volumeSol: 228, cumVolume: 1070, barPercent: 64, isClear: false },
  { price: 0.9670, volumeSol: 198, cumVolume: 1268, barPercent: 56, isClear: false },
  { price: 0.9650, volumeSol: 214, cumVolume: 1482, barPercent: 60, isClear: false },
];

// ─── Ask depth (sell side) ─────────────────────────────────────

export const askLevels: AskLevel[] = [
  { price: 0.9714, volumeSol: 290, cumVolume: 290, barPercent: 28 },
  { price: 0.9730, volumeSol: 410, cumVolume: 700, barPercent: 39 },
  { price: 0.9750, volumeSol: 380, cumVolume: 1080, barPercent: 36 },
  { price: 0.9770, volumeSol: 520, cumVolume: 1600, barPercent: 49 },
  { price: 0.9800, volumeSol: 500, cumVolume: 2100, barPercent: 47 },
];

// ─── Live order book ───────────────────────────────────────────

export const orderBook: OrderBookEntry[] = [
  { side: 'sell', price: 0.9800, volumeSol: 500, filled: 0, wallet: 'Ax7R…f2Kq', timeAgo: '1m' },
  { side: 'sell', price: 0.9770, volumeSol: 520, filled: 0, wallet: '3mZp…h9Wd', timeAgo: '2m' },
  { side: 'sell', price: 0.9750, volumeSol: 380, filled: 0.3, wallet: 'Fq4N…bR8s', timeAgo: '3m' },
  { side: 'sell', price: 0.9730, volumeSol: 410, filled: 0.55, wallet: '9KsL…mT2v', timeAgo: '5m' },
  { side: 'sell', price: 0.9714, volumeSol: 290, filled: 0.9, wallet: 'Rw2J…cQ6n', timeAgo: '7m' },
  // ── clearing price line ──
  { side: 'buy', price: 0.9712, volumeSol: 312, filled: 1, wallet: 'Yx8P…dS4k', timeAgo: '8m' },
  { side: 'buy', price: 0.9700, volumeSol: 346, filled: 0.8, wallet: 'Lk3C…eV7j', timeAgo: '9m' },
  { side: 'buy', price: 0.9688, volumeSol: 228, filled: 0.5, wallet: 'Nm6T…fU5i', timeAgo: '11m' },
  { side: 'buy', price: 0.9670, volumeSol: 198, filled: 0, wallet: 'Pg5W…gX3h', timeAgo: '14m' },
  { side: 'buy', price: 0.9650, volumeSol: 214, filled: 0, wallet: 'Qh4V…hY2g', timeAgo: '18m' },
];

// ─── Trade history ─────────────────────────────────────────────

export const tradeHistory: TradeHistoryEntry[] = [
  { id: '1', side: 'buy', tokenType: 'PT', amount: 42.0, price: 0.9712, valueSol: 40.79, wallet: 'Yx8P…dS4k', txHash: '5xKq…R4mn', timestamp: '14:02:18' },
  { id: '2', side: 'sell', tokenType: 'YT', amount: 80.5, price: 0.0198, valueSol: 1.59, wallet: 'Ax7R…f2Kq', txHash: '8mNp…Q7vr', timestamp: '13:55:41' },
  { id: '3', side: 'buy', tokenType: 'YT', amount: 210.0, price: 0.0203, valueSol: 4.26, wallet: 'Lk3C…eV7j', txHash: '2pHs…T1bw', timestamp: '13:47:09' },
  { id: '4', side: 'buy', tokenType: 'PT', amount: 96.2, price: 0.9708, valueSol: 93.39, wallet: 'Nm6T…fU5i', txHash: '7rGt…K9cx', timestamp: '13:33:22' },
  { id: '5', side: 'sell', tokenType: 'PT', amount: 55.0, price: 0.9695, valueSol: 53.32, wallet: 'Pg5W…gX3h', txHash: '3sJu…L8dy', timestamp: '13:21:57' },
  { id: '6', side: 'buy', tokenType: 'YT', amount: 500.0, price: 0.0195, valueSol: 9.75, wallet: 'Fq4N…bR8s', txHash: '1tKv…M7ez', timestamp: '13:08:34' },
  { id: '7', side: 'buy', tokenType: 'PT', amount: 128.4, price: 0.9680, valueSol: 124.29, wallet: 'Qh4V…hY2g', txHash: '6uLw…N6fa', timestamp: '12:54:10' },
  { id: '8', side: 'sell', tokenType: 'YT', amount: 340.0, price: 0.0190, valueSol: 6.46, wallet: 'Rw2J…cQ6n', txHash: '4vMx…O5gb', timestamp: '12:41:48' },
];

// ─── Past auction rounds ───────────────────────────────────────

export const pastAuctions: PastAuction[] = [
  { round: 13, date: 'Apr 9, 2025', underlying: 'jitoSOL', clearingPrice: 0.9688, impliedYield: 8.10, volumeSol: 1_240, fillRate: 65.2, status: 'settled' },
  { round: 12, date: 'Apr 2, 2025', underlying: 'jitoSOL', clearingPrice: 0.9665, impliedYield: 8.42, volumeSol: 1_580, fillRate: 72.4, status: 'settled' },
  { round: 11, date: 'Mar 26, 2025', underlying: 'mSOL', clearingPrice: 0.9710, impliedYield: 7.76, volumeSol: 980, fillRate: 58.8, status: 'settled' },
  { round: 10, date: 'Mar 19, 2025', underlying: 'jitoSOL', clearingPrice: 0.9631, impliedYield: 9.04, volumeSol: 2_110, fillRate: 88.2, status: 'settled' },
  { round: 9, date: 'Mar 12, 2025', underlying: 'bSOL', clearingPrice: 0.9720, impliedYield: 7.51, volumeSol: 740, fillRate: 51.3, status: 'settled' },
  { round: 8, date: 'Mar 5, 2025', underlying: 'jitoSOL', clearingPrice: 0.9590, impliedYield: 9.88, volumeSol: 1_890, fillRate: 79.6, status: 'settled' },
];

// ─── Implied yield history (sparkline data) ────────────────────
// [round, impliedYield]
export const yieldHistory: [number, number][] = [
  [8, 9.88],
  [9, 7.51],
  [10, 9.04],
  [11, 7.76],
  [12, 8.42],
  [13, 8.10],
  [14, 7.84],
];

// ─── Unified AuctionDetail (active + settled share the same shape) ─

export interface AuctionDetail extends ActiveAuction {
  // Settled-round fields (null when active)
  settledDate: string | null;
  finalVolume: number | null;
}

// ─── All auctions keyed by round number (used for [auctionId] lookup) ─

export const allAuctions: Record<number, AuctionDetail> = {
  14: {
    ...activeAuction,
    settledDate: null,
    finalVolume: null,
  },
  13: {
    round: 13, status: 'settled', underlying: 'jitoSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 89,
    clearingPrice: 0.9688, parValue: 1.0, discountPct: -3.12,
    impliedYield: 8.10, totalBidVolume: 1_240, totalAskVolume: 1_900,
    fillRate: 65.2, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Apr 9, 2025', finalVolume: 1_240,
  },
  12: {
    round: 12, status: 'settled', underlying: 'jitoSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 96,
    clearingPrice: 0.9665, parValue: 1.0, discountPct: -3.35,
    impliedYield: 8.42, totalBidVolume: 1_580, totalAskVolume: 2_184,
    fillRate: 72.4, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Apr 2, 2025', finalVolume: 1_580,
  },
  11: {
    round: 11, status: 'settled', underlying: 'mSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 103,
    clearingPrice: 0.9710, parValue: 1.0, discountPct: -2.90,
    impliedYield: 7.76, totalBidVolume: 980, totalAskVolume: 1_667,
    fillRate: 58.8, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Mar 26, 2025', finalVolume: 980,
  },
  10: {
    round: 10, status: 'settled', underlying: 'jitoSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 110,
    clearingPrice: 0.9631, parValue: 1.0, discountPct: -3.69,
    impliedYield: 9.04, totalBidVolume: 2_110, totalAskVolume: 2_392,
    fillRate: 88.2, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Mar 19, 2025', finalVolume: 2_110,
  },
  9: {
    round: 9, status: 'settled', underlying: 'bSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 117,
    clearingPrice: 0.9720, parValue: 1.0, discountPct: -2.80,
    impliedYield: 7.51, totalBidVolume: 740, totalAskVolume: 1_443,
    fillRate: 51.3, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Mar 12, 2025', finalVolume: 740,
  },
  8: {
    round: 8, status: 'settled', underlying: 'jitoSOL',
    maturityDate: 'Jun 30, 2025', daysToMaturity: 124,
    clearingPrice: 0.9590, parValue: 1.0, discountPct: -4.10,
    impliedYield: 9.88, totalBidVolume: 1_890, totalAskVolume: 2_374,
    fillRate: 79.6, countdownSecs: 0, minBid: 0.9400, maxBid: 0.9950,
    settledDate: 'Mar 5, 2025', finalVolume: 1_890,
  },
};

// Sorted list for the index page (newest first)
export const allAuctionsSorted: AuctionDetail[] = Object.values(allAuctions)
  .sort((a, b) => b.round - a.round);

/**
 * Resolve an auctionId URL param to an AuctionDetail.
 * Accepts:
 *   "14"        → round 14 (numeric round number)
 *   "latest"    → the active/most recent round
 *
 * Returns null if the ID is invalid — page should render a 404/not-found state.
 */
export function getAuctionById(id: string): AuctionDetail | null {
  if (id === 'latest') {
    return allAuctions[14] ?? null;
  }
  const round = parseInt(id, 10);
  if (isNaN(round)) return null;
  return allAuctions[round] ?? null;
}

// ─── Formatters (augment those in data.ts) ─────────────────────

export function fmtPrice(n: number): string {
  return n.toFixed(4);
}

export function fmtSol(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function fmtPct(n: number): string {
  return n.toFixed(2) + '%';
}

export function fmtWallet(s: string): string {
  return s;
}