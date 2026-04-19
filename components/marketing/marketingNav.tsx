'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MarketingNavProps {
    activePage?: 'home' | 'docs' | 'explore';
}

const NAV_LINKS = [
    { href: '/', label: 'Home', id: 'home' },
    { href: '/docs', label: 'Docs', id: 'docs' },
    { href: '/explore', label: 'Explore', id: 'explore' },
];

export default function MarketingNav({ activePage }: MarketingNavProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-6 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <nav
                className={`flex items-center gap-1.5 rounded-full p-1.5 transition-all duration-500 ${
                    scrolled
                        ? 'bg-[rgba(255,255,255,0.85)] shadow-[var(--shadow-sm)] border border-[var(--color-border-soft)] backdrop-blur-xl'
                        : 'bg-transparent border border-transparent shadow-none'
                }`}
            >
                <Link href="/" className="flex items-center pl-4 pr-3 py-1 border-r border-[var(--color-border-soft)] transition-opacity hover:opacity-70">
                    <span className="font-bold tracking-tight text-[14px] text-[var(--color-text-primary)]">FENt.</span>
                </Link>
                
                <div className="flex items-center gap-1 px-1">
                {NAV_LINKS.map(({ href, label, id }) => {
                    const isActive = activePage === id;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-[0.01em] transition-colors duration-300 ${
                                isActive
                                    ? 'text-[var(--color-text-primary)]'
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 z-0 rounded-full bg-[var(--color-bg-muted)]"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{label}</span>
                        </Link>
                    );
                })}
                </div>
            </nav>
        </motion.div>
    );
}