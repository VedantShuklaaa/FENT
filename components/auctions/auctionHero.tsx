'use client';
import React, { useState, useEffect } from 'react';
import { AuctionDetail, fmtPrice, fmtSol, fmtPct } from '@/lib/auctionData/auctionData';

function useCountdown(initialSeconds: number) {
    const [secs, setSecs] = useState(initialSeconds);

    useEffect(() => {
        if (initialSeconds === 0) return;
        const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [initialSeconds]);

    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
}

interface StatCellProps {
    label: string;
    value: React.ReactNode;
    sub?: string;
    subColor?: string;
    last?: boolean;
}

function StatCell({ label, value, sub, subColor, last }: StatCellProps) {
    return (
        <div className={`mr-5 pr-5 ${last ? '' : '[border-right:var(--border)]'}`}>
            <p className="mb-[5px] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                {label}
            </p>

            <p className="font-[var(--font-mono)] text-[18px] font-medium leading-[1.2] tabular-nums text-[var(--color-text-primary)]">
                {value}
            </p>

            {sub && (
                <p
                    className="mt-[2px] text-[11px] text-[var(--color-text-tertiary)]"
                    style={subColor ? { color: subColor } : undefined}
                >
                    {sub}
                </p>
            )}
        </div>
    );
}

interface AuctionHeroProps {
    auction: AuctionDetail;
}

export default function AuctionHero({ auction }: AuctionHeroProps) {
    const cd = useCountdown(auction.countdownSecs);
    const isLive = auction.status === 'active';

    return (
        <section
            className="grid grid-cols-6 border-b-[var(--border)] bg-[var(--color-bg-surface)] px-6 py-4"
            aria-label="Auction overview"
        >
            <StatCell
                label="Round"
                value={
                    <span className="flex items-center gap-2">
                        <span className="font-[var(--font-mono)] tabular-nums">#{auction.round}</span>

                        <span
                            className="inline-flex items-center gap-[5px] rounded-[3px] px-[7px] py-[2px] font-[var(--font-mono)] text-[9px] uppercase tracking-[0.07em]"
                            style={{
                                background: isLive ? 'var(--color-accent-bg)' : 'var(--color-bg-muted)',
                                color: isLive ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
                                border: isLive
                                    ? '0.5px solid var(--color-accent-border)'
                                    : '0.5px solid var(--color-border-soft)',
                            }}
                        >
                            {isLive && (
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--color-accent)]" />
                            )}
                            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                        </span>
                    </span>
                }
                sub={`${auction.underlying} · Matures ${auction.maturityDate}`}
            />

            <StatCell
                label="Clearing Price"
                value={
                    <span className="font-[var(--font-mono)] tabular-nums">
                        {fmtPrice(auction.clearingPrice)}
                    </span>
                }
                sub={`${auction.underlying} per PT`}
            />

            <StatCell
                label="Discount to Par"
                value={
                    <span className="font-[var(--font-mono)] tabular-nums text-[var(--color-positive)]">
                        {fmtPct(auction.discountPct)}
                    </span>
                }
                sub={`${fmtPct(auction.impliedYield)} implied APY`}
                subColor="var(--color-positive)"
            />

            <StatCell
                label="Bid Volume"
                value={
                    <span className="font-[var(--font-mono)] tabular-nums">
                        {fmtSol(auction.totalBidVolume)} SOL
                    </span>
                }
                sub={`of ${fmtSol(auction.totalAskVolume)} SOL supply`}
            />

            <StatCell
                label="Supply Filled"
                value={
                    <span className="font-[var(--font-mono)] tabular-nums">
                        {fmtPct(auction.fillRate)}
                    </span>
                }
                sub={`${fmtSol(auction.totalBidVolume)} / ${fmtSol(auction.totalAskVolume)} SOL`}
            />

            <StatCell
                label={isLive ? 'Round Closes In' : 'Settled'}
                value={
                    isLive ? (
                        <span
                            className="font-[var(--font-mono)] tabular-nums tracking-[0.05em]"
                            aria-live="polite"
                        >
                            {cd}
                        </span>
                    ) : (
                        <span className="font-[var(--font-mono)] tabular-nums">
                            {auction.settledDate ?? '—'}
                        </span>
                    )
                }
                sub={`${auction.daysToMaturity} days to maturity`}
                last
            />
        </section>
    );
}