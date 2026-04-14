'use client';

// app/auction/[auctionId]/page.tsx
//
// Dynamic auction detail page.
// URL:  /auction/14        → round 14 (active)
//       /auction/13        → round 13 (settled)
//       /auction/latest    → alias for the current active round
//
// The auctionId param is resolved via getAuctionById() in lib/auctionData.ts.
// All child components receive the resolved AuctionDetail as a prop — no
// component imports the singleton activeAuction directly anymore.

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAuctionById, allAuctionsSorted, fmtPrice, fmtPct } from '@/lib/auctionData/auctionData';

import AuctionHero from '@/components/auctions/auctionHero';
import OrderBook from '@/components/auctions/orderBook';
import BidForm from '@/components/auctions/bidForm';
import MyAuctionOrders from '@/components/auctions/myAuctionOrders';
import TradeHistory from '@/components/auctions/tradeHistory';
import AuctionMechanics from '@/components/auctions/auctionMechanics';
import PastAuctions from '@/components/auctions/pastAuctions';

export default function Page() {
    const params = useParams();
    const auctionId = Array.isArray(params.auctionId)
        ? params.auctionId[0]
        : (params.auctionId ?? '');

    const auction = getAuctionById(auctionId);

    // ── Not found state ───────────────────────────────────────────
    if (!auction) {
        return (
            <div style={s.root}>
                <div style={s.notFound}>
                    <p style={s.notFoundCode}>404</p>
                    <p style={s.notFoundTitle}>Auction not found</p>
                    <p style={s.notFoundSub}>
                        Round <code style={s.code}>#{auctionId}</code> does not exist or has not been indexed yet.
                    </p>
                    <Link href="/auctions" style={s.backLink}>← All auctions</Link>
                </div>
            </div>
        );
    }

    const isLive = auction.status === 'active';
    const prevRound = allAuctionsSorted.find((a: any) => a.round === auction.round - 1);
    const nextRound = allAuctionsSorted.find((a: any) => a.round === auction.round + 1);

    return (
        <div style={s.root}>

            {/* ── Breadcrumb + round navigator ─────────────────────── */}
            <div style={s.topBar}>
                <div style={s.breadcrumb}>
                    <Link href="/auctions" style={s.breadcrumbLink}>Auctions</Link>
                    <span style={s.breadcrumbSep}>/</span>
                    <span style={s.breadcrumbCurrent}>
                        Round #{auction.round}
                        {isLive && <span style={s.liveBadge}><span style={s.liveDot} />Live</span>}
                    </span>
                </div>

                {/* Prev / Next round navigation */}
                <div style={s.roundNav}>
                    {prevRound ? (
                        <Link href={`/auctions/${prevRound.round}`} style={s.roundNavBtn}>
                            ← #{prevRound.round}
                        </Link>
                    ) : <span style={s.roundNavDisabled}>← Prev</span>}

                    <span style={s.roundNavDivider} />

                    {nextRound ? (
                        <Link href={`/auctions/${nextRound.round}`} style={s.roundNavBtn}>
                            #{nextRound.round} →
                        </Link>
                    ) : <span style={s.roundNavDisabled}>Next →</span>}
                </div>
            </div>

            {/* ── 6-stat summary strip ──────────────────────────────── */}
            <AuctionHero auction={auction} />

            {/* ── Settled banner for non-active rounds ─────────────── */}
            {!isLive && (
                <div style={s.settledBanner}>
                    <span style={s.settledIcon}>✓</span>
                    <span style={s.settledText}>
                        This auction settled on <strong>{auction.settledDate}</strong> at a clearing price of{' '}
                        <strong>{fmtPrice(auction.clearingPrice)} {auction.underlying}</strong> ({fmtPct(auction.impliedYield)} implied APY).
                        Data below is read-only.
                    </span>
                    {isLive === false && (
                        <Link href="/auctions/latest" style={s.settledLink}>
                            Go to active round →
                        </Link>
                    )}
                </div>
            )}

            <div style={s.content}>

                {/* ── Row 1: Order book + Bid form (bid form hidden if settled) ─ */}
                <div style={s.row}>
                    <div style={{ ...s.col, flex: 2 }}>
                        <OrderBook />
                    </div>
                    <div style={{ ...s.col, flex: 1 }}>
                        {isLive
                            ? <BidForm />
                            : <SettledSidebar round={auction.round} />
                        }
                    </div>
                </div>

                {/* ── Row 2: My orders (only shown for active rounds) ───── */}
                {isLive && <MyAuctionOrders />}

                {/* ── Row 3: Trade history + Mechanics ─────────────────── */}
                <div style={s.row}>
                    <div style={{ ...s.col, flex: 3 }}>
                        <TradeHistory />
                    </div>
                    <div style={{ ...s.col, flex: 2 }}>
                        <AuctionMechanics />
                    </div>
                </div>

                {/* ── Row 4: Past auctions ──────────────────────────────── */}
                <PastAuctions currentRound={auction.round} />

            </div>
        </div>
    );
}

