'use client';
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

export default function FooterBrand() {
  const dotRef = useRef<HTMLSpanElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!dotRef.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(dotRef.current, {
      opacity: 0.3,
      scale: 0.8,
      duration: 1.1,
      ease: 'sine.inOut',
    });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-[10px]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-accent)]">
          <span className="font-mono text-[11px] font-medium tracking-[-0.05em] text-[#E8F5F0]">
            YP
          </span>
        </div>
        <span className="font-sans text-[16px] font-medium tracking-[0.04em] text-[var(--color-text-primary)]">
          FENt
        </span>
      </div>

      {/* Tagline */}
      <p className="max-w-[200px] font-sans text-[13px] leading-[1.7] text-[var(--color-text-tertiary)]">
        Yield tokenization for
        <br />
        Solana liquid staking.
      </p>

      {/* Network badge */}
      <div className="flex items-center gap-[7px]">
        <span
          ref={dotRef}
          className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[var(--color-accent)]"
        />
        <span className="font-mono text-[10px] tracking-[0.04em] text-[var(--color-text-tertiary)]">
          Mainnet · Round #14 Live
        </span>
      </div>

      {/* Solana attribution */}
      <div className="mt-1 flex items-center gap-[6px]">
        <span className="font-sans text-[11px] text-[var(--color-text-tertiary)]">
          Built on
        </span>
        <span className="font-mono text-[11px] tracking-[0.02em] text-[var(--color-accent)] opacity-70">
          ◎ Solana
        </span>
      </div>
    </motion.div>
  );
}