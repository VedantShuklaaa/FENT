// lib/data.ts
// Central mock data + TypeScript types for the dashboard.
// Replace with real on-chain/API calls in production.

export interface LSTPosition {
  symbol: string;
  name: string;
  color: string;
  holdings: number;
  valueUsd: number;
  yieldSource: string;
  weight: number;
}

export interface PTPosition {
  amount: number;
  underlying: string;
  maturityDate: string;
  daysToMaturity: number;
  impliedApy: number;
  redemptionValue: number;
  currentPrice: number;
  convergencePercent: number;
}

export interface YTPosition {
  amount: number;
  underlying: string;
  maturityDate: string;
  daysToMaturity: number;
  impliedApy: number;
  yieldAccrued: number;
  ytPrice: number;
  timeValuePercent: number;
}

export interface AuctionBidDepth {
  price: number;
  volumeSol: number;
  barPercent: number;
}

export interface AuctionFill {
  side: 'buy' | 'sell';
  tokenType: 'PT' | 'YT';
  amount: number;
  price: number;
  timeAgo: string;
}

export interface ProtocolEvent {
  type: 'yield' | 'pt' | 'auction' | 'yt' | 'stake';
  description: string;
  timeAgo: string;
}

export interface YTScenario {
  label: string;
  apy: number;
  ytPrice: number;
  pnlPercent: number | null;
}

// ─── Portfolio Summary ─────────────────────────────────────────
export const portfolioSummary = {
  totalDepositedSol:  248.40,
  totalValueUsd:      39_281,
  unrealisedUsd:      1_157,
  impliedApy:         8.34,
  daysToMaturity:     82,
  maturityDate:       'Jun 30, 2025',
  claimableSol:       3.18,
};

// ─── LST Positions ─────────────────────────────────────────────
export const lstPositions: LSTPosition[] = [
  {
    symbol:      'jitoSOL',
    name:        'Jito Liquid Staking',
    color:       '#9BC4B2',
    holdings:    112.30,
    valueUsd:    17_640,
    yieldSource: 'MEV + PoS',
    weight:      45,
  },
  {
    symbol:      'mSOL',
    name:        'Marinade Staked SOL',
    color:       '#8AAED4',
    holdings:    84.60,
    valueUsd:    13_290,
    yieldSource: 'PoS',
    weight:      34,
  },
  {
    symbol:      'bSOL',
    name:        'BlazeStake SOL',
    color:       '#B4A0D0',
    holdings:    51.50,
    valueUsd:    8_094,
    yieldSource: 'PoS',
    weight:      21,
  },
];

// ─── PT Position ───────────────────────────────────────────────
export const ptPosition: PTPosition = {
  amount:              164.20,
  underlying:          'jitoSOL',
  maturityDate:        'Jun 30, 2025',
  daysToMaturity:      82,
  impliedApy:          7.22,
  redemptionValue:     164.20,
  currentPrice:        0.9834,
  convergencePercent:  72,
};

// ─── YT Position ───────────────────────────────────────────────
export const ytPosition: YTPosition = {
  amount:           164.20,
  underlying:       'jitoSOL',
  maturityDate:     'Jun 30, 2025',
  daysToMaturity:   82,
  impliedApy:       8.34,
  yieldAccrued:     3.18,
  ytPrice:          0.0201,
  timeValuePercent: 38,
};

// ─── Auction ───────────────────────────────────────────────────
export const auctionData = {
  round:          14,
  clearingPrice:  0.9712,
  discountPct:    -2.88,
  impliedYield:   7.84,
  totalBidVolume: 1_482,
  countdownSecs:  4 * 3600 + 22 * 60 + 18,
};

export const bidDepth: AuctionBidDepth[] = [
  { price: 0.9650, volumeSol: 842, barPercent: 85 },
  { price: 0.9680, volumeSol: 614, barPercent: 62 },
  { price: 0.9710, volumeSol: 256, barPercent: 26 },
];

export const recentFills: AuctionFill[] = [
  { side: 'buy',  tokenType: 'PT', amount: 42.0,  price: 0.9712, timeAgo: '2 min ago' },
  { side: 'sell', tokenType: 'YT', amount: 80.5,  price: 0.0198, timeAgo: '9 min ago' },
  { side: 'buy',  tokenType: 'YT', amount: 210.0, price: 0.0203, timeAgo: '17 min ago' },
  { side: 'buy',  tokenType: 'PT', amount: 96.2,  price: 0.9708, timeAgo: '31 min ago' },
];

// ─── Protocol Events ───────────────────────────────────────────
export const protocolEvents: ProtocolEvent[] = [
  { type: 'yield',   description: 'Yield accrued — 0.42 jitoSOL added to position',  timeAgo: '1h ago' },
  { type: 'pt',      description: 'PT purchased — 42.0 PT @ 0.9712 jitoSOL',         timeAgo: '2h ago' },
  { type: 'auction', description: 'Auction #13 settled — clearing price 0.9688',      timeAgo: '6h ago' },
  { type: 'yt',      description: 'Position split — 122.2 LST → PT + YT',            timeAgo: '1d ago' },
  { type: 'stake',   description: 'Staked 80 SOL → jitoSOL via Jito protocol',       timeAgo: '2d ago' },
];

// ─── YT Scenarios ──────────────────────────────────────────────
export const ytScenarios: YTScenario[] = [
  { label: 'Bear',    apy: 5.00,  ytPrice: 0.0121, pnlPercent: -39.8 },
  { label: 'Current', apy: 8.34,  ytPrice: 0.0201, pnlPercent: null  },
  { label: 'Bull',    apy: 12.00, ytPrice: 0.0289, pnlPercent: 43.8  },
];

// ─── Helpers ───────────────────────────────────────────────────
export function formatSol(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatUsd(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

export function formatPct(n: number, decimals = 2): string {
  return n.toFixed(decimals) + '%';
}
