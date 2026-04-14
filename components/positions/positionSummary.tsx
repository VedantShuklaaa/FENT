'use client';
import { positionsSummary } from '@/lib/positionData/positionData';

interface Cell {
    label: string;
    value: string;
    sub?: string;
    accent?: boolean;
}

const cells: Cell[] = [
    {
        label: 'Portfolio Value',
        value: `$${positionsSummary.totalValueUsd.toLocaleString()}`,
        sub: 'across all positions',
    },
    {
        label: 'PT Holdings',
        value: `${positionsSummary.totalPtSol.toFixed(2)} SOL`,
        sub: 'principal protected',
    },
    {
        label: 'YT Holdings',
        value: `${positionsSummary.totalYtSol.toFixed(2)} SOL`,
        sub: 'yield exposed',
    },
    {
        label: 'Claimable Yield',
        value: `${positionsSummary.claimableSol.toFixed(2)} SOL`,
        sub: 'ready to redeem',
        accent: true,
    },
];

export default function PositionsSummary() {
    return (
        <section
            className="grid grid-cols-4 bg-[var(--color-bg-surface)] px-6 py-4 [border-bottom:var(--border)]"
            aria-label="Positions summary"
        >
            {cells.map((c, i) => (
                <div
                    key={c.label}
                    className={`mr-5 pr-5 ${i < cells.length - 1 ? '[border-right:var(--border)]' : ''}`}
                >
                    <p className="mb-[5px] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                        {c.label}
                    </p>

                    <p
                        className={`font-[var(--font-mono)] text-[18px] font-medium leading-[1.2] tabular-nums ${c.accent
                                ? 'text-[var(--color-positive)]'
                                : 'text-[var(--color-text-primary)]'
                            }`}
                    >
                        {c.value}
                    </p>

                    {c.sub && (
                        <p className="mt-[2px] text-[11px] text-[var(--color-text-tertiary)]">
                            {c.sub}
                        </p>
                    )}
                </div>
            ))}
        </section>
    );
}