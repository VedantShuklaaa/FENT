'use client';
import Link from 'next/link';
import { pastAuctions, yieldHistory, fmtPrice, fmtSol, fmtPct } from '@/lib/auctionData/auctionData';
import Panel from '@/components/dashboard/panel';

function YieldSparkline({
    data
}: {
    data: [number, number][]
}) {
    const W = 64, H = 24, PAD = 2;
    const vals = data.map(([, y]) => y);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    const points = data
        .map(([, y], i) => {
            const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
            const pct = (y - min) / range;
            const yc = H - PAD - pct * (H - PAD * 2);
            return `${x.toFixed(1)},${yc.toFixed(1)}`;
        })
        .join(' ');

    const lastVal = vals[vals.length - 1];
    const prevVal = vals[vals.length - 2];
    const color = lastVal >= prevVal ? 'var(--color-positive)' : 'var(--color-yt-fill)';

    return (
        <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="block"
        >
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
            />
        </svg>
    );
}

function StatusBadge({
    status
}: {
    status: string
}) {
    const isSettled = status === 'settled';

    return (
        <span
            className="inline-flex rounded-[3px] px-[6px] py-[2px] font-[var(--font-mono)] text-[9px] uppercase tracking-[0.06em]"
            style={{
                background: isSettled ? 'var(--color-bg-muted)' : 'var(--color-accent-bg)',
                color: isSettled ? 'var(--color-text-tertiary)' : 'var(--color-accent-text)',
                border: '0.5px solid var(--color-border-soft)',
            }}
        >
            {status}
        </span>
    );
}

interface PastAuctionsProps {
    currentRound?: number;
}

export default function PastAuctions({ currentRound }: PastAuctionsProps) {
    return (
        <>
            <style>{`.pa-row:hover td { background: var(--color-bg-subtle); }`}</style>

            <Panel title="Past Auction Rounds">
                <div className="overflow-x-auto">
                    <table className="min-w-[620px] w-full border-collapse">
                        <thead>
                            <tr>
                                {['Round', 'Date', 'Underlying', 'Clearing Price', 'Implied APY', 'Volume', 'Fill Rate', 'Status', ''].map((h, i) => (
                                    <th
                                        key={`${h}-${i}`}
                                        className={`bg-[var(--color-bg-subtle)] px-4 py-[7px] text-left text-[9px] font-normal uppercase tracking-[0.07em] whitespace-nowrap text-[var(--color-text-tertiary)] [border-bottom:var(--border)] ${i > 1 ? 'text-right' : ''}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {pastAuctions.map((p) => {
                                const isCurrent = p.round === currentRound;

                                return (
                                    <tr
                                        key={p.round}
                                        className={`pa-row cursor-default ${isCurrent ? 'bg-[var(--color-accent-bg)]' : ''}`}
                                    >
                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <span
                                                className="font-[var(--font-mono)] font-medium"
                                                style={{ color: isCurrent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                                            >
                                                #{p.round}
                                            </span>
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-tertiary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {p.date}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <span className="rounded-[3px] border-[0.5px] border-[var(--color-border-soft)] bg-[var(--color-bg-muted)] px-[6px] py-[2px] font-[var(--font-mono)] text-[10px] text-[var(--color-text-secondary)]">
                                                {p.underlying}
                                            </span>
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {fmtPrice(p.clearingPrice)}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {fmtPct(p.impliedYield)}
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            {fmtSol(p.volumeSol)} SOL
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="h-[3px] w-[44px] overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)]">
                                                    <div
                                                        className="h-full rounded-[2px] bg-[var(--color-pt-fill)] opacity-[0.6]"
                                                        style={{ width: `${p.fillRate}%` }}
                                                    />
                                                </div>
                                                <span>{fmtPct(p.fillRate)}</span>
                                            </div>
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <StatusBadge status={p.status} />
                                        </td>

                                        <td className="align-middle whitespace-nowrap px-4 py-[9px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)] transition-[background] duration-[100ms] [border-bottom:var(--border)]">
                                            <Link
                                                href={`/auctions/${p.round}`}
                                                className={`font-[var(--font-mono)] text-[10px] no-underline ${isCurrent
                                                    ? 'pointer-events-none text-[var(--color-text-tertiary)]'
                                                    : 'text-[var(--color-accent)]'
                                                    }`}
                                                aria-disabled={isCurrent}
                                            >
                                                {isCurrent ? 'Viewing' : 'View →'}
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-3 bg-[var(--color-bg-subtle)] px-4 py-[10px] [border-top:var(--border)]">
                    <span className="flex-1 text-[10px] text-[var(--color-text-tertiary)]">
                        Implied yield trend (rounds 8-14)
                    </span>
                    <YieldSparkline data={yieldHistory} />
                    <span className="font-[var(--font-mono)] text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                        {yieldHistory[yieldHistory.length - 1][1].toFixed(2)}% current
                    </span>
                </div>
            </Panel>
        </>
    );
}