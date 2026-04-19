'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MarketingNav from '@/components/marketing/marketingNav';
import { useSmoothScroll } from '@/lib/hooks/useSmoothScroll';

const SECTIONS = [
    {
        id: 'overview',
        label: 'Overview',
        subsections: [
            { id: 'what-is-FENt', label: 'What is FENt?' },
            { id: 'key-concepts', label: 'Key Concepts' },
        ],
    },
    {
        id: 'tokens',
        label: 'Tokens',
        subsections: [
            { id: 'principal-tokens', label: 'Principal Tokens (PT)' },
            { id: 'yield-tokens', label: 'Yield Tokens (YT)' },
            { id: 'lst-support', label: 'Supported LSTs' },
        ],
    },
    {
        id: 'auctions',
        label: 'Auctions',
        subsections: [
            { id: 'how-auctions-work', label: 'How Auctions Work' },
            { id: 'placing-bids', label: 'Placing Bids' },
            { id: 'settlement', label: 'Settlement' },
        ],
    },
    {
        id: 'integration',
        label: 'Integration',
        subsections: [
            { id: 'quick-start', label: 'Quick Start' },
            { id: 'sdk-usage', label: 'SDK Usage' },
            { id: 'pda-helpers', label: 'PDA Helpers' },
        ],
    },
];

function CodeBlock({ code, lang = 'typescript' }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [code]);

    return (
        <div className="my-5 overflow-hidden rounded-[6px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5C5956]">
                    {lang}
                </span>
                <button
                    className="font-mono text-[10px] tracking-[0.04em] text-[#3DAF84] transition-colors hover:text-[#8fe0c0]"
                    onClick={copy}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre className="m-0 overflow-auto p-5">
                <code className="block whitespace-pre font-mono text-[12px] leading-[1.7] text-[#A8A49E]">
                    {code}
                </code>
            </pre>
        </div>
    );
}

