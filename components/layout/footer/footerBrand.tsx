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
        tl.to(dotRef.current, { opacity: 0.3, scale: 0.8, duration: 1.1, ease: 'sine.inOut' });
        return () => { tl.kill(); };
    }, []);

    return (
        <motion.div
            ref={ref}
            className="flex flex-col gap-[20px]"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-[10px]">
                <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[5px] bg-[#2A7A5C] flex-shrink-0">
                    <span className="font-mono text-[11px] font-medium tracking-[-0.05em] text-[#E8F5F0]">
                        Ft
                    </span>
                </div>
                <span className="font-sans text-[16px] font-medium tracking-[0.04em] text-[#E8F5F0]">
                    FENt. (fentanyl)
                </span>
            </div>

            {/* Tagline */}
            <p className="font-sans text-[13px] text-[rgba(255,255,255,0.38)] leading-[1.7] max-w-[200px]">
                Yield tokenization for<br />
                Solana liquid staking.
            </p>

            {/* Network badge */}
            <div className="flex items-center gap-[7px]">
                <span
                    ref={dotRef}
                    className="inline-block h-[7px] w-[7px] rounded-full bg-[#2A7A5C] flex-shrink-0"
                />
                <span className="font-mono text-[10px] tracking-[0.04em] text-[rgba(255,255,255,0.3)]">
                    Mainnet · Round #14 Live
                </span>
            </div>

            {/* Solana attribution */}
            <div className="flex items-center gap-[6px] mt-[4px]">
                <span className="font-sans text-[11px] text-[rgba(255,255,255,0.2)]">
                    Built on
                </span>
                <span className="font-mono text-[11px] tracking-[0.02em] text-[rgba(153,196,178,0.6)]">
                    ◎ Solana
                </span>
            </div>
        </motion.div>
    );
}