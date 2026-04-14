export type PositionType   = 'PT' | 'YT' | 'LST';
export type PositionStatus = 'active' | 'matured' | 'redeemable';

export interface Position {
  id:             string;
  type:           PositionType;
  underlying:     string;
  underlyingColor: string;
  amount:         number;
  valueUsd:       number;
  maturityDate:   string;
  daysToMaturity: number;
  impliedApy:     number;
  // PT-specific
  currentPrice?:  number;
  redemptionValue?: number;
  convergePct?:   number;
  // YT-specific
  yieldAccrued?:  number;
  timeValuePct?:  number;
  status:         PositionStatus;
}

export type ActivityType = 'stake' | 'split' | 'buy_pt' | 'buy_yt' | 'sell_pt' | 'sell_yt' | 'redeem' | 'yield';

export interface ActivityEntry {
  id:        string;
  type:      ActivityType;
  label:     string;
  amount:    string;
  txHash:    string;
  timestamp: string;
}

// ─── Summary ────────────────────────────────────────────────────

export const positionsSummary = {
  totalValueUsd:  39_281,
  totalPtSol:     290.40,
  totalYtSol:     164.20,
  claimableSol:   3.18,
  nextMaturity:   'Jun 30, 2025',
};

// ─── Positions ──────────────────────────────────────────────────

export const positions: Position[] = [
  {
    id:             'pt-jito-1',
    type:           'PT',
    underlying:     'jitoSOL',
    underlyingColor: '#9BC4B2',
    amount:         164.20,
    valueUsd:       25_214,
    maturityDate:   'Jun 30, 2025',
    daysToMaturity: 82,
    impliedApy:     7.22,
    currentPrice:   0.9834,
    redemptionValue: 164.20,
    convergePct:    72,
    status:         'active',
  },
  {
    id:             'pt-msol-1',
    type:           'PT',
    underlying:     'mSOL',
    underlyingColor: '#8AAED4',
    amount:         126.20,
    valueUsd:       19_110,
    maturityDate:   'Sep 30, 2025',
    daysToMaturity: 174,
    impliedApy:     6.88,
    currentPrice:   0.9671,
    redemptionValue: 126.20,
    convergePct:    41,
    status:         'active',
  },
  {
    id:             'yt-jito-1',
    type:           'YT',
    underlying:     'jitoSOL',
    underlyingColor: '#9BC4B2',
    amount:         164.20,
    valueUsd:       3_300,
    maturityDate:   'Jun 30, 2025',
    daysToMaturity: 82,
    impliedApy:     8.34,
    yieldAccrued:   3.18,
    timeValuePct:   38,
    status:         'active',
  },
  {
    id:             'pt-jito-old',
    type:           'PT',
    underlying:     'jitoSOL',
    underlyingColor: '#9BC4B2',
    amount:         80.00,
    valueUsd:       80 * 157.4,
    maturityDate:   'Mar 31, 2025',
    daysToMaturity: 0,
    impliedApy:     0,
    currentPrice:   1.0000,
    redemptionValue: 80.00,
    convergePct:    100,
    status:         'redeemable',
  },
];

// ─── Activity ────────────────────────────────────────────────────

export const activityLog: ActivityEntry[] = [
  { id: 'a1', type: 'yield',   label: 'Yield accrued',  amount: '+0.42 jitoSOL', txHash: '5xKq…R4mn', timestamp: '1h ago'  },
  { id: 'a2', type: 'buy_pt',  label: 'PT purchased',   amount: '42.0 PT',       txHash: '8mNp…Q7vr', timestamp: '2h ago'  },
  { id: 'a3', type: 'split',   label: 'Position split',  amount: '122.2 jitoSOL', txHash: '2pHs…T1bw', timestamp: '6h ago'  },
  { id: 'a4', type: 'stake',   label: 'SOL staked',     amount: '80 SOL',        txHash: '7rGt…K9cx', timestamp: '1d ago'  },
  { id: 'a5', type: 'buy_yt',  label: 'YT purchased',   amount: '164.2 YT',      txHash: '3sJu…L8dy', timestamp: '1d ago'  },
  { id: 'a6', type: 'redeem',  label: 'PT redeemed',    amount: '40.0 PT',       txHash: '1tKv…M7ez', timestamp: '3d ago'  },
];

// ─── Activity dot colours ────────────────────────────────────────

export const activityColors: Record<ActivityType, string> = {
  stake:    'var(--color-accent)',
  split:    'var(--color-text-tertiary)',
  buy_pt:   'var(--color-pt-fill)',
  buy_yt:   'var(--color-yt-fill)',
  sell_pt:  'var(--color-pt-fill)',
  sell_yt:  'var(--color-yt-fill)',
  redeem:   'var(--color-accent)',
  yield:    'var(--color-accent)',
};