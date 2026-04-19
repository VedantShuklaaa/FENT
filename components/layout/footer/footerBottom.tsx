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
                className="mb-5 h-[0.5px] origin-left bg-[rgba(255,255,255,0.08)]"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-sans text-[11px] leading-[1.5] text-[rgba(255,255,255,0.2)]">
                    © {new Date().getFullYear()} FENt Protocol. Not financial advice.
                    <span className="font-mono text-[10px] text-[rgba(255,255,255,0.15)]">
                        &nbsp;· v0.1.0-devnet
                    </span>
                </p>

                <div className="flex gap-5">
                    {LEGAL_LINKS.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            className="font-sans text-[11px] text-[rgba(255,255,255,0.2)] no-underline transition-colors duration-150 hover:text-[rgba(255,255,255,0.6)]"
                        >
                            {l.label}
                        </a>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}