'use client';
import { activityLog, activityColors } from '@/lib/positionData/positionData';
import Panel from '@/components/dashboard/panel';

export default function ActivityLog() {
    return (
        <Panel title="Activity">
            <div>
                {activityLog.map((entry) => (
                    <div
                        key={entry.id}
                        className="grid [grid-template-columns:12px_1fr_auto_auto_auto] items-center gap-3 border-b-[var(--border)] px-4 py-[9px] transition-[background] duration-[100ms] hover:bg-[var(--color-bg-subtle)] cursor-default"
                    >
                        <span
                            className="h-[6px] w-[6px] shrink-0 rounded-full"
                            style={{ background: activityColors[entry.type] }}
                            aria-hidden
                        />

                        <span className="text-[12px] text-[var(--color-text-primary)]">
                            {entry.label}
                        </span>

                        <span className="text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-secondary)]">
                            {entry.amount}
                        </span>

                        <span
                            className="cursor-pointer whitespace-nowrap font-[var(--font-mono)] text-[10px] text-[var(--color-accent)] underline underline-offset-2"
                            title={`Tx: ${entry.txHash}`}
                        >
                            {entry.txHash}
                        </span>

                        <span className="min-w-[54px] whitespace-nowrap text-right font-[var(--font-mono)] text-[10px] text-[var(--color-text-tertiary)]">
                            {entry.timestamp}
                        </span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}