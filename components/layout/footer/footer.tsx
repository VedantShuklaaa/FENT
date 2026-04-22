'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import FooterStats from './footerStats';
import FooterBrand from './footerBrand';
import FooterLinks from './footerLinks';
import FooterBottom from './footerBottom';

const FooterOrb = dynamic(() => import('./footerOrb'), { ssr: false });

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.footer
      ref={ref}
      className="w-full overflow-hidden border-t-[0.5px] border-t-[var(--color-border-soft)] bg-[var(--color-bg-subtle)]"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      aria-label="Site footer"
    >
      <FooterStats />

      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-0 px-10 py-12">
        <div className="flex flex-col gap-10 border-r-[0.5px] border-r-[var(--color-border-soft)] pr-12">
          <FooterBrand />
          <div className="h-[0.5px] bg-[var(--color-border-soft)]" aria-hidden />
          <FooterLinks />
        </div>

        <div className="flex h-[320px] items-center justify-center px-8" aria-hidden>
          <FooterOrb />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-10 pb-8">
        <FooterBottom />
      </div>
    </motion.footer>
  );
}