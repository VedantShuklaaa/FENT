'use client';
import { useState } from 'react';
import { positions, Position } from '@/lib/positionData/positionData';
import Panel from '@/components/dashboard/panel';

// ─── Token type tag ────────────────────────────────────────────

function TypeTag({ type }: { type: Position['type'] }) {
    const isPT = type === 'PT';
    const isYT = type === 'YT';

    return (
        <span
            className="inline-flex rounded-[3px] px-[6px] py-[2px] font-[var(--font-mono)] text-[9px] font-medium uppercase tracking-[0.08em]"
            style={{
                background: isPT
                    ? 'var(--color-pt-bg)'
                    : isYT
                        ? 'var(--color-yt-bg)'
                        : 'var(--color-bg-muted)',
                color: isPT
                    ? 'var(--color-pt)'
                    : isYT
                        ? 'var(--color-yt)'
                        : 'var(--color-text-tertiary)',
                border: isPT
                    ? '0.5px solid var(--color-pt-border)'
                    : isYT
                        ? '0.5px solid var(--color-yt-border)'
                        : '0.5px solid var(--color-border-soft)',
            }}
        >
            {type}
        </span>
    );
}

// ─── Status badge ──────────────────────────────────────────────

function StatusBadge({ status }: { status: Position['status'] }) {
    const cfg = {
        active: { label: 'Active', bg: 'var(--color-bg-muted)', color: 'var(--color-text-tertiary)' },
        redeemable: { label: 'Redeemable', bg: 'var(--color-accent-bg)', color: 'var(--color-accent-text)' },
        matured: { label: 'Matured', bg: 'var(--color-bg-muted)', color: 'var(--color-text-tertiary)' },
    }[status];

    return (
        <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            padding: '2px 6px',
            borderRadius: 3,
            background: cfg.bg,
            color: cfg.color,
            border: '0.5px solid var(--color-border-soft)',
        }}>
            {cfg.label}
        </span>
    );
}

// ─── Progress bar (convergence / time value) ───────────────────

function MiniBar({ pct, type }: { pct: number; type: 'PT' | 'YT' | 'LST' }) {
    const fillBG = type === 'PT' ? 'var(--color-pt-fill)' : 'var(--color-yt-fill)';
    const fillOpacity = type === 'PT' ? 0.7 : 0.65;

    return (
        <div className="flex items-center justify-end gap-[7px]">
            <div className="h-[3px] w-[52px] overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)] inline">
                <div
                    className="h-full rounded-[2px] transition-[width] duration-[0.3s]"
                    style={{ width: `${pct}%`, background: fillBG, opacity: fillOpacity }}
                />
            </div>
            <span className="min-w-[28px] text-right font-[var(--font-mono)] text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
                {pct}%
            </span>
        </div>
    );
}

// ─── Underlying chip ───────────────────────────────────────────

function UnderlyingChip({ label, color }: { label: string; color: string }) {
    return (
        <span className="flex items-center gap-[5px]">
            <span
                className="h-[6px] w-[6px] shrink-0 rounded-full"
                style={{ background: color }}
            />
            <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)]">
                {label}
            </span>
        </span>
    );
}

// ─── Single row ────────────────────────────────────────────────