const DOC_CONTENT: Record<string, React.ReactNode> = {
    'what-is-FENt': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                FENt is a Solana-native yield tokenization protocol that splits liquid staking token (LST)
                positions into two tradeable components: <strong className="text-[#8AAED4]">Principal Tokens (PT)</strong> and{' '}
                <strong className="text-[#E8B87A]">Yield Tokens (YT)</strong>.
            </p>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                This separation enables users to access fixed yield, speculate on future staking APY,
                and trade these positions independently — all with on-chain price discovery through
                uniform-price auctions.
            </p>
            <div className="mb-4 rounded-r-[4px] border border-l-[2px] border-l-[#3DAF84] border-[rgba(61,175,132,0.2)] bg-[rgba(61,175,132,0.06)] px-4 py-[14px]">
                <span className="font-mono text-[11px] text-[#3DAF84]">DESIGN INSPIRATION</span>
                <p className="mt-2 mb-0 text-[14px] leading-[1.75] text-[#A8A49E]">
                    FENt&apos;s PT/YT model is inspired by Pendle Finance on Ethereum, adapted natively
                    for Solana&apos;s account model and SPL token standard.
                </p>
            </div>
        </div>
    ),

    'key-concepts': (
        <div>
            <p className="text-[14px] leading-[1.75] text-[#A8A49E]">Before diving in, understand these core concepts:</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                    { term: 'Maturity Date', def: 'The Unix timestamp when PT tokens become redeemable 1:1 for the underlying LST.' },
                    { term: 'Implied APY', def: 'The yield rate implied by the current PT market price. Lower PT price = higher implied APY.' },
                    { term: 'Yield Index', def: 'An on-chain accumulator that tracks total staking yield since market creation.' },
                    { term: 'Clearing Price', def: 'The uniform price at which all auction fills happen — the lowest bid that gets filled.' },
                ].map((c) => (
                    <div key={c.term} className="rounded-[6px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-[14px]">
                        <div className="mb-2 font-mono text-[11px] tracking-[0.04em] text-[#3DAF84]">{c.term}</div>
                        <div className="text-[12px] leading-[1.65] text-[#A8A49E]">{c.def}</div>
                    </div>
                ))}
            </div>
        </div>
    ),

    'principal-tokens': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                A Principal Token represents a claim on exactly 1 unit of the underlying LST at maturity.
                Buying PT at a discount locks in a fixed yield — the discount becomes your return.
            </p>
            <h4 className="mb-3 mt-6 font-[var(--font-display,_Sora,_sans-serif)] text-[14px] font-semibold text-[#F2F0EC]">
                Redemption formula
            </h4>
            <CodeBlock
                lang="math"
                code={`PT_value_at_maturity = 1.0 (par)
Implied APY = ((1 / PT_price) - 1) × (365 / days_to_maturity) × 100

Example:
  PT price = 0.9712 jitoSOL
  Days to maturity = 82
  Implied APY = ((1/0.9712) - 1) × (365/82) × 100 = 7.84%`}
            />
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                PT price converges toward par (1.0) as maturity approaches — behaving like a zero-coupon bond on Solana.
            </p>
        </div>
    ),

    'yield-tokens': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                Yield Tokens capture all staking yield generated by the underlying LST from deposit to maturity. YT price decays to zero at maturity.
            </p>
            <h4 className="mb-3 mt-6 font-[var(--font-display,_Sora,_sans-serif)] text-[14px] font-semibold text-[#F2F0EC]">
                Yield accrual formula
            </h4>
            <CodeBlock
                lang="rust"
                code={`// From the on-chain program (redeem.rs)
let index_delta  = current_yield_index - last_claimed_index;
let yield_amount = (yt_amount * index_delta) / 1_000_000_000;

// yield_index grows each epoch proportional to staking APR
// Users claim by calling claim_yield()`}
            />
            <div className="mb-4 rounded-r-[4px] border border-l-[2px] border-l-[#C47D2A] border-[rgba(255,255,255,0.06)] bg-[rgba(61,175,132,0.06)] px-4 py-[14px]">
                <span className="font-mono text-[11px] text-[#C47D2A]">⚠ IMPORTANT</span>
                <p className="mt-2 mb-0 text-[14px] leading-[1.75] text-[#A8A49E]">
                    YT value decays over time. If you hold YT to maturity without claiming, your unclaimed yield remains in the vault and is claimable after maturity.
                </p>
            </div>
        </div>
    ),

    'lst-support': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">FENt supports the following liquid staking tokens at launch:</p>
            <div className="flex flex-col overflow-hidden rounded-[6px] border border-[rgba(255,255,255,0.06)]">
                {[
                    { symbol: 'jitoSOL', name: 'Jito Liquid Staking', yield: 'MEV + PoS', color: '#9BC4B2' },
                    { symbol: 'mSOL', name: 'Marinade Staked SOL', yield: 'PoS', color: '#8AAED4' },
                    { symbol: 'bSOL', name: 'BlazeStake SOL', yield: 'PoS', color: '#B4A0D0' },
                ].map((l) => (
                    <div key={l.symbol} className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] px-4 py-3">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: l.color }} />
                        <span className="min-w-16 font-mono text-[12px] font-medium text-[#F2F0EC]">{l.symbol}</span>
                        <span className="flex-1 text-[12px] text-[#A8A49E]">{l.name}</span>
                        <span className="font-mono text-[10px] tracking-[0.06em] text-[#5C5956]">{l.yield}</span>
                    </div>
                ))}
            </div>
        </div>
    ),

    'how-auctions-work': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                FENt uses uniform-price auctions for transparent PT/YT price discovery. Each round:
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-[14px] leading-[2] text-[#A8A49E]">
                <li>An auction opens with a minimum bid price and duration (e.g. 1 hour).</li>
                <li>Bidders submit their desired quantity and price (SOL escrowed on-chain).</li>
                <li>At round close, a keeper determines the clearing price from all bids.</li>
                <li>All bids at or above clearing price fill at the clearing price. Excess SOL is refunded.</li>
                <li>Bids below clearing are fully refunded.</li>
            </ol>
        </div>
    ),

    'quick-start': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">Install dependencies and connect to the program:</p>
            <CodeBlock
                lang="bash"
                code={`npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets`}
            />
            <h4 className="mb-3 mt-6 font-[var(--font-display,_Sora,_sans-serif)] text-[14px] font-semibold text-[#F2F0EC]">
                Initialize the provider
            </h4>
            <CodeBlock
                lang="typescript"
                code={`import { getFENtProgram } from '@/anchor/program';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

const { connection } = useConnection();
const wallet = useAnchorWallet();

const program = wallet
  ? getFENtProgram(connection, wallet)
  : null;`}
            />
            <h4 className="mb-3 mt-6 font-[var(--font-display,_Sora,_sans-serif)] text-[14px] font-semibold text-[#F2F0EC]">
                Deposit LST
            </h4>
            <CodeBlock
                lang="typescript"
                code={`import { useDeposit } from '@/hooks/useDeposit';
import { LST_MINTS } from '@/constants';
import BN from 'bn.js';

const { deposit, state, error } = useDeposit();

// Deposit 10 jitoSOL into the Jun-2025 market
await deposit(
  LST_MINTS.jitoSOL,
  1751328000,           // Jun 30 2025 Unix timestamp
  new BN(10 * 1e9),    // 10 jitoSOL in lamports
);`}
            />
        </div>
    ),

    'sdk-usage': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">All available hooks and what they return:</p>
            <CodeBlock
                lang="typescript"
                code={`// Position data for the connected wallet
const { positions, loading, refetch } = usePositions();
// positions: PositionView[] — shaped for UI consumption

// All auction rounds
const { auctions, loading } = useAuctions();
// auctions[0] is the active round (sorted first)

// Activity history
const { history, loading } = useHistory();
// history: HistoryRow[] — sorted newest-first

// Dashboard KPI aggregation
const kpis = useDashboard();
// kpis.totalDepositedSol, kpis.impliedApy, etc.

// Split a position
const { split, loading, error } = useSplit();
await split(lstMint, maturityTs, new BN(amount));

// Redeem PT
const { redeemPt } = useRedeemPt();
await redeemPt(lstMint, maturityTs, new BN(ptAmount));

// Claim YT yield
const { claimYield } = useClaimYield();
await claimYield(lstMint, maturityTs);`}
            />
        </div>
    ),

    'pda-helpers': (
        <div>
            <p className="mb-4 text-[14px] leading-[1.75] text-[#A8A49E]">
                All PDA derivation functions are in <code className="rounded bg-[rgba(61,175,132,0.08)] px-[6px] py-px font-mono text-[12px] text-[#3DAF84]">src/anchor/pda.ts</code>:
            </p>
            <CodeBlock
                lang="typescript"
                code={`import { marketPda, positionPda, ptMintPda, ytMintPda, vaultPda, auctionPda, bidPda, activityCounterPda, activityRecordPda } from '@/anchor/pda';

// Derive a market PDA
const [market, bump] = marketPda(lstMint, new BN(maturityTs));

// Derive a user's position
const [position] = positionPda(walletPublicKey, market);

// Derive the auction for round 14
const [auction] = auctionPda(market, new BN(14));`}
            />
        </div>
    ),
};

