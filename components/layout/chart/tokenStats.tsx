'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenMeta, fmtUsd, fmtPrice } from '@/lib/chartData/chartData';

interface StatRowProps {
    label: string;
    value: string;
    accent?: boolean;
}

function StatRow({ label, value, accent }: StatRowProps) {
    return (
        <div className="flex items-baseline justify-between">
            <span className="text-[10px] tracking-[0.03em] text-[var(--color-text-tertiary)]">
                {label}
            </span>
            <span
                className="font-[family-name:var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)]"
                style={accent ? { color: 'var(--color-positive)' } : undefined}
            >
                {value}
            </span>
        </div>
    );
}

interface TokenStatsProps {
    token: TokenMeta;
}

export default function TokenStats({ token }: TokenStatsProps) {
    const isUp1d = token.change1d >= 0;
    const isUp7d = token.change7d >= 0;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={token.id}
                className="
          flex flex-col gap-0 overflow-hidden
          rounded-[var(--radius-lg)] border [border:var(--border)]
          bg-[var(--color-bg-surface)] p-[16px]
        "
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {/* Token identity */}
                <div className="mb-[14px] flex items-center gap-[10px]">
                    <span
                        className="h-[10px] w-[10px] shrink-0 rounded-full"
                        style={{ background: token.color }}
                        aria-hidden
                    />
                    <div>
                        <p className="font-[family-name:var(--font-mono)] text-[14px] font-medium leading-[1.1] text-[var(--color-text-primary)]">
                            {token.id}
                        </p>
                        <p className="mt-[1px] text-[10px] text-[var(--color-text-tertiary)]">
                            {token.label}
                        </p>
                    </div>
                </div>

                <div className="mb-[14px] h-[0.5px] bg-[var(--color-border-soft)]" />

                {/* Stats */}
                <div className="mb-[14px] flex flex-col gap-[9px]">
                    <StatRow label="Price" value={`$${fmtPrice(token.current)}`} />
                    <StatRow
                        label="24h"
                        value={`${isUp1d ? '+' : ''}${token.change1d.toFixed(2)}%`}
                        accent={isUp1d}
                    />
                    <StatRow
                        label="7d"
                        value={`${isUp7d ? '+' : ''}${token.change7d.toFixed(2)}%`}
                        accent={isUp7d}
                    />
                    <StatRow label="Volume 24h" value={fmtUsd(token.vol24h)} />
                    <StatRow label="Mkt Cap" value={fmtUsd(token.mcap)} />
                </div>

                {/* LST premium */}
                {token.id !== 'SOL' && (
                    <>
                        <div className="mb-[14px] h-[0.5px] bg-[var(--color-border-soft)]" />
                        <div className="pt-[2px]">
                            <p className="mb-[4px] text-[9px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
                                SOL premium
                            </p>
                            <p className="mb-[2px] font-[family-name:var(--font-mono)] text-[16px] font-medium tabular-nums text-[var(--color-positive)]">
                                +{((token.current / 157.42 - 1) * 100).toFixed(2)}%
                            </p>
                            <p className="text-[10px] text-[var(--color-text-tertiary)]">
                                staking yield accumulation
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}