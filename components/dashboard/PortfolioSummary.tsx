'use client';
import { portfolioSummary, formatSol, formatUsd, formatPct } from '@/lib/data';

interface StatProps {
  label: string;
  value: string;
  sub: string;
  subPositive?: boolean;
  isLast?: boolean;
}

function Stat({
  label,
  value,
  sub,
  subPositive = false,
  isLast = false,
}: StatProps) {
  return (
    <div
      className={`pr-5 mr-5 ${isLast ? '' : '[border-right:var(--border)]'}`}
    >
      <p className="mb-[5px] text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="font-[var(--font-mono)] text-[18px] font-medium leading-[1.2] tabular-nums text-[var(--color-text-primary)]">
        {value}
      </p>
      <p
        className={`mt-[2px] text-[11px] ${subPositive
          ? 'text-[var(--color-positive)]'
          : 'text-[var(--color-text-tertiary)]'
          }`}
      >
        {sub}
      </p>
    </div>
  );
}

export default function PortfolioSummary() {
  const d = portfolioSummary;

  return (
    <section
      className="grid grid-cols-5 border-b-[var(--border)] bg-[var(--color-bg-surface)] px-6 py-4"
      aria-label="Portfolio summary"
    >
      <Stat
        label="Total Deposited"
        value={`${formatSol(d.totalDepositedSol)} SOL`}
        sub={`≈ ${formatUsd(Math.round(d.totalDepositedSol * 153.5))} USD`}
      />
      <Stat
        label="Portfolio Value"
        value={formatUsd(d.totalValueUsd)}
        sub={`+${formatUsd(d.unrealisedUsd)} unrealised`}
        subPositive
      />
      <Stat
        label="Yield Exposure"
        value={formatPct(d.impliedApy)}
        sub="implied APY"
      />
      <Stat
        label="Next Maturity"
        value={`${d.daysToMaturity} days`}
        sub={d.maturityDate}
      />
      <Stat
        label="Claimable Yield"
        value={`${formatSol(d.claimableSol)} SOL`}
        sub="Ready to redeem"
        subPositive
        isLast
      />
    </section>
  );
}