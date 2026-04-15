'use client';
import PositionsSummary from '@/components/positions/positionSummary';
import PositionsTable from '@/components/positions/positionsTable';
import QuickActions from '@/components/positions/quickActions';
import ActivityLog from '@/components/positions/activityLog';

export default function Page() {
    return (
        <div className="min-h-full bg-[var(--color-bg-base)]">
            {/* ── Summary strip ─────────────────────────────────────── */}
            <PositionsSummary />

            {/* ── Main body ─────────────────────────────────────────── */}
            <div className="mx-auto flex max-w-[1400px] items-start gap-4 px-6 py-5">
                {/* Left — positions table, full height */}
                <div className="flex min-w-0 flex-[3] flex-col gap-4">
                    <PositionsTable />
                </div>

                {/* Right — actions + activity stacked */}
                <div className="flex min-w-[220px] flex-1 flex-col gap-4">
                    <QuickActions />
                    <ActivityLog />
                </div>
            </div>
        </div>
    );
}