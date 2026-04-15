'use client';
import { motion } from 'framer-motion';
import { redeemableItems } from '@/lib/redeemData/redeemData';
import RedeemCard from '@/components/redeem/redeemCard';
import RedeemHistory from '@/components/redeem/redeemHistory';
import RedeemNote from '@/components/redeem/redeemNote';
import { positionsSummary } from '@/lib/positionData/positionData';

export default function Page() {
    const claimable = positionsSummary.claimableSol;

    return (
        <div className="min-h-full flex flex-col bg-(--color-bg-base)">
            {/* ── Page header ───────────────────────────────────────── */}
            <motion.div
                className="flex items-center justify-between gap-5 border-b-(--border) bg-(--color-bg-surface) px-6 pb-[18px] pt-5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
            >
                <div>
                    <h1 className="mb-[3px] text-[20px] font-medium leading-[1.2] text-[var(--color-text-primary)]">
                        Redeem
                    </h1>
                    <p className="text-[12px] leading-[1.5] text-[var(--color-text-tertiary)]">
                        Claim matured PT positions and accrued YT yield.
                    </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-[2px]">
                    <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                        Claimable
                    </span>
                    <span className="font-[var(--font-mono)] text-[18px] font-medium tabular-nums text-[var(--color-positive)]">
                        {claimable.toFixed(2)} SOL
                    </span>
                </div>
            </motion.div>

            {/* ── Main content ──────────────────────────────────────── */}
            <div className="mx-auto flex max-w-[1400px] gap-4 px-6 py-5">
                {/* Left: cards + history */}
                <div className="flex min-w-0 flex-col gap-4">
                    {/* Redeemable cards */}
                    <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,_minmax(280px,_1fr))]">
                        {redeemableItems.map((item, i) => (
                            <RedeemCard key={item.id} item={item} index={i} />
                        ))}
                    </div>

                    {/* History */}
                    <RedeemHistory />
                </div>

                {/* Right: note */}
                <div className="flex min-w-[220px] flex flex-col gap-4">
                    <RedeemNote />
                </div>
            </div>
        </div>
    );
}