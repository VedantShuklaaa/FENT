'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { PricePoint, TokenMeta, TimeRange, fmtTs, fmtPrice, fmtUsd } from '@/lib/chartData/chartData';

// ─── Custom tooltip ────────────────────────────────────────────

function ChartTooltip({
    active,
    payload,
    range,
    color,
}: {
    active?: boolean;
    payload?: any[];
    range: TimeRange;
    color: string;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as PricePoint;

    return (
        <div className="bg-[var(--color-bg-surface)] border-[var(--border-md)] rounded-[var(--radius-md)] px-[12px] py-[8px] shadow-none">
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--color-text-tertiary)] tracking-[0.04em] mb-[3px]">
                {fmtTs(d.ts, range)}
            </p>
            <p className="font-[family-name:var(--font-mono)] text-[13px] font-medium tabular-nums text-[var(--color-text-primary)] mb-[2px]" style={{ color }}>
                ${fmtPrice(d.price)}
            </p>
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-[var(--color-text-tertiary)]">
                Vol {fmtUsd(d.vol)}
            </p>
        </div>
    );
}

// ─── Range tabs ────────────────────────────────────────────────

const RANGES: TimeRange[] = ['1D', '7D', '30D', '90D'];

function RangeTab({
    range,
    active,
    onClick,
}: {
    range: TimeRange;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-[0.04em] px-[9px] py-[4px] rounded-[3px] border-none cursor-pointer transition-[background,color] duration-[140ms] range-btn [background:var(--color-accent)] text-[#E8F5F0] border-none aria-selected:[background:var(--color-accent)] aria-selected:text-[#E8F5F0] aria-selected:border-none hover:!text-[var(--color-text-primary)]`}
            aria-pressed={active}
        >
            {range}
        </button>
    );
}

// ─── Volume ticks helper ───────────────────────────────────────

function volFmt(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
}

// ─── Main component ────────────────────────────────────────────

interface PriceChartProps {
    data: PricePoint[];
    token: TokenMeta;
    range: TimeRange;
    onRangeChange: (r: TimeRange) => void;
}

export default function PriceChart({
    data,
    token,
    range,
    onRangeChange

}: PriceChartProps) {
    const [hoverPrice, setHoverPrice] = useState<number | null>(null);

    const displayPrice = hoverPrice ?? token.current;
    const isUp = token.change1d >= 0;

    const xTicks = useMemo(() => {
        const step = Math.floor(data.length / 5);
        return data.filter((_, i) => i % step === 0).map((d) => d.ts);
    }, [data]);

    const priceMin = useMemo(() => Math.min(...data.map((d) => d.price)) * 0.998, [data]);
    const priceMax = useMemo(() => Math.max(...data.map((d) => d.price)) * 1.002, [data]);

    return (
        <div className="px-[16px] pt-[16px] pb-[8px]">
            {/* Range tabs global hover style */}
            <style>{`.range-btn:hover { color: var(--color-text-primary) !important; }`}</style>

            <div className="flex items-start justify-between gap-[16px] mb-[16px]">
                <div>
                    <motion.p
                        key={displayPrice}
                        className={`font-[family-name:var(--font-mono)] text-[26px] font-medium text-[var(--color-text-primary)] tabular-nums leading-[1.1] mb-[3px]`}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18 }}
                    >
                        ${fmtPrice(displayPrice)}
                    </motion.p>
                    <p
                        className="font-[family-name:var(--font-mono)] text-[11px] tabular-nums"
                        style={{ color: isUp ? 'var(--color-positive)' : 'var(--color-negative)' }}
                    >
                        {isUp ? '+' : ''}{token.change1d.toFixed(2)}% today
                    </p>
                </div>

                <div
                    className={`flex gap-[3px] bg-[var(--color-bg-subtle)] border-[var(--border)] rounded-[var(--radius-md)] px-[3px] py-[3px]`}
                >
                    {RANGES.map((r) => (
                        <RangeTab
                            key={r}
                            range={r}
                            active={r === range}
                            onClick={() => onRangeChange(r)}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${token.id}-${range}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart
                            data={data}
                            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                            onMouseMove={(e: any) => {
                                if (e?.activePayload?.[0]) {
                                    setHoverPrice((e.activePayload[0].payload as PricePoint).price);
                                }
                            }}
                            onMouseLeave={() => setHoverPrice(null)}
                        >
                            <defs>
                                <linearGradient id={`grad-${token.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={token.color} stopOpacity={0.15} />
                                    <stop offset="100%" stopColor={token.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="ts"
                                ticks={xTicks}
                                tickFormatter={(v) => fmtTs(v, range)}
                                tick={{
                                    fontFamily: 'IBM Plex Mono',
                                    fontSize: 9,
                                    fill: '#9A9895',
                                }}
                                axisLine={false}
                                tickLine={false}
                                dy={4}
                            />

                            <YAxis
                                domain={[priceMin, priceMax]}
                                tickCount={4}
                                tickFormatter={(v) => `$${fmtPrice(v)}`}
                                tick={{
                                    fontFamily: 'IBM Plex Mono',
                                    fontSize: 9,
                                    fill: '#9A9895',
                                }}
                                axisLine={false}
                                tickLine={false}
                                width={62}
                            />

                            <Tooltip
                                content={<ChartTooltip range={range} color={token.color} />}
                                cursor={{
                                    stroke: token.color,
                                    strokeWidth: 1,
                                    strokeDasharray: '3 3',
                                    opacity: 0.5,
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={token.color}
                                strokeWidth={1.5}
                                fill={`url(#grad-${token.id})`}
                                dot={false}
                                activeDot={{ r: 3, fill: token.color, strokeWidth: 0 }}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height={48}>
                        <BarChart
                            data={data}
                            margin={{ top: 2, right: 16, left: 0, bottom: 0 }}
                        >
                            <XAxis hide dataKey="ts" />
                            <YAxis hide tickFormatter={volFmt} />
                            <Bar
                                dataKey="vol"
                                fill={token.color}
                                opacity={0.25}
                                radius={[1, 1, 0, 0]}
                                isAnimationActive={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}