'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

interface LinkItem {
  label: string;
  href: string;
  badge?: string;
}
interface NavColumn {
  heading: string;
  links: LinkItem[];
}

const COLUMNS: NavColumn[] = [
  {
    heading: 'Protocol',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Positions', href: '/positions' },
      { label: 'Auctions', href: '/auctions', badge: 'Live' },
      { label: 'Redeem', href: '/redeem' },
      { label: 'Settingss', href: '/settings' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Whitepaper', href: '#' },
      { label: 'GitHub', href: 'https://github.com/VedantShuklaaa/FENT' },
      { label: 'Audit Reports', href: '#' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Discord', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Telegram', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
];

function NavCol({ col, colIndex }: { col: NavColumn; colIndex: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: colIndex * 0.08, ease: 'easeOut' }}
    >
      <p className="mb-4 font-sans text-[9px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
        {col.heading}
      </p>

      <div className="flex flex-col gap-[10px]">
        {col.links.map((link, li) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, x: -6 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.35,
              delay: colIndex * 0.08 + li * 0.04,
              ease: 'easeOut',
            }}
          >
            <Link
              href={link.href}
              className="footer-link flex items-center gap-2 font-sans text-[13px] text-[var(--color-text-secondary)] no-underline transition-colors duration-150 hover:!text-[var(--color-text-primary)]"
            >
              {link.label}
              {link.badge && (
                <span className="rounded-[3px] border-[0.5px] border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-[6px] py-[2px] font-mono text-[9px] tracking-[0.06em] text-[var(--color-accent-text)]">
                  {link.badge}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function FooterLinks() {
  return (
    <div className="grid grid-cols-3 gap-10">
      {COLUMNS.map((col, i) => (
        <NavCol key={col.heading} col={col} colIndex={i} />
      ))}
    </div>
  );
}