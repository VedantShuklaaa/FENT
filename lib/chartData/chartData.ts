export type TokenId = 'SOL' | 'jitoSOL' | 'mSOL' | 'bSOL';
export type TimeRange = '1D' | '7D' | '30D' | '90D';

export interface PricePoint {
    ts: number;   // unix ms
    price: number;
    vol: number;   // 24h rolling volume USD
}

export interface YieldPoint {
    ts: number;
    impliedApy: number;
    clearingPrice: number;
}

export interface TokenMeta {
    id: TokenId;
    label: string;
    color: string;   // chart line color
    current: number;   // current price USD
    change1d: number;   // % change 24h
    change7d: number;
    vol24h: number;   // USD
    mcap: number;   // USD
}

// ─── Token metadata ────────────────────────────────────────────

export const tokens: TokenMeta[] = [
    {
        id: 'SOL',
        label: 'Solana',
        color: '#4A6FA5',
        current: 157.42,
        change1d: 2.14,
        change7d: -3.82,
        vol24h: 2_840_000_000,
        mcap: 72_100_000_000,
    },
    {
        id: 'jitoSOL',
        label: 'jitoSOL',
        color: '#2A7A5C',
        current: 163.88,
        change1d: 2.21,
        change7d: -3.61,
        vol24h: 48_200_000,
        mcap: 1_420_000_000,
    },
    {
        id: 'mSOL',
        label: 'mSOL',
        color: '#8AAED4',
        current: 161.30,
        change1d: 2.09,
        change7d: -3.74,
        vol24h: 31_800_000,
        mcap: 980_000_000,
    },
    {
        id: 'bSOL',
        label: 'bSOL',
        color: '#B4A0D0',
        current: 159.76,
        change1d: 1.98,
        change7d: -3.90,
        vol24h: 18_400_000,
        mcap: 560_000_000,
    },
];

// ─── Price series generator ─────────────────────────────────────

function seed(n: number) {
    // deterministic pseudo-random from seed
    let x = Math.sin(n + 1) * 10000;
    return x - Math.floor(x);
}

function generateSeries(
    basePrice: number,
    points: number,
    intervalMs: number,
    volatility: number,
    tokenIdx: number,
): PricePoint[] {
    const now = Date.now();
    const start = now - points * intervalMs;
    const series: PricePoint[] = [];
    let price = basePrice * (0.92 + seed(tokenIdx) * 0.08);

    for (let i = 0; i < points; i++) {
        const drift = (seed(i * 7 + tokenIdx * 13) - 0.48) * volatility;
        price = Math.max(price * (1 + drift), basePrice * 0.75);
        const vol = 1_000_000 + seed(i * 3 + tokenIdx) * 5_000_000;
        series.push({ ts: start + i * intervalMs, price: +price.toFixed(4), vol: +vol.toFixed(0) });
    }

    // Snap last point to current price
    series[series.length - 1].price = basePrice;
    return series;
}

// ─── Pre-generated series for each token × range ───────────────

const CONFIGS: Record<TimeRange, { points: number; intervalMs: number; volatility: number }> = {
    '1D': { points: 96, intervalMs: 15 * 60 * 1000, volatility: 0.004 },
    '7D': { points: 168, intervalMs: 3600 * 1000, volatility: 0.007 },
    '30D': { points: 120, intervalMs: 6 * 3600 * 1000, volatility: 0.012 },
    '90D': { points: 90, intervalMs: 24 * 3600 * 1000, volatility: 0.018 },
};

export function getPriceSeries(tokenId: TokenId, range: TimeRange): PricePoint[] {
    const token = tokens.find((t) => t.id === tokenId)!;
    const cfg = CONFIGS[range];
    const idx = tokens.findIndex((t) => t.id === tokenId);
    return generateSeries(token.current, cfg.points, cfg.intervalMs, cfg.volatility, idx);
}

// ─── Implied yield series (PT price → APY) ─────────────────────

export function getYieldSeries(range: TimeRange): YieldPoint[] {
    const cfg = CONFIGS[range];
    const now = Date.now();
    const start = now - cfg.points * cfg.intervalMs;
    const series: YieldPoint[] = [];
    let apy = 8.2;

    for (let i = 0; i < cfg.points; i++) {
        const drift = (seed(i * 11 + 99) - 0.5) * 0.3;
        apy = Math.max(4, Math.min(14, apy + drift));
        const cp = +(1 - (apy / 100) * (82 / 365)).toFixed(4);
        series.push({ ts: start + i * cfg.intervalMs, impliedApy: +apy.toFixed(2), clearingPrice: cp });
    }

    return series;
}

// ─── Formatters ────────────────────────────────────────────────

export function fmtUsd(n: number): string {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPrice(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtTs(ts: number, range: TimeRange): string {
    const d = new Date(ts);
    if (range === '1D') {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}