// ─── Settled sidebar (replaces BidForm on settled rounds) ─────

function SettledSidebar({ 
    round 
}: { 
    round: number 
}) {
    return (
        <div style={s.settledSidebar}>
            <div style={s.settledSidebarHeader}>
                <p style={s.settledSidebarTitle}>Round #{round} — Settled</p>
            </div>
            <div style={s.settledSidebarBody}>
                <p style={s.settledSidebarNote}>
                    This round has closed. Winning bids were filled at the clearing price.
                    Unfilled bids were returned to their wallets on-chain.
                </p>
                <Link href="/auctions/latest" style={s.settledSidebarCta}>
                    Bid on active round →
                </Link>
                <Link href="/auctions" style={s.settledSidebarBack}>
                    View all rounds
                </Link>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
    root: {
        minHeight: '100%',
        background: 'var(--color-bg-base)',
    },

    // ── Top bar ─────────────────────────────────────────────────
    topBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        background: 'var(--color-bg-surface)',
        borderBottom: 'var(--border)',
        gap: 16,
    },

    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },

    breadcrumbLink: {
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
        textDecoration: 'none',
    },

    breadcrumbSep: {
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
    },

    breadcrumbCurrent: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
    },

    liveBadge: {
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
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: 'var(--color-accent)',
        flexShrink: 0,
    },

    roundNav: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },

    roundNavBtn: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        padding: '4px 10px',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-md)',
        background: 'var(--color-bg-subtle)',
        transition: 'background 0.12s',
    },

    roundNavDisabled: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        padding: '4px 10px',
        opacity: 0.4,
    },

    roundNavDivider: {
        width: 1,
        height: 14,
        background: 'var(--color-border-soft)',
        margin: '0 2px',
    },

    // ── Settled banner ──────────────────────────────────────────
    settledBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 24px',
        background: 'var(--color-bg-subtle)',
        borderBottom: 'var(--border)',
        flexWrap: 'wrap' as const,
    },

    settledIcon: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
        flexShrink: 0,
    },

    settledText: {
        flex: 1,
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
        minWidth: 200,
    },

    settledLink: {
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        color: 'var(--color-accent)',
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
        flexShrink: 0,
    },

    // ── Main content grid ───────────────────────────────────────
    content: {
        padding: '20px 24px',
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },

    row: {
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
    },

    col: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },

    // ── Not found ───────────────────────────────────────────────
    notFound: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '64px 40px',
        gap: 10,
        maxWidth: 480,
    },

    notFoundCode: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.08em',
    },

    notFoundTitle: {
        fontSize: 22,
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        lineHeight: 1.2,
    },

    notFoundSub: {
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
    },

    code: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        background: 'var(--color-bg-muted)',
        padding: '1px 5px',
        borderRadius: 3,
    },

    backLink: {
        marginTop: 8,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-accent)',
        textDecoration: 'none',
    },

    // ── Settled sidebar ─────────────────────────────────────────
    settledSidebar: {
        background: 'var(--color-bg-surface)',
        border: 'var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
    },

    settledSidebarHeader: {
        padding: '12px 16px 11px',
        borderBottom: 'var(--border)',
    },

    settledSidebarTitle: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-text-secondary)',
    },

    settledSidebarBody: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },

    settledSidebarNote: {
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        lineHeight: 1.65,
    },

    settledSidebarCta: {
        display: 'block',
        textAlign: 'center' as const,
        padding: '9px 14px',
        background: 'var(--color-accent)',
        color: '#E8F5F0',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        fontWeight: 500,
        textDecoration: 'none',
        letterSpacing: '0.01em',
    },

    settledSidebarBack: {
        display: 'block',
        textAlign: 'center' as const,
        padding: '8px 14px',
        border: 'var(--border-md)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
    },
};