function PositionRow({ pos }: { pos: Position }) {
    const isPT = pos.type === 'PT';
    const barPct = isPT ? (pos.convergePct ?? 0) : (pos.timeValuePct ?? 0);
    const barTooltip = isPT ? 'Convergence to par' : 'Time value remaining';

    return (
        <tr className="pos-row cursor-default whitespace-nowrap">
            {/* Type */}
            <td className="bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                <TypeTag type={pos.type} />
            </td>

            {/* Underlying */}
            <td className="bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                <UnderlyingChip label={pos.underlying} color={pos.underlyingColor} />
            </td>

            {/* Amount */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                {pos.amount.toFixed(2)}
            </td>

            {/* Value */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                ${pos.valueUsd.toLocaleString()}
            </td>

            {/* Maturity */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                {pos.daysToMaturity > 0 ? (
                    <span>
                        {pos.maturityDate}
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {' '}
                            · {pos.daysToMaturity}d
                        </span>
                    </span>
                ) : (
                    <span className="text-[var(--color-positive)]">Matured</span>
                )}
            </td>

            {/* APY */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                {pos.daysToMaturity > 0 ? (
                    <span
                        style={{
                            color: isPT ? 'var(--color-pt-fill)' : 'var(--color-yt-fill)',
                        }}
                    >
                        {pos.impliedApy.toFixed(2)}%
                    </span>
                ) : (
                    <span className="text-[var(--color-text-tertiary)]">—</span>
                )}
            </td>

            {/* Progress bar */}
            <td
                className="min-w-[110px] text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]"
                title={barTooltip}
            >
                <MiniBar pct={barPct} type={pos.type} />
            </td>

            {/* Status */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                <StatusBadge status={pos.status} />
            </td>

            {/* Action */}
            <td className="text-right bg-[var(--color-bg-surface)] px-[16px] py-[10px] border-b-[var(--border)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
                {pos.status === 'redeemable' ? (
                    <button
                        className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-[10px] py-[4px] font-[var(--font-sans)] text-[11px] font-medium text-[#E8F5F0] transition-[background] duration-[120ms] hover:bg-[#236650] cursor-pointer"
                    >
                        Redeem
                    </button>
                ) : (
                    <button
                        className="rounded-[var(--radius-md)] border-[var(--border-md)] bg-[var(--color-bg-surface)] px-[10px] py-[4px] font-[var(--font-sans)] text-[11px] font-medium text-[var(--color-text-secondary)] transition-[background,border-color] duration-[100ms] hover:border-[var(--color-border-medium)] hover:bg-[var(--color-bg-subtle)] cursor-pointer"
                    >
                        Split →
                    </button>
                )}
            </td>
        </tr>
    );
}

// ─── Filter tabs ───────────────────────────────────────────────

type Filter = 'all' | 'PT' | 'YT';

function FilterTab({
    label,
    active,
    count,
    onClick,
}: {
    label: string;
    active: boolean;
    count: number;
    onClick: () => void;
}) {
    const isActive = !!active;

    return (
        <button
            onClick={onClick}
            aria-pressed={isActive}
            className={`flex items-center gap-[6px] rounded-[var(--radius-md)] border-[var(--border)] px-[10px] py-[4px] font-[var(--font-sans)] text-[11px] font-medium uppercase tracking-[0.01em] transition-[background] duration-[100ms] cursor-pointer ${isActive
                ? 'bg-[var(--color-accent)] text-[#E8F5F0] [border:0.5px_solid_var(--color-accent)]'
                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'
                }`}
        >
            {label}
            <span
                className="rounded-[2px] px-[5px] py-[1px] font-[var(--font-mono)] text-[9px] leading-[1.4] text-[var(--color-text-tertiary)]"
                style={{
                    background: isActive ? 'var(--color-accent)' : 'var(--color-bg-muted)',
                    color: isActive ? '#E8F5F0' : 'var(--color-text-tertiary)',
                }}
            >
                {count}
            </span>
        </button>
    );
}

// ─── Main export ───────────────────────────────────────────────

export default function PositionsTable() {
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = filter === 'all'
        ? positions
        : positions.filter((p: any) => p.type === filter);

    const counts = {
        all: positions.length,
        PT: positions.filter((p: any) => p.type === 'PT').length,
        YT: positions.filter((p: any) => p.type === 'YT').length,
    };

    return (
        <>
            <style>{`
        .pos-row:hover td {
          background: var(--color-bg-subtle);
        }
        .action-btn:hover,
        .redeem-btn:hover {
          background: var(--color-bg-subtle);
          border-color: var(--color-border-medium);
        }
      `}</style>

            <Panel title="Positions">
                {/* Filter tabs */}
                <div className="flex gap-[6px] border-b-[var(--border)] bg-[var(--color-bg-subtle)] px-[14px] py-[10px]">
                    {(['all', 'PT', 'YT'] as Filter[]).map((f) => (
                        <FilterTab
                            key={f}
                            label={f === 'all' ? 'All' : f}
                            active={filter === f}
                            count={counts[f]}
                            onClick={() => setFilter(f)}
                        />
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-[680px] w-full border-collapse">
                        <thead>
                            <tr>
                                {[
                                    'Type',
                                    'Underlying',
                                    'Amount',
                                    'Value',
                                    'Maturity',
                                    'APY',
                                    'Progress',
                                    'Status',
                                    '',
                                ].map((h, i) => (
                                    <th
                                        key={`${h}-${i}`}
                                        className={`bg-[var(--color-bg-subtle)] px-[16px] py-[7px] text-left text-[9px] font-normal uppercase tracking-[0.07em] text-[var(--color-text-tertiary)] whitespace-nowrap [border-bottom:var(--border)] ${i > 1 ? 'text-right' : ''
                                            }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((pos: any) => (
                                <PositionRow key={pos.id} pos={pos} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-between border-t-[var(--border)] bg-[var(--color-bg-subtle)] px-[16px] py-[8px]">
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        {filtered.length} position{filtered.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        Total value:&nbsp;
                        <span className="font-[var(--font-mono)] text-[var(--color-text-secondary)]">
                            $
                            {filtered
                                .reduce((a: any, p: any) => a + p.valueUsd, 0)
                                .toLocaleString()}
                        </span>
                    </span>
                </div>
            </Panel>
        </>
    );
}