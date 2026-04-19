'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MarketingNav from '@/components/marketing/marketingNav';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';

// ─── Mock market data ─────────────────────────────────────────────
type MarketStatus = 'active' | 'auction-live' | 'settled';
interface Market {
    id: string;
    underlying: string;
    underlyingColor: string;
    maturityDate: string;
    daysToMaturity: number;
    impliedApy: number;
    totalTvlSol: number;
    ptPrice: number;
    ytPrice: number;
    status: MarketStatus;
    auctionRound?: number;
    yieldHistory: number[]; // last 7 data points for sparkline
}

const MARKETS: Market[] = [
    { id: 'm1', underlying: 'jitoSOL', underlyingColor: '#9BC4B2', maturityDate: 'Jun 30, 2025', daysToMaturity: 82, impliedApy: 7.84, totalTvlSol: 18_420, ptPrice: 0.9712, ytPrice: 0.0201, status: 'auction-live', auctionRound: 14, yieldHistory: [8.1, 8.4, 7.9, 8.0, 7.8, 8.1, 7.84] },
    { id: 'm2', underlying: 'mSOL', underlyingColor: '#8AAED4', maturityDate: 'Jun 30, 2025', daysToMaturity: 82, impliedApy: 7.52, totalTvlSol: 9_810, ptPrice: 0.9730, ytPrice: 0.0188, status: 'active', yieldHistory: [7.8, 7.6, 7.5, 7.7, 7.4, 7.5, 7.52] },
    { id: 'm3', underlying: 'bSOL', underlyingColor: '#B4A0D0', maturityDate: 'Jun 30, 2025', daysToMaturity: 82, impliedApy: 7.21, totalTvlSol: 5_340, ptPrice: 0.9745, ytPrice: 0.0174, status: 'active', yieldHistory: [7.3, 7.2, 7.0, 7.2, 7.3, 7.1, 7.21] },
    { id: 'm4', underlying: 'jitoSOL', underlyingColor: '#9BC4B2', maturityDate: 'Sep 30, 2025', daysToMaturity: 174, impliedApy: 6.88, totalTvlSol: 12_300, ptPrice: 0.9671, ytPrice: 0.0289, status: 'active', yieldHistory: [6.9, 6.8, 6.9, 7.0, 6.9, 6.8, 6.88] },
    { id: 'm5', underlying: 'mSOL', underlyingColor: '#8AAED4', maturityDate: 'Mar 31, 2025', daysToMaturity: 0, impliedApy: 0, totalTvlSol: 3_200, ptPrice: 1.0000, ytPrice: 0.0000, status: 'settled', yieldHistory: [8.2, 8.1, 7.9, 8.0, 7.8, 8.0, 8.10] },
    { id: 'm6', underlying: 'jitoSOL', underlyingColor: '#9BC4B2', maturityDate: 'Dec 31, 2025', daysToMaturity: 267, impliedApy: 6.40, totalTvlSol: 6_800, ptPrice: 0.9530, ytPrice: 0.0420, status: 'active', yieldHistory: [6.3, 6.4, 6.5, 6.3, 6.4, 6.5, 6.40] },
];

// ─── SVG Sparkline ────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
    const W = 80, H = 28, PAD = 2;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((v, i) => {
        const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const lineColor = last >= prev ? color : '#A33030';

    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <polyline points={points} fill="none" stroke={lineColor} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        </svg>
    );
}

// ─── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: MarketStatus }) {
    const config = {
        'active': { label: 'Active', color: '#3DAF84', bg: 'rgba(61,175,132,0.1)' },
        'auction-live': { label: '⬤ Auction', color: '#3DAF84', bg: 'rgba(42,122,92,0.15)' },
        'settled': { label: 'Settled', color: '#5C5956', bg: 'rgba(255,255,255,0.04)' },
    }[status];

    return (
        <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 3,
            color: config.color,
            background: config.bg,
            border: `0.5px solid ${config.color}30`,
        }}>
            {config.label}
        </span>
    );
}

