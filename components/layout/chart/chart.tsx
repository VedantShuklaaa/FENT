'use client';
import { motion } from 'framer-motion';
import SolanaChart from '@/components/layout/chart/solanaCharts';

export default function ChartPage() {
    return (
        <div className="min-h-full bg-[var(--color-bg-base)]">
            {/* Page header */}
            <motion.div
                className="bg-[var(--color-bg-surface)] px-[24px] pt-[20px] pb-[18px] [border-bottom:var(--border)]"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
            >
                <div>
                    <h1 className="mb-[3px] text-[20px] font-medium leading-[1.2] text-[var(--color-text-primary)]">
                        Markets
                    </h1>
                    <p className="text-[12px] leading-[1.5] text-[var(--color-text-tertiary)]">
                        SOL and liquid staking token prices with implied yield.
                    </p>
                </div>
            </motion.div>

            {/* Chart */}
            <div className="mx-auto max-w-[1200px] px-[24px] py-[20px]">
                <SolanaChart />
            </div>
        </div>
    );
}