export default function Page() {
    useSmoothScroll();

    const [activeSection, setActiveSection] = useState('what-is-FENt');
    const [query, setQuery] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const allIds = SECTIONS.flatMap((s) => s.subsections.map((sub) => sub.id));

        allIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            ScrollTrigger.create({
                trigger: el,
                start: 'top 30%',
                end: 'bottom 30%',
                onEnter: () => setActiveSection(id),
                onEnterBack: () => setActiveSection(id),
            });
        });

        return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
    };

    return (
        <div className="min-h-screen bg-[#0D0F0E] text-[#F2F0EC]">
            <MarketingNav activePage="docs" />

            <div className="mx-auto flex max-w-[1300px] pt-14">
                <aside className="sticky top-14 h-[calc(100vh-56px)] w-[240px] shrink-0 overflow-y-auto border-r border-[rgba(255,255,255,0.06)] py-6">
                    <div className="px-4 pb-4">
                        <input
                            type="text"
                            placeholder="Search docs…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-[4px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-2 font-sans text-[12px] text-[#F2F0EC] outline-none"
                        />
                    </div>

                    <nav className="px-2">
                        {SECTIONS.map((section) => (
                            <div key={section.id} className="mb-5">
                                <div className="px-2 mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#3DAF84]">
                                    {section.label}
                                </div>
                                {section.subsections.map((sub) => {
                                    const isActive = activeSection === sub.id;
                                    return (
                                        <button
                                            key={sub.id}
                                            onClick={() => scrollTo(sub.id)}
                                            className={`mb-px block w-full rounded-r-[3px] border-l-2 px-[10px] py-[6px] text-left font-sans text-[12px] transition-[color,background] duration-150 ${isActive
                                                ? 'border-l-[#2A7A5C] bg-[rgba(255,255,255,0.04)] text-[#F2F0EC]'
                                                : 'border-l-transparent bg-transparent text-[#5C5956]'
                                                }`}
                                        >
                                            {sub.label}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </aside>

                <main ref={contentRef} className="min-w-0 flex-1 max-w-[720px] px-14 py-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="mb-12 border-b border-[rgba(255,255,255,0.06)] pb-10">
                            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#3DAF84]">
                                Documentation
                            </p>
                            <h1 className="font-[var(--font-display,_Sora,_sans-serif)] text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-[#F2F0EC]">
                                FENt Protocol Docs
                            </h1>
                            <p className="mt-2.5 text-[14px] leading-[1.6] text-[#5C5956]">
                                Everything you need to understand PT/YT tokenization, auctions, and integration.
                            </p>
                        </div>

                        {SECTIONS.flatMap((s) => s.subsections).map((sub) => (
                            <motion.section
                                key={sub.id}
                                id={sub.id}
                                className="scroll-mt-20 pb-0"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="mb-4 mt-12 font-[var(--font-display,_Sora,_sans-serif)] text-[22px] font-semibold text-[#F2F0EC]">
                                    {sub.label}
                                </h2>
                                {DOC_CONTENT[sub.id] || <p className="text-[14px] leading-[1.75] text-[#A8A49E]">Coming soon.</p>}
                                <div className="my-10 h-px bg-[rgba(255,255,255,0.06)]" />
                            </motion.section>
                        ))}
                    </motion.div>
                </main>

                <div className="sticky top-20 flex h-fit w-[200px] shrink-0 flex-col gap-0.5 px-6 py-10">
                    <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#3DAF84]">
                        On this page
                    </p>
                    {SECTIONS.flatMap((s) => s.subsections).map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => scrollTo(sub.id)}
                            className={`border-none bg-transparent py-1 text-left font-sans text-[11px] leading-[1.5] transition-colors duration-150 ${activeSection === sub.id ? 'text-[#3DAF84]' : 'text-[#5C5956]'
                                }`}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}