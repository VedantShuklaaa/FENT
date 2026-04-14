'use client';
import { useState, useEffect } from 'react';
import { auctionData, bidDepth, recentFills, AuctionFill } from '@/lib/data';
import Panel from './panel';

function useCountdown(initialSeconds: number) {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecs((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
}

function AuctionStat({
  label,
  value,
  accent = false,
  isDiscount = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  isDiscount?: boolean;
}) {
  return (
    <div className="border-b-[var(--border)] border-r-[var(--border)] px-[16px] py-[12px]">
      <p className="mb-[4px] text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p
        className="font-[var(--font-mono)] text-[15px] font-medium tabular-nums"
        style={{
          color: isDiscount ? 'var(--color-positive)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </p>
    </div>
  );
}

function BidDepthRow({
  price,
  volumeSol,
  barPercent,
}: {
  price: number;
  volumeSol: number;
  barPercent: number;
}) {
  return (
    <div className="flex items-center gap-[10px] px-[16px] py-[8px]">
      <span className="font-[var(--font-mono)] text-[10px] tabular-nums text-[var(--color-text-tertiary)] w-[60px] shrink-0">
        {price.toFixed(4)}
      </span>
      <div className="h-1 grow overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-[2px] bg-[var(--color-pt-fill)] opacity-[0.55]"
          style={{ width: `${barPercent}%` }}
        />
      </div>
      <span className="font-[var(--font-mono)] text-[10px] tabular-nums text-[var(--color-text-secondary)] w-[70px] shrink-0 text-right">
        {volumeSol.toLocaleString()} SOL
      </span>
    </div>
  );
}

function FillRow({ fill }: { fill: AuctionFill }) {
  const isBuy = fill.side === 'buy';

  return (
    <div className="grid grid-cols-[80px_1fr_auto] cursor-default border-b-[var(--border)] px-[16px] py-[8px] transition-[background] duration-[100ms]">
      <span
        className="font-[var(--font-mono)] text-[9px] uppercase tracking-[0.06em] whitespace-nowrap rounded-[var(--radius-sm)] px-[6px] py-[2px]"
        style={{
          background: isBuy ? 'var(--color-accent-bg)' : '#FBF0E8',
          color: isBuy ? 'var(--color-accent)' : '#8A4E1A',
        }}
      >
        {isBuy ? 'Buy' : 'Sell'} {fill.tokenType}
      </span>
      <span className="font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-primary)]">
        {fill.amount.toFixed(1)} {fill.tokenType} @ {fill.price.toFixed(4)}
      </span>
      <span className="text-[10px] text-[var(--color-text-tertiary)] text-right">
        {fill.timeAgo}
      </span>
    </div>
  );
}

export default function AuctionPanel() {
  const countdown = useCountdown(auctionData.countdownSecs);
  const d = auctionData;

  return (
    <>
      <style>{`.fill-row:hover { background: var(--color-bg-subtle); }`}</style>

      <Panel
        title={`Auction · Round #${d.round} — Active`}
        action={{ label: 'Join auction →', onClick: () => { } }}
      >
        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2">
          <AuctionStat
            label="Clearing Price"
            value={`${d.clearingPrice.toFixed(4)} jitoSOL`}
          />
          <AuctionStat
            label="Discount to Par"
            value={`${d.discountPct.toFixed(2)}%`}
            isDiscount
          />
          <AuctionStat
            label="Implied Yield at Clear"
            value={`${d.impliedYield.toFixed(2)}%`}
          />
          <AuctionStat
            label="Total Bid Volume"
            value={`${d.totalBidVolume.toLocaleString()} SOL`}
          />
        </div>

        {/* Bid depth */}
        <div className="border-t-[var(--border)] pt-[4px] pb-[4px] px-0">
          <p className="mb-[6px] px-[16px] text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
            Bid Depth
          </p>
          {bidDepth.map((b) => (
            <BidDepthRow key={b.price} {...b} />
          ))}
        </div>

        {/* Recent fills */}
        <div className="pb-[4px]">
          <p
            className="mt-[10px] border-t-[var(--border)] px-[16px] pt-[10px] text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]"
            style={{ borderTop: 'var(--border)', paddingTop: '10px' }}
          >
            Recent Fills
          </p>
          {recentFills.map((f, i) => (
            <FillRow key={i} fill={f} />
          ))}
        </div>

        {/* Countdown */}
        <div className="mt-0 border-t-[var(--border)] bg-[var(--color-bg-subtle)] flex items-center justify-between px-[16px] py-[12px]">
          <span className="text-[10px] uppercase tracking-[0.07em] text-[var(--color-text-tertiary)]">
            Round closes in
          </span>
          <span
            className="font-[var(--font-mono)] text-[14px] font-medium tabular-nums tracking-[0.05em] text-[var(--color-text-primary)]"
            aria-live="polite"
          >
            {countdown}
          </span>
        </div>
      </Panel>
    </>
  );
}