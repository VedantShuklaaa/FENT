'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TokenId, TimeRange, tokens, getPriceSeries, getYieldSeries } from '@/lib/chartData/chartData';
import TokenSelector from './tokenSelector';
import PriceChart from './priceChart';
import YieldChart from './yieldChart';
import TokenStats from './tokenStats';

export default function SolanaChart() {
    const [tokenId, setTokenId] = useState<TokenId>('SOL');
    const [range, setRange] = useState<TimeRange>('7D');

    const token = tokens.find((t) => t.id === tokenId)!;
    const priceData = useMemo(() => getPriceSeries(tokenId, range), [tokenId, range]);
    const yieldData = useMemo(() => getYieldSeries(range), [range]);

    return (
        <motion.div
            className="overflow-hidden rounded-[var(--radius-lg)] border [border:var(--border)] [background:var(--color-bg-surface)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <TokenSelector activeId={tokenId} onChange={setTokenId} />

            <div className="flex gap-0">
                <div className="min-w-0 flex-1 border-r [border-right:var(--border)]">
                    <PriceChart
                        data={priceData}
                        token={token}
                        range={range}
                        onRangeChange={setRange}
                    />
                    <YieldChart data={yieldData} range={range} />
                </div>

                <div className="w-[200px] shrink-0 px-3 py-[14px]">
                    <TokenStats token={token} />
                </div>
            </div>
        </motion.div>
    );
}