// ─── Mini countdown ───────────────────────────────────────────────
function Countdown({ days }: { days: number }) {
    const [secs, setSecs] = useState(days * 86400);
    useEffect(() => {
        if (days === 0) return;
        const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [days]);

    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5C5956', letterSpacing: '0.04em' }}>{d}d {h}h {m}m</span>;
}

// ─── Market card ──────────────────────────────────────────────────
function MarketCard({ market, index }: { market: Market; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <motion.div
            ref={ref}
            style={{ ...mc.card, borderColor: inView ? 'rgba(255,255,255,0.08)' : 'transparent' }}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ borderColor: `${market.underlyingColor}30`, y: -3 }}
        >
            {/* Header */}
            <div style={mc.header}>
                <div style={mc.headerLeft}>
                    <span style={{ ...mc.dot, background: market.underlyingColor }} />
                    <span style={mc.symbol}>{market.underlying}</span>
                    <span style={mc.maturity}>{market.maturityDate}</span>
                </div>
                <StatusBadge status={market.status} />
            </div>

            {/* Main metric: implied APY */}
            <div style={mc.apyRow}>
                <div>
                    <div style={mc.apyLabel}>Implied APY</div>
                    <div style={{ ...mc.apyValue, color: market.status === 'settled' ? '#5C5956' : '#F2F0EC' }}>
                        {market.status === 'settled' ? '—' : `${market.impliedApy.toFixed(2)}%`}
                    </div>
                </div>
                <Sparkline data={market.yieldHistory} color={market.underlyingColor} />
            </div>

            {/* Stats row */}
            <div style={mc.statsRow}>
                <div style={mc.stat}>
                    <div style={mc.statLabel}>PT Price</div>
                    <div style={mc.statVal}>{market.ptPrice.toFixed(4)}</div>
                </div>
                <div style={mc.stat}>
                    <div style={mc.statLabel}>TVL</div>
                    <div style={mc.statVal}>{(market.totalTvlSol / 1000).toFixed(1)}k SOL</div>
                </div>
                <div style={mc.stat}>
                    <div style={mc.statLabel}>Maturity</div>
                    <div style={mc.statVal}>
                        {market.daysToMaturity > 0 ? <Countdown days={market.daysToMaturity} /> : 'Matured'}
                    </div>
                </div>
            </div>

            {/* Action */}
            <div style={mc.footer}>
                {market.status === 'auction-live' ? (
                    <Link href={`/auction/${market.auctionRound}`} style={mc.actionPrimary}>
                        Join Auction #{market.auctionRound} →
                    </Link>
                ) : market.status === 'settled' ? (
                    <span style={mc.actionSettled}>Redeemable</span>
                ) : (
                    <Link href="/dashboard" style={mc.actionSecondary}>View Market →</Link>
                )}
            </div>
        </motion.div>
    );
}

