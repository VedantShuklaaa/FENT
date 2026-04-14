'use client';
import { bidLevels, askLevels, activeAuction, fmtPrice, fmtSol } from '@/lib/auctionData/auctionData';
import Panel from '@/components/dashboard/panel';

function DepthBar({
    percent,
    side,
    isClear,
}: {
    percent: number;
    side: 'bid' | 'ask';
    isClear?: boolean;
}) {
    const color = side === 'bid'
        ? (isClear ? 'var(--color-pt-fill)' : 'rgba(74, 111, 165, 0.3)')
        : 'rgba(196, 125, 42, 0.35)';

    return (
        <div className="flex h-[4px] w-full overflow-hidden rounded-[2px] bg-(--color-bg-muted)">
            <div
                className={`h-full rounded-[2px] transition-[width] duration-[300ms], ${side === 'ask' && "ml-auto"}, ${side === 'bid' && "mr-0"}`}
                style={{ width: `${percent}%`, backgroundColor: color }}
            />
        </div>
    );
}

export default function OrderBook() {
    const clearPrice = activeAuction.clearingPrice;

    return (
        <Panel title="Order Book — Bid / Ask Depth">
            {/* Column headers */}
            <div className={`grid grid-cols-[72px_1fr_72px_72px] bg-(--color-bg-subtle) px-4 py-[6px] [border-bottom:var(--border)]`}>
                <span className={`text-[9px] uppercase tracking-[0.07em] text-(--color-text-tertiary)`}>Volume (SOL)</span>
                <span className={`text-[9px] uppercase tracking-[0.07em] text-(--color-text-tertiary) text-center`} >Price</span>
                <span className={`text-[9px] uppercase tracking-[0.07em] text-(--color-text-tertiary) text-right`} >Cumulative</span>
            </div>

            {/* Ask levels (sell side) — shown top-to-bottom, highest price first */}
            <div className={`bg-[rgba(196,125,42,0.03)]`}>
                {[...askLevels].reverse().map((row) => (
                    <div key={row.price} className={`hover:bg-[var(--color-bg-subtle)] transition-colors grid grid-cols-[72px_1fr_72px_72px] items-center px-4 py-[5px] cursor-default transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                        <span className={`pr-[10px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-yt) text-right`}>
                            {fmtSol(row.volumeSol)}
                        </span>
                        <div className={`flex items-center px-[8px]`}>
                            <DepthBar percent={row.barPercent} side="ask" />
                        </div>
                        <span className={`text-center font-(--font-mono) text-[12px] font-medium tabular-nums text-(--color-yt)`} >
                            {fmtPrice(row.price)}
                        </span>
                        <span className={`text-right font-(--font-mono) text-[10px] tabular-nums text-(--color-text-tertiary)`}>{fmtSol(row.cumVolume)}</span>
                    </div>
                ))}
            </div>

            {/* Clearing price divider */}
            <div className={`flex items-center justify-center gap-[10px] bg-(--color-accent-bg) px-4 py-[7px] border-y-[0.5px] border-(--color-accent-border)`} aria-label={`Clearing price: ${fmtPrice(clearPrice)}`}>
                <span className={`text-[9px] uppercase tracking-[0.08em] text-(--color-accent-text)`}>Clearing</span>
                <span className={`font-(--font-mono) text-[13px] font-medium tabular-nums text-(--color-accent)`}>{fmtPrice(clearPrice)}</span>
                <span className={`rounded-[3px] bg-(--color-accent) px-[6px] py-[1px] font-(--font-mono) text-[10px] text-[#E8F5F0]`}>−{Math.abs(activeAuction.discountPct).toFixed(2)}%</span>
            </div>

            {/* Bid levels (buy side) — highest price first */}
            <div className={`bg-[rgba(74,111,165,0.03)]`}>
                {bidLevels.map((row) => (
                    <div key={row.price} className={`hover:bg-[var(--color-bg-subtle)] transition-colors grid grid-cols-[72px_1fr_72px_72px] items-center px-4 py-[5px] cursor-default transition-[background] duration-[100ms] [border-bottom:var(--border)]`}>
                        <span className={`pr-[10px] text-right font-(--font-mono) text-[11px] tabular-nums ${row.isClear ? 'text-(--color-pt-fill)' : 'text-(--color-text-secondary)'}`}>
                            {fmtSol(row.volumeSol)}
                        </span>
                        <div className={`flex items-center px-[8px]`}>
                            <DepthBar percent={row.barPercent} side="bid" isClear={row.isClear} />
                        </div>
                        <span
                            className={`text-center font-(--font-mono) text-[12px] font-medium tabular-nums ${row.isClear ? 'text-(--color-pt-fill)' : 'text-(--color-text-secondary)'}`}>
                            {fmtPrice(row.price)}
                        </span>
                        <span className={`text-right font-(--font-mono) text-[10px] tabular-nums text-(--color-text-tertiary)`}>{fmtSol(row.cumVolume)}</span>
                    </div>
                ))}
            </div>

            {/* Footer legend */}
            <div className={`flex items-center gap-[6px] bg-(--color-bg-subtle) px-4 py-2 border-t-(--border)`}>
                <span className={`h-[8px] w-[8px] shrink-0 rounded-[2px] bg-(--color-pt-fill)`} />
                <span className={`text-[10px] text-(--color-text-tertiary)`}>At or above clearing price</span>
                <span className={`h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[rgba(74,111,165,0.3)] ml-12`} />
                <span className={`text-[10px] text-(--color-text-tertiary)`}>Below clearing price</span>
                <span className={`h-[8px] w-[8px] shrink-0 rounded-[2px] bg-[rgba(196,125,42,0.35)] ml-12`} />
                <span className={`text-[10px] text-(--color-text-tertiary)`}>Ask (sell)</span>
            </div>
        </Panel>
    );
}

