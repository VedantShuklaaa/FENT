'use client';
import React from 'react';
import Link from 'next/link';
import { allAuctionsSorted, fmtPrice, fmtPct, fmtSol } from '@/lib/auctionData/auctionData';

export default function Page() {
    const active = allAuctionsSorted.filter((a: any) => a.status === 'active');
    const settled = allAuctionsSorted.filter((a: any) => a.status !== 'active');

    return (
        <div style={s.root}>

            {/* ── Page header ───────────────────────────────────────── */}
            <div style={s.pageHeader}>
                <div>
                    <h1 style={s.pageTitle}>Auctions</h1>
                    <p style={s.pageSubtitle}>
                        On-chain price discovery for PT and YT positions.
                        Each round settles at a uniform clearing price.
                    </p>
                </div>
                {active[0] && (
                    <Link href={`/auctions/${active[0].round}`} style={s.activeCta}>
                        Join active round #{active[0].round} →
                    </Link>
                )}
            </div>

            <div style={s.content}>

                {/* ── Active round card ────────────────────────────────── */}
                {active.map((a: any) => (
                    <Link key={a.round} href={`/auctions/${a.round}`} style={s.activeCard}>
                        <div style={s.activeCardLeft}>
                            <div style={s.activeCardRound}>
                                <span style={s.livePill}>
                                    <span style={s.liveDot} />
                                    Live
                                </span>
                                <span style={s.activeRoundNum}>Round #{a.round}</span>
                            </div>
                            <p style={s.activeCardSub}>
                                {a.underlying} · Matures {a.maturityDate} · {a.daysToMaturity} days
                            </p>
                        </div>
                        <div style={s.activeCardStats}>
                            <div style={s.activeStat}>
                                <span style={s.activeStatLabel}>Clearing Price</span>
                                <span style={s.activeStatValue}>{fmtPrice(a.clearingPrice)}</span>
                            </div>
                            <div style={s.activeStat}>
                                <span style={s.activeStatLabel}>Implied APY</span>
                                <span style={{ ...s.activeStatValue, color: 'var(--color-positive)' }}>
                                    {fmtPct(a.impliedYield)}
                                </span>
                            </div>
                            <div style={s.activeStat}>
                                <span style={s.activeStatLabel}>Bid Volume</span>
                                <span style={s.activeStatValue}>{fmtSol(a.totalBidVolume)} SOL</span>
                            </div>
                            <div style={s.activeStat}>
                                <span style={s.activeStatLabel}>Fill Rate</span>
                                <span style={s.activeStatValue}>{fmtPct(a.fillRate)}</span>
                            </div>
                        </div>
                        <span style={s.activeCardArrow}>→</span>
                    </Link>
                ))}

                {/* ── Settled rounds table ─────────────────────────────── */}
                <div style={s.panel}>
                    <div style={s.panelHeader}>
                        <span style={s.panelTitle}>Settled Rounds</span>
                        <span style={s.panelCount}>{settled.length} rounds</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {['Round', 'Date', 'Underlying', 'Clearing Price', 'Implied APY', 'Volume', 'Fill Rate', ''].map((h, i) => (
                                        <th key={`${h}-${i}`} style={{ ...s.th, ...(i > 1 ? s.thRight : {}) }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {settled.map((p: any) => (
                                    <tr key={p.round} className="auction-row" style={s.row}>
                                        <td style={s.td}>
                                            <span style={s.roundNum}>#{p.round}</span>
                                        </td>
                                        <td style={{ ...s.td, color: 'var(--color-text-tertiary)' }}>{p.settledDate}</td>
                                        <td style={{ ...s.td, ...s.tdRight }}>
                                            <span style={s.underlying}>{p.underlying}</span>
                                        </td>
                                        <td style={{ ...s.td, ...s.tdRight }}>{fmtPrice(p.clearingPrice)}</td>
                                        <td style={{ ...s.td, ...s.tdRight }}>{fmtPct(p.impliedYield)}</td>
                                        <td style={{ ...s.td, ...s.tdRight }}>{fmtSol(p.totalBidVolume)} SOL</td>
                                        <td style={{ ...s.td, ...s.tdRight }}>
                                            <div style={s.fillCell}>
                                                <div style={s.fillTrack}>
                                                    <div style={{ ...s.fillBar, width: `${p.fillRate}%` }} />
                                                </div>
                                                <span>{fmtPct(p.fillRate)}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...s.td, ...s.tdRight }}>
                                            <Link href={`/auctions/${p.round}`} style={s.viewLink}>
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <style>{`.auction-row:hover td { background: var(--color-bg-subtle); }`}</style>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    root: { minHeight: '100%', background: 'var(--color-bg-base)' },

    pageHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 20,
        padding: '24px 24px 20px',
        background: 'var(--color-bg-surface)',
        borderBottom: 'var(--border)',
        flexWrap: 'wrap' as const,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        lineHeight: 1.2,
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
        lineHeight: 1.6,
        maxWidth: 420,
    },
    activeCta: {
        display: 'flex',
        alignSelf: 'flex-start',
        padding: '8px 16px',
        background: 'var(--color-accent)',
        color: '#E8F5F0',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 500,
        textDecoration: 'none',
        letterSpacing: '0.01em',
        flexShrink: 0,
    },

    content: {
        padding: '20px 24px',
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },

    // ── Active round card ─────────────────────────────────────
    activeCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '16px 20px',
        background: 'var(--color-bg-surface)',
        border: '0.5px solid var(--color-accent-border)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        transition: 'background 0.12s',
        flexWrap: 'wrap' as const,
    },
    activeCardLeft: { flex: 1, minWidth: 180 },
    activeCardRound: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    activeRoundNum: {
        fontFamily: 'var(--font-mono)',
        fontSize: 16,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
    },
    activeCardSub: {
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
    },
    activeCardStats: {
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap' as const,
    },
    activeStat: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
    },
    activeStatLabel: {
        fontSize: 9,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-text-tertiary)',
    },
    activeStatValue: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        fontVariantNumeric: 'tabular-nums',
    },
    activeCardArrow: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--color-accent)',
        flexShrink: 0,
    },
    livePill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.07em',
        textTransform: 'uppercase' as const,
        padding: '2px 7px',
        borderRadius: 3,
        background: 'var(--color-accent-bg)',
        color: 'var(--color-accent-text)',
        border: '0.5px solid var(--color-accent-border)',
    },
    liveDot: {
        width: 5, height: 5, borderRadius: '50%',
        background: 'var(--color-accent)', flexShrink: 0,
    },

    // ── Panel ─────────────────────────────────────────────────
    panel: {
        background: 'var(--color-bg-surface)',
        border: 'var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
    },
    panelHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px 11px',
        borderBottom: 'var(--border)',
    },
    panelTitle: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-text-secondary)',
    },
    panelCount: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
    },

    // ── Table ─────────────────────────────────────────────────
    table: { width: '100%', borderCollapse: 'collapse', minWidth: 560 },
    th: {
        fontSize: 9, letterSpacing: '0.07em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-text-tertiary)', fontWeight: 400,
        padding: '7px 16px', borderBottom: 'var(--border)',
        textAlign: 'left', background: 'var(--color-bg-subtle)',
        whiteSpace: 'nowrap' as const,
    },
    thRight: { textAlign: 'right' as const },
    row: { cursor: 'pointer' },
    td: {
        padding: '9px 16px', fontSize: 11, borderBottom: 'var(--border)',
        fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
        color: 'var(--color-text-primary)', verticalAlign: 'middle',
        transition: 'background 0.1s', whiteSpace: 'nowrap' as const,
    },
    tdRight: { textAlign: 'right' as const },
    roundNum: { fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--color-text-primary)' },
    underlying: {
        fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px',
        borderRadius: 3, background: 'var(--color-bg-muted)',
        color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-soft)',
    },
    fillCell: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
    fillTrack: { width: 44, height: 3, background: 'var(--color-bg-muted)', borderRadius: 2, overflow: 'hidden' },
    fillBar: { height: '100%', background: 'var(--color-pt-fill)', borderRadius: 2, opacity: 0.6 },
    viewLink: {
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--color-accent)', textDecoration: 'none',
    },
};