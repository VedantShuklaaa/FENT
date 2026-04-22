'use client';
import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';

const LEGAL_LINKS = [
  { label: 'Terms', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Risk Disclosure', href: '#' },
];

export default function FooterBottom() {
  const lineRef = useRef<HTMLDivElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !lineRef.current) return;
    gsap.fromTo(
      lineRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 1.0, ease: 'power3.out', delay: 0.2 }
    );
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      {/* Scan-line divider */}
      <div
        ref={lineRef}
        className="mb-5 h-[0.5px] origin-left bg-[var(--color-border-soft)]"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-sans text-[11px] leading-[1.5] text-[var(--color-text-tertiary)]">
          © {new Date().getFullYear()} FENt Protocol. Not financial advice.
          <span className="font-mono text-[10px] text-[var(--color-text-tertiary)] opacity-60">
            &nbsp;· v0.1.0-devnet
          </span>
        </p>

        <div className="flex gap-5">
          {LEGAL_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="footer-legal-link font-sans text-[11px] text-[var(--color-text-tertiary)] no-underline transition-colors duration-150 hover:!text-[var(--color-text-secondary)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}