const mc: Record<string, React.CSSProperties> = {
    card: { background: 'rgba(255,255,255,0.025)', border: '0.5px solid', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
    symbol: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: '#F2F0EC' },
    maturity: { fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5C5956', letterSpacing: '0.04em' },
    apyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 12px' },
    apyLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5C5956', marginBottom: 4 },
    apyValue: { fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },
    statsRow: { display: 'flex', gap: 0, borderTop: '0.5px solid rgba(255,255,255,0.05)', borderBottom: '0.5px solid rgba(255,255,255,0.05)' },
    stat: { flex: 1, padding: '10px 16px', borderRight: '0.5px solid rgba(255,255,255,0.05)' },
    statLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#5C5956', marginBottom: 4 },
    statVal: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#A8A49E', fontVariantNumeric: 'tabular-nums' },
    footer: { padding: '12px 16px' },
    actionPrimary: { display: 'block', textAlign: 'center', padding: '8px 0', background: '#2A7A5C', color: '#E8F5F0', borderRadius: 4, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s' },
    actionSecondary: { display: 'block', textAlign: 'center', padding: '8px 0', background: 'rgba(255,255,255,0.04)', color: '#A8A49E', borderRadius: 4, fontFamily: 'var(--font-sans)', fontSize: 12, textDecoration: 'none', transition: 'background 0.15s' },
    actionSettled: { display: 'block', textAlign: 'center', padding: '8px 0', color: '#5C5956', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em' },
};

// ─── Main explore page ────────────────────────────────────────────
type Filter = 'all' | 'jitoSOL' | 'mSOL' | 'bSOL' | 'auction-live';

export default function Page() {
    useSmoothScroll();

    const [filter, setFilter] = useState<Filter>('all');
    const headerRef = useRef<HTMLDivElement>(null);

    // GSAP hero parallax
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (headerRef.current) {
            gsap.to(headerRef.current, {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }
    }, []);

    const filtered = useMemo(() => {
        if (filter === 'all') return MARKETS;
        if (filter === 'auction-live') return MARKETS.filter((m) => m.status === 'auction-live');
        return MARKETS.filter((m) => m.underlying === filter);
    }, [filter]);

    const FILTERS: { key: Filter; label: string }[] = [
        { key: 'all', label: 'All Markets' },
        { key: 'auction-live', label: '⬤ Auction Live' },
        { key: 'jitoSOL', label: 'jitoSOL' },
        { key: 'mSOL', label: 'mSOL' },
        { key: 'bSOL', label: 'bSOL' },
    ];

    return (
        <div style={ep.root}>
            <MarketingNav activePage="explore" />

            {/* ── Page header (parallax) ───────────────────────────── */}
            <header style={ep.header} ref={headerRef}>
                <div style={ep.headerGlow} />
                <div style={ep.container}>
                    <motion.p
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3DAF84', marginBottom: 12 }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    >
                        Protocol Markets
                    </motion.p>
                    <motion.h1
                        style={{ fontFamily: 'var(--font-display, "Sora", sans-serif)', fontSize: 48, fontWeight: 700, color: '#F2F0EC', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Explore markets
                    </motion.h1>
                    <motion.p
                        style={{ fontSize: 14, color: '#A8A49E', maxWidth: 420, lineHeight: 1.7 }}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        Browse active PT/YT markets across supported liquid staking tokens.
                        Participate in auctions or split your own positions.
                    </motion.p>
                </div>
            </header>

            {/* ── Global stats bar ─────────────────────────────────── */}
            <motion.div
                style={ep.statsBar}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
                <div style={{ ...ep.container, display: 'flex', gap: 48, alignItems: 'center' }}>
                    {[
                        { label: 'Total Markets', value: `${MARKETS.length}` },
                        { label: 'Live Auctions', value: `${MARKETS.filter(m => m.status === 'auction-live').length}` },
                        { label: 'Total TVL', value: `${(MARKETS.reduce((s, m) => s + m.totalTvlSol, 0) / 1000).toFixed(1)}k SOL` },
                    ].map((s) => (
                        <div key={s.label} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: '#F2F0EC' }}>{s.value}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5C5956' }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Filter tabs ──────────────────────────────────────── */}
            <div style={ep.filterRow}>
                <div style={{ ...ep.container, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {FILTERS.map(({ key, label }) => {
                        const isActive = filter === key;
                        return (
                            <motion.button
                                key={key}
                                onClick={() => setFilter(key)}
                                style={{
                                    ...ep.filterBtn,
                                    background: isActive ? '#2A7A5C' : 'rgba(255,255,255,0.04)',
                                    color: isActive ? '#E8F5F0' : '#5C5956',
                                    borderColor: isActive ? '#2A7A5C' : 'rgba(255,255,255,0.06)',
                                }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {label}
                            </motion.button>
                        );
                    })}
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5C5956' }}>
                        {filtered.length} market{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── Markets grid ─────────────────────────────────────── */}
            <main style={ep.main}>
                <div style={ep.container}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={filter}
                            style={ep.grid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filtered.map((market, i) => (
                                <MarketCard key={market.id} market={market} index={i} />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div style={ep.empty}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#5C5956' }}>
                                No markets found for this filter.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const ep: Record<string, React.CSSProperties> = {
    root: { background: '#0D0F0E', color: '#F2F0EC', minHeight: '100vh' },
    header: { paddingTop: 120, paddingBottom: 60, position: 'relative', overflow: 'hidden' },
    headerGlow: { position: 'absolute', top: 0, right: 0, width: 500, height: 400, background: 'radial-gradient(circle at top right, rgba(42,122,92,0.1) 0%, transparent 65%)', pointerEvents: 'none' },
    container: { maxWidth: 1100, margin: '0 auto', padding: '0 32px' },
    statsBar: { borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '16px 0', background: 'rgba(255,255,255,0.01)' },
    filterRow: { padding: '16px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 56, background: '#0D0F0E', zIndex: 10, backdropFilter: 'blur(8px)' },
    filterBtn: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', padding: '5px 12px', borderRadius: 3, border: '0.5px solid', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' },
    main: { padding: '32px 0 80px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 },
    empty: { textAlign: 'center', padding: '60px 0' },
};