'use client';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

import MarketingNav from '@/components/marketing/marketingNav';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';
import DashboardSnippet from '@/components/marketing/dashboardSnippet';
import ThemeToggle from '@/components/layout/themeToggle/themeToggle';

const FooterOrb = dynamic(() => import('@/components/layout/footer/footerOrb'), { ssr: false });

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            delay: i * 0.1,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    }),
};

export default function Page() {
    useSmoothScroll();

    const containerRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (storyRef.current) {
            const cards = storyRef.current.querySelectorAll('.story-card');
            gsap.fromTo(cards,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.15,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: storyRef.current,
                        start: 'top 80%',
                    }
                }
            );

            const lines = storyRef.current.querySelectorAll('.story-line');
            gsap.fromTo(lines,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 1.2,
                    ease: 'power3.inOut',
                    transformOrigin: 'left center',
                    scrollTrigger: {
                        trigger: storyRef.current,
                        start: 'top 75%',
                    }
                }
            );
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        }
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent-bg)] selection:text-[var(--color-accent-text)] overflow-hidden font-sans">
            <MarketingNav activePage="home" />

            {/* HERO SECTION */}
            <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center pt-20">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
                    <div className="w-[140%] h-[140%] md:w-[120%] md:h-[120%] max-w-[1400px] max-h-[1400px] absolute opacity-70 mix-blend-multiply">
                        <FooterOrb />
                    </div>
                    {/* Soft gradient masks to fade out the edges of the 3D canvas */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--color-bg-base)_70%)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg-base)] opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[var(--color-bg-base)] opacity-100 h-32" />
                </div>

                <div className="relative z-10 w-full max-w-[1200px] px-6 mx-auto flex flex-col items-center text-center">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={0}
                        className="mb-8 px-5 py-2 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] backdrop-blur-xl text-[11px] font-mono tracking-widest uppercase text-[var(--color-text-secondary)] shadow-sm"
                    >
                        Introducing FENt.
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={1}
                        className="text-[52px] md:text-[88px] font-bold tracking-[-0.03em] leading-[1.05] text-[var(--color-text-primary)] mb-8 max-w-[900px]"
                        style={{ fontFamily: 'var(--font-sans)' }}
                    >
                        Yield as an <br className="hidden md:block" />
                        <span className="text-[var(--color-accent)] relative inline-block">
                            asset class.
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-[110%] h-4 -bottom-1 -left-[5%] text-[var(--color-accent-bg)] -z-10" viewBox="0 0 100 12" preserveAspectRatio="none">
                                <path d="M0 8 Q 50 0 100 8 L 100 12 L 0 12 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                        className="text-[17px] md:text-[21px] text-[var(--color-text-secondary)] max-w-[580px] leading-[1.6] mb-12 font-light"
                    >
                        FENt separates your LST yield into tradeable Principal and Yield Tokens. Fixed rates, leveraged exposure, elegant execution.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={3}
                        className="flex flex-col sm:flex-row items-center gap-5"
                    >
                        <Link href="/dashboard" className="group relative overflow-hidden rounded-full text-[var(--color-text-primary)] bg-[var(--color-bg-surface)]  px-8 py-4 text-[14px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                            <span className="relative z-10 flex items-center gap-2">
                                Launch Dashboard
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </span>
                            <div className="absolute inset-0 z-0 bg-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* POSITIONING SECTION */}
            <section className="py-32 md:py-40 bg-[var(--color-bg-surface)] relative rounded-t-[48px] shadow-[0_-8px_30px_rgba(0,0,0,0.02)] z-20">
                <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                    <div className="md:col-span-5 md:col-start-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className="h-[1px] w-8 bg-[var(--color-accent)] block"></span>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)]">Precision</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-[-0.02em] mb-8"
                        >
                            Designed for precision.<br />
                            <span className="text-[var(--color-text-tertiary)]">Built for scale.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-[17px] text-[var(--color-text-secondary)] leading-[1.7]"
                        >
                            By tokenizing future yield, we unlock a new dimension of capital efficiency. Secure fixed returns with Principal Tokens or compound your exposure with Yield Tokens—all settled on-chain without intermediaries.
                        </motion.p>
                    </div>
                    <div className="md:col-span-5 md:col-start-8 relative">
                        {/* Abstract visual element */}
                        <motion.div
                            className="w-full aspect-[4/5] rounded-[32px] bg-[var(--color-bg-base)] border border-[var(--color-bg-base)] p-8 flex flex-col justify-between relative overflow-hidden shadow-[var(--shadow-sm)]"
                            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-pt-bg)] rounded-full blur-[80px] opacity-70 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-yt-bg)] rounded-full blur-[80px] opacity-70 translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                            <div className="relative z-10 flex justify-between items-start">
                                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-tertiary)] bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-[var(--color-border-soft)]">Yield Split</span>
                                <div className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-md border border-[var(--color-border-soft)] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-3">
                                <div className="p-5 rounded-2xl bg-[var(--color-bg-base)] backdrop-blur-md border border-[var(--color-border-soft)] shadow-sm transition-transform hover:-translate-y-1">
                                    <div className="text-[12px] text-[var(--color-text-primary)] font-medium mb-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--color-pt-fill)]" />
                                        Principal Token (PT)
                                    </div>
                                    <div className="text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]">Fixed 7.2% APY</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-[var(--color-bg-base)] backdrop-blur-md border border-[var(--color-border-soft)] shadow-sm transition-transform hover:-translate-y-1">
                                    <div className="text-[12px] text-[var(--color-text-primary)] font-medium mb-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--color-yt-fill)]" />
                                        Yield Token (YT)
                                    </div>
                                    <div className="text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]">Variable Exposure</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── DASHBOARD SNIPPET ────────────────────────────────── */}
            <div style={{ position: 'relative', overflow: 'visible' }}>
                <DashboardSnippet />
            </div>

            {/* VIDEO SHOWCASE */}
            <section className="py-32 md:py-40 bg-[var(--color-bg-base)]">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] mb-4 bg-[var(--color-accent-bg)] px-3 py-1 rounded-full border border-[var(--color-accent-border)]">Product Demo</span>
                        <h2 className="text-[36px] md:text-[44px] font-bold tracking-[-0.02em]">See it in action</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full aspect-video rounded-[32px] md:rounded-[12px] bg-[var(--color-bg-surface)] border-[2px] border-[var(--color-bg-base)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden group cursor-pointer"
                    >
                        {/* Video Placeholder Content */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-muted)] to-[var(--color-bg-subtle)] opacity-40 transition-opacity group-hover:opacity-60" />

                        {/* Fake UI Elements */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[var(--color-border-medium)]" />
                                <div className="w-3 h-3 rounded-full bg-[var(--color-border-medium)]" />
                                <div className="w-3 h-3 rounded-full bg-[var(--color-border-medium)]" />
                            </div>
                        </div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-md shadow-[var(--shadow-xl)] flex items-center justify-center mb-6 transition-all duration-400 group-hover:scale-110 group-hover:shadow-[var(--shadow-2xl)] group-hover:bg-white text-[var(--color-text-secondary)] border border-[var(--color-border-soft)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            </div>
                            <p className="font-medium text-[15px] text-[var(--color-text-primary)] tracking-wide bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-[var(--color-bg-muted)]">Watch Walkthrough</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FLOW / STORY SECTION */}
            <section ref={storyRef} className="py-32 md:py-40 bg-[var(--color-bg-base)] relative rounded-[48px] mx-4 md:mx-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--color-accent-bg)] rounded-full blur-[120px] opacity-20 pointer-events-none" />

                <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
                    <div className="mb-24 md:flex justify-between items-end">
                        <h2 className="text-[36px] md:text-[48px] font-bold tracking-[-0.02em] max-w-[500px] leading-[1.1]">
                            A fluid experience from deposit to maturity.
                        </h2>
                        <p className="hidden md:block max-w-[300px] text-[15px] text-[var(--color-text-secondary)] leading-[1.6] mb-2">
                            Three simple steps to unlock the full potential of your staked assets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
                        {[
                            { num: '01', title: 'Deposit LST', body: 'Lock jitoSOL, mSOL, or bSOL into the FENt vault for a chosen maturity date.', color: 'var(--color-accent)' },
                            { num: '02', title: 'Mint PT & YT', body: 'Receive your Principal and Yield Tokens instantly. Perfect 1:1 ratio representing your underlying position.', color: 'var(--color-pt-fill)' },
                            { num: '03', title: 'Trade or Hold', body: 'Access our on-chain order books to discover implied rates, or hold to maturity for guaranteed redemption.', color: 'var(--color-yt-fill)' },
                        ].map((step, i) => (
                            <div key={step.num} className="story-card relative flex flex-col pt-10">
                                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-[var(--color-border-soft)] overflow-hidden">
                                    <div className="story-line h-full w-full origin-left" style={{ backgroundColor: step.color }} />
                                </div>
                                <span className="font-mono text-[14px] font-medium mb-6 px-3 py-1 bg-[var(--color-bg-base)] w-max rounded-[6px] border border-[var(--color-border-soft)]" style={{ color: step.color }}>Step {step.num}</span>
                                <h3 className="text-[22px] font-semibold mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-[16px] text-[var(--color-text-secondary)] leading-[1.6]">
                                    {step.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER CTA */}
            <section className="py-32 bg-[var(--color-bg-base)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(42,122,92,0.06)_0%,transparent_60%)] pointer-events-none" />
                <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[44px] md:text-[64px] font-bold tracking-[-0.03em] mb-6 leading-[1.05]"
                    >
                        Tokenize your <br className="hidden sm:block" />yield today.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[18px] text-[var(--color-text-secondary)] mb-12 max-w-[500px] mx-auto font-light"
                    >
                        Join the next generation of Solana DeFi. Simple, secure, and entirely on-chain.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/dashboard" className="w-full sm:w-auto rounded-full bg-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] px-8 py-4 text-[14px] font-medium text-zinc-400 hover:scale-105 active:scale-95 transition-all shadow-lg">
                            Launch Dashboard
                        </Link>
                        <Link href="/docs" className="w-full sm:w-auto rounded-full bg-white border border-[var(--color-border-soft)] px-8 py-4 text-[14px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] active:scale-95 transition-all shadow-sm">
                            Read the Docs
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* SIMPLE FOOTER */}
            <footer className="py-10 bg-[var(--color-bg-base)] border-t border-[var(--color-border-soft)]">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[var(--color-accent)] font-mono text-[11px] font-medium text-white shadow-sm">
                            Ft
                        </span>
                        <span className="font-semibold text-[14px] tracking-wide text-[var(--color-text-primary)]">FENt Protocol</span>
                    </div>
                    <div className="flex items-center gap-8 text-[13px] font-medium text-[var(--color-text-tertiary)]">
                        <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Twitter</a>
                        <a href="#" className="hover:text-[var(--color-text-primary)] transition-colors">Discord</a>
                        <a href="https://github.com/VedantShuklaaa/FENT" className="hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
                    </div>

                    <ThemeToggle />
                </div>
            </footer>
        </div>
    );
}