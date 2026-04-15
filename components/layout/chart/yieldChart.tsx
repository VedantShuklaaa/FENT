'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';
import { YieldPoint, TimeRange, fmtTs } from '@/lib/chartData/chartData';

function YieldTooltip({
    active,
    payload,
    range,
}: {
    active?: boolean;
    payload?: any[];
    range: TimeRange;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as YieldPoint;

    return (
        <div className="bg-[var(--color-bg-surface)] border-[var(--border-md)] rounded-[var(--radius-md)] px-[12px] py-[8px]">
            <p className="mb-[3px] font-[family-name:var(--font-mono)] text-[9px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
                {fmtTs(d.ts, range)}
            </p>
            <p className="mb-[2px] font-[family-name:var(--font-mono)] text-[12px] font-medium tabular-nums text-[var(--color-positive)]">
                {d.impliedApy.toFixed(2)}% APY
            </p>
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--color-text-tertiary)]">
                Clearing {d.clearingPrice.toFixed(4)}
            </p>
        </div>
    );
}

interface YieldChartProps {
    data: YieldPoint[];
    range: TimeRange;
}

export default function YieldChart({ data, range }: YieldChartProps) {
    const current = data[data.length - 1]?.impliedApy ?? 0;
    const prev = data[0]?.impliedApy ?? 0;
    const isUp = current >= prev;

    const xTicks = data
        .filter((_, i) => i % Math.floor(data.length / 5) === 0)
        .map((d) => d.ts);

    const yMin = Math.max(0, Math.min(...data.map((d) => d.impliedApy)) - 0.5);
    const yMax = Math.max(...data.map((d) => d.impliedApy)) + 0.5;

    const lineColor = isUp ? 'var(--color-positive)' : '#A33030';
    const lineHex = isUp ? '#2A7A5C' : '#A33030';

    return (
        <div className="[border-top:var(--border)] px-[16px] pt-[14px] pb-[12px]">
            <div className="mb-[10px] flex items-baseline justify-between">
                <p className="text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                    Implied APY
                </p>
                <p
                    className="font-[family-name:var(--font-mono)] text-[14px] font-medium tabular-nums"
                    style={{ color: lineColor }}
                >
                    {current.toFixed(2)}%
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`yield-${range}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                    <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="yield-grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={lineHex} stopOpacity={0.12} />
                                    <stop offset="100%" stopColor={lineHex} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="ts"
                                ticks={xTicks}
                                tickFormatter={(v) => fmtTs(v, range)}
                                tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#9A9895' }}
                                axisLine={false}
                                tickLine={false}
                                dy={4}
                            />

                            <YAxis
                                domain={[yMin, yMax]}
                                tickCount={3}
                                tickFormatter={(v) => `${v.toFixed(1)}%`}
                                tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#9A9895' }}
                                axisLine={false}
                                tickLine={false}
                                width={38}
                            />

                            <Tooltip
                                content={<YieldTooltip range={range} />}
                                cursor={{
                                    stroke: lineHex,
                                    strokeWidth: 1,
                                    strokeDasharray: '3 3',
                                    opacity: 0.4,
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="impliedApy"
                                stroke={lineHex}
                                strokeWidth={1.5}
                                fill="url(#yield-grad)"
                                dot={false}
                                activeDot={{ r: 3, fill: lineHex, strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}