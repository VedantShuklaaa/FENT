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
            <div className="min-h-full bg-[var(--color-bg-base)]">
                <div className="flex max-w-[480px] flex-col items-start gap-[10px] px-10 py-16">
                    <p className="font-[var(--font-mono)] text-[11px] tracking-[0.08em] text-[var(--color-text-tertiary)]">
                        404
                    </p>
                    <p className="text-[22px] font-medium leading-[1.2] text-[var(--color-text-primary)]">
                        Auction not found
                    </p>
                    <p className={`text-[13px] leading-[1.6] text-(--color-text-secondary)`}>
                        Round <code className={`rounded-[3px] bg-(--color-bg-muted) px-[5px] py-[1px] font-(--font-mono) text-[12px]`}>#{auctionId}</code> does not exist or has not been indexed yet.
                    </p>
                    <Link href="/auctions" className="mt-2 font-[var(--font-sans)] text-[12px] text-(--color-accent) no-underline">
                        ← All auctions
                    </Link>
                </div>
            </div >
        );
    }

    const isLive = auction.status === 'active';
    const prevRound = allAuctionsSorted.find((a: any) => a.round === auction.round - 1);
    const nextRound = allAuctionsSorted.find((a: any) => a.round === auction.round + 1);

    return (
        <div className="min-h-full bg-[var(--color-bg-base)]">
            {/* ── Breadcrumb + round navigator ─────────────────────── */}
            <div className="flex items-center justify-between gap-4 border-b-[var(--border)] bg-[var(--color-bg-surface)] px-6 py-[10px]">
                <div className="flex items-center gap-[6px]">
                    <Link href="/auctions" className="font-[var(--font-sans)] text-[12px] text-[var(--color-text-tertiary)] no-underline">
                        Auctions
                    </Link>
                    <span className="text-[12px] text-[var(--color-text-tertiary)]">/</span>
                    <span className="flex items-center gap-2 font-[var(--font-sans)] text-[12px] font-medium text-[var(--color-text-primary)]">
                        Round #{auction.round}
                        {isLive && (
                            <span className="inline-flex items-center gap-[5px] rounded-[3px] border-[0.5px] border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-[7px] py-[2px] font-[var(--font-mono)] text-[9px] uppercase tracking-[0.07em] text-[var(--color-accent-text)]">
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--color-accent)]" />
                                Live
                            </span>
                        )}
                    </span>
                </div>

                {/* Prev / Next round navigation */}
                <div className="flex items-center gap-1">
                    {prevRound ? (
                        <Link
                            href={`/auctions/${prevRound.round}`}
                            className="rounded-[var(--radius-md)] border-[var(--border-md)] bg-[var(--color-bg-subtle)] px-[10px] py-[4px] font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)] no-underline transition-[background] duration-[120ms]"
                        >
                            ← #{prevRound.round}
                        </Link>
                    ) : (
                        <span className="px-[10px] py-[4px] font-[var(--font-mono)] text-[11px] text-[var(--color-text-tertiary)] opacity-40">
                            ← Prev
                        </span>
                    )}

                    <span className="mx-[2px] h-[14px] w-px bg-[var(--color-border-soft)]" />

                    {nextRound ? (
                        <Link
                            href={`/auctions/${nextRound.round}`}
                            className="rounded-[var(--radius-md)] border-[var(--border-md)] bg-[var(--color-bg-subtle)] px-[10px] py-[4px] font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)] no-underline transition-[background] duration-[120ms]"
                        >
                            #{nextRound.round} →
                        </Link>
                    ) : (
                        <span className="px-[10px] py-[4px] font-[var(--font-mono)] text-[11px] text-[var(--color-text-tertiary)] opacity-40">
                            Next →
                        </span>
                    )}
                </div>
            </div>

            {/* ── 6-stat summary strip ──────────────────────────────── */}
            <AuctionHero auction={auction} />

            {/* ── Settled banner for non-active rounds ─────────────── */}
            {!isLive && (
                <div className="flex flex-wrap items-center gap-3 border-b-[var(--border)] bg-[var(--color-bg-subtle)] px-6 py-[10px]">
                    <span className="shrink-0 font-[var(--font-mono)] text-[12px] text-[var(--color-text-tertiary)]">
                        ✓
                    </span>
                    <span className="min-w-[200px] flex-1 text-[11px] leading-[1.6] text-[var(--color-text-secondary)]">
                        This auction settled on <strong>{auction.settledDate}</strong> at a clearing price of{' '}
                        <strong>
                            {fmtPrice(auction.clearingPrice)} {auction.underlying}
                        </strong>{' '}
                        ({fmtPct(auction.impliedYield)} implied APY). Data below is read-only.
                    </span>
                    <Link href="/auctions/latest" className="shrink-0 whitespace-nowrap font-[var(--font-sans)] text-[11px] text-[var(--color-accent)] no-underline">
                        Go to active round →
                    </Link>
                </div>
            )}

            <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-5">
                {/* ── Row 1: Order book + Bid form (bid form hidden if settled) ─ */}
                <div className="flex items-start gap-4">
                    <div className="flex min-w-0 flex-[2] flex-col">
                        <OrderBook />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                        {isLive ? <BidForm /> : <SettledSidebar round={auction.round} />}
                    </div>
                </div>

                {/* ── Row 2: My orders (only shown for active rounds) ───── */}
                {isLive && <MyAuctionOrders />}

                {/* ── Row 3: Trade history + Mechanics ─────────────────── */}
                <div className="flex items-start gap-4">
                    <div className="flex min-w-0 flex-[3] flex-col">
                        <TradeHistory />
                    </div>
                    <div className="flex min-w-0 flex-[2] flex-col">
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
        <div className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--border)] bg-[var(--color-bg-surface)]">
            <div className="border-b-[var(--border)] px-4 pb-[11px] pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--color-text-secondary)]">
                    Round #{round} — Settled
                </p>
            </div>
            <div className="flex flex-col gap-3 p-4">
                <p className="text-[12px] leading-[1.65] text-[var(--color-text-secondary)]">
                    This round has closed. Winning bids were filled at the clearing price. Unfilled bids were returned to their wallets on-chain.
                </p>
                <Link href="/auctions/latest" className="block rounded-[var(--radius-md)] bg-[var(--color-accent)] px-[14px] py-[9px] text-center font-[var(--font-sans)] text-[12px] font-medium tracking-[0.01em] text-[#E8F5F0] no-underline">
                    Bid on active round →
                </Link>
                <Link href="/auctions" className="block rounded-[var(--radius-md)] border-[var(--border-md)] px-[14px] py-[8px] text-center font-[var(--font-sans)] text-[12px] text-[var(--color-text-secondary)] no-underline">
                    View all rounds
                </Link>
            </div>
        </div>
    );
}

