'use client';

// components/landing/DashboardSnippet.tsx

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ─── Live countdown ───────────────────────────────────────────────
function useTick() {
  const [t, setT] = useState(4 * 3600 + 22 * 60 + 18);
  useEffect(() => {
    const id = setInterval(() => setT((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(t / 3600).toString().padStart(2, '0');
  const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
  const sec = (t % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

// ─── Animated progress bar ────────────────────────────────────────
function ProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div
      ref={ref}
      className="w-full h-[3px] bg-[var(--color-bg-muted)] rounded overflow-hidden"
    >
      <motion.div
        className="h-full rounded origin-left"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: pct / 100 } : { scaleX: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── Mouse-tracking 3D tilt ────────────────────────────────────────
function useTilt(strength = 6) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(springY, [-1, 1], [strength, -strength]);
  const rotateY = useTransform(springX, [-1, 1], [-strength, strength]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─── Main component ───────────────────────────────────────────────
export default function DashboardSnippet() {
  const countdown = useTick();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(6);

  const apyRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!apyRef.current) return;
    const el = apyRef.current;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 8.34,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      onUpdate: () => {
        el.textContent = obj.val.toFixed(2) + '%';
      },
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative max-w-[1100px] mx-auto pt-[100px] pb-[120px]">
      <motion.div
        className="flex items-center gap-4 mb-4 px-8"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap text-[#3DAF84]">
          The interface
        </span>
        <div className="flex-1 h-[0.5px] bg-[rgba(255,255,255,0.07)]" />
      </motion.div>

      <motion.h2
        className="px-8 mb-4 font-[Sora,var(--font-sans)] text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--color-text-primary)] "
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        Your positions,
        <br />
        <span className="text-[#3DAF84]">clearly laid out.</span>
      </motion.h2>

      <motion.p
        className="px-8 mb-14 max-w-[520px] text-sm leading-[1.7] text-[#A8A49E]"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        The FENt dashboard separates PT and YT positions with deliberate visual hierarchy —
        you always know exactly what you own and what it's worth.
      </motion.p>

      <motion.div
        className="px-8"
        style={{ perspective: 1400 }}
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative overflow-hidden select-none cursor-default rounded-[10px] border-[0.5px] border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] shadow-[0_32px_64px_var(--color-border-medium),0_0_0_0.5px_var(--color-border-soft)]"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          animate={inView ? { y: [0, -8, 0] } : {}}
          transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
        >
          <div className="flex items-center justify-between bg-[var(--color-bg-subtle)] border-b-[0.5px] border-[var(--color-border-soft)] px-4 py-[10px]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF5F56]" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#FFBD2E]" />
              <span className="inline-block w-2 h-2 rounded-full bg-[#27C93F]" />
              <span className="ml-1 font-mono text-[11px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
                FENt — Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[3px] border-[0.5px] border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-[7px] py-[2px] font-mono text-[9px] uppercase tracking-[0.07em] text-[var(--color-accent-text)]">
                <span className="h-[5px] w-[5px] rounded-full bg-[var(--color-accent)]" />
                Live
              </span>
              <span className="rounded-[3px] border-[0.5px] border-[var(--color-border-soft)] bg-[var(--color-bg-muted)] px-[7px] py-[2px] font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--color-text-tertiary)]">
                Mainnet
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b-[0.5px] border-[var(--color-border-soft)]">
            {[
              { label: 'Total Deposited', value: '248.40 SOL', sub: '≈ $39,281', accent: false, isApy: false },
              { label: 'Implied APY', value: null, sub: 'market rate', accent: false, isApy: true },
              { label: 'Next Maturity', value: '82 days', sub: 'Jun 30, 2025', accent: false, isApy: false },
              { label: 'Claimable Yield', value: '3.18 SOL', sub: 'ready', accent: true, isApy: false },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`${i < 3 ? 'border-r-[0.5px] border-[var(--color-border-soft)]' : ''} px-[18px] py-[14px]`}
              >
                <p className="mb-[5px] font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                  {stat.label}
                </p>
                <p
                  className={`mb-[3px] font-mono text-[16px] font-medium leading-[1.2] tabular-nums text-[var(--color-text-primary)] ${
                    stat.accent ? 'text-[var(--color-positive)]' : ''
                  }`}
                >
                  {stat.isApy ? <span ref={apyRef}>0.00%</span> : stat.value}
                </p>
                <p className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2">
            <div className="border-r-[0.5px] border-[var(--color-border-soft)]">
              <div className="bg-[var(--color-bg-subtle)] border-b-[0.5px] border-[var(--color-border-soft)] px-4 py-[10px]">
                <span className="rounded-[3px] border-[0.5px] border-[var(--color-pt-border)] bg-[var(--color-pt-bg)] px-[7px] py-[2px] font-mono text-[9px] uppercase font-medium tracking-[0.08em] text-[var(--color-pt)]">
                  PT · Principal Token
                </span>
              </div>
              <div className="px-4 py-[14px]">
                <p className="mb-[2px] font-mono text-[18px] font-medium tabular-nums text-[var(--color-text-primary)]">
                  164.20 PT
                </p>
                <p className="mb-[14px] font-mono text-[10px] text-[var(--color-text-tertiary)]">
                  jitoSOL · Jun 30, 2025
                </p>
                <div className="flex flex-col gap-[7px]">
                  {[
                    { label: 'Maturity', val: '82 days', accent: false },
                    { label: 'Implied APY', val: '7.22%', accent: true, color: 'var(--color-pt-fill)' },
                    { label: 'Redemption value', val: '164.20 jitoSOL', accent: false },
                    { label: 'Current price', val: '0.9834', accent: false },
                    { label: 'Principal risk', val: 'Protected', accent: false },
                  ].map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between">
                      <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{r.label}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums text-[var(--color-text-secondary)] ${
                          r.accent ? `text-[var(--color-pt-fill)]` : ''
                        }`}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="mb-[5px] flex justify-between">
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">Convergence to par</span>
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">72%</span>
                  </div>
                  <ProgressBar pct={72} color="var(--color-pt-fill)" delay={0.6} />
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[var(--color-bg-subtle)] border-b-[0.5px] border-[var(--color-border-soft)] px-4 py-[10px]">
                <span className="rounded-[3px] border-[0.5px] border-[var(--color-yt-border)] bg-[var(--color-yt-bg)] px-[7px] py-[2px] font-mono text-[9px] uppercase font-medium tracking-[0.08em] text-[var(--color-yt)]">
                  YT · Yield Token
                </span>
              </div>
              <div className="px-4 py-[14px]">
                <p className="mb-[2px] font-mono text-[18px] font-medium tabular-nums text-[var(--color-text-primary)]">
                  164.20 YT
                </p>
                <p className="mb-[14px] font-mono text-[10px] text-[var(--color-text-tertiary)]">
                  jitoSOL · Jun 30, 2025
                </p>
                <div className="flex flex-col gap-[7px]">
                  {[
                    { label: 'Time remaining', val: '82 days', accent: true, color: 'var(--color-yt-fill)' },
                    { label: 'Implied APY', val: '8.34%', accent: true, color: 'var(--color-yt-fill)' },
                    { label: 'Yield accrued', val: '3.18 jitoSOL', accent: false },
                    { label: 'YT price', val: '0.0201', accent: false },
                    { label: 'Yield risk', val: 'Exposed', accent: true, color: 'var(--color-yt-fill)' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between">
                      <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">{r.label}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums text-[var(--color-text-secondary)] ${
                          r.accent ? `text-[var(--color-yt-fill)]` : ''
                        }`}
                      >
                        {r.val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="mb-[5px] flex justify-between">
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">Time value remaining</span>
                    <span className="font-mono text-[10px] text-[var(--color-text-tertiary)]">38%</span>
                  </div>
                  <ProgressBar pct={38} color="var(--color-yt-fill)" delay={0.7} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t-[0.5px] border-[var(--color-border-soft)] bg-[var(--color-bg-subtle)] px-[18px] py-3">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Auction · Round #14
              </span>
              <div className="flex gap-6">
                {[
                  { label: 'Clearing', val: '0.9712', accent: false },
                  { label: 'Discount', val: '−2.88%', accent: true },
                  { label: 'Bid Vol', val: '1,482 SOL', accent: false },
                ].map((a) => (
                  <div key={a.label} className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] tracking-[0.06em] text-[var(--color-text-tertiary)]">
                      {a.label}
                    </span>
                    <span
                      className={`font-mono text-[13px] font-medium tabular-nums text-[var(--color-text-primary)] ${
                        a.accent ? 'text-[var(--color-positive)]' : ''
                      }`}
                    >
                      {a.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                Closes in
              </span>
              <span className="font-mono text-[16px] font-medium tracking-[0.05em] tabular-nums text-[var(--color-text-primary)]">
                {countdown}
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(42,122,92,0.25),transparent)]" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute right-[-8px] top-[38%] z-10"
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <motion.div
          className="flex items-center gap-[10px] rounded-lg border-[0.5px] border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] px-[14px] py-[10px] backdrop-blur-[12px] shadow-[0_8px_32px_var(--color-border-medium)]"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="h-2 w-2 rounded-full bg-[var(--color-positive)]" />
          <div>
            <p className="font-mono text-[13px] font-medium leading-[1.2] tabular-nums text-[var(--color-text-primary)]">
              3.18 jitoSOL
            </p>
            <p className="mt-0.5 font-mono text-[9px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
              Claimable yield
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute left-6 bottom-[22%] z-10"
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.85 }}
      >
        <motion.div
          className="flex items-center gap-[10px] rounded-lg border-[0.5px] border-[var(--color-border-medium)] bg-[var(--color-bg-surface)] px-[14px] py-[10px] backdrop-blur-[12px] shadow-[0_8px_32px_var(--color-border-medium)]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <span className="h-2 w-2 rounded-full bg-[var(--color-pt-fill)]" />
          <div>
            <p className="font-mono text-[13px] font-medium leading-[1.2] tabular-nums text-[var(--color-text-primary)]">
              72% to par
            </p>
            <p className="mt-0.5 font-mono text-[9px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
              PT convergence
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}