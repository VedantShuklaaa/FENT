'use client';
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

interface Stat {
  label: string;
  value: number;
  suffix: string;
  decimals?: number;
}

const STATS: Stat[] = [
  { label: 'Total Value Locked', value: 38.4, suffix: 'M_SOL', decimals: 1 },
  { label: 'Markets Live', value: 6, suffix: '', decimals: 0 },
  { label: 'Auctions Settled', value: 14, suffix: '', decimals: 0 },
  { label: 'Avg Implied APY', value: 8.34, suffix: '%', decimals: 2 },
];

function StatItem({ stat, index }: { stat: Stat; index: number }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || !numRef.current) return;
    const el = numRef.current;
    const obj = { val: 0 };

    gsap.to(obj, {
      val: stat.value,
      duration: 1.6,
      delay: index * 0.12,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = obj.val.toFixed(stat.decimals ?? 0);
      },
    });
  }, [inView, stat, index]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-1 px-7 border-r-[0.5px] border-r-[var(--color-border-soft)]"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        {stat.label}
      </p>

      <p className="flex items-baseline gap-1">
        <span
          ref={numRef}
          className="font-mono text-[26px] font-medium leading-[1.1] tabular-nums text-[var(--color-text-primary)]"
        >
          0
        </span>
        <span className="font-mono text-[12px] text-[var(--color-text-tertiary)]">
          {stat.suffix}
        </span>
      </p>
    </motion.div>
  );
}

export default function FooterStats() {
  return (
    <div className="grid grid-cols-4 border-y-[0.5px] border-y-[var(--color-border-soft)] py-6">
      {STATS.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}