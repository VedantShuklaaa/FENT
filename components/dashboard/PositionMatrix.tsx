'use client';

import React from 'react';
import { ptPosition, ytPosition } from '@/lib/data';
import Panel from './panel';

function PositionTag({ type }: { type: 'PT' | 'YT' }) {
  const isPT = type === 'PT';

  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-[7px] py-[3px] font-[var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.08em]"
      style={{
        background: isPT ? 'var(--color-pt-bg)' : 'var(--color-yt-bg)',
        color: isPT ? 'var(--color-pt)' : 'var(--color-yt)',
        border: isPT
          ? '0.5px solid var(--color-pt-border)'
          : '0.5px solid var(--color-yt-border)',
      }}
    >
      {isPT ? 'PT · Principal Token' : 'YT · Yield Token'}
    </span>
  );
}

function MetricRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'pt' | 'yt' | 'none';
}) {
  const color =
    accent === 'pt'
      ? 'var(--color-pt-fill)'
      : accent === 'yt'
        ? 'var(--color-yt-fill)'
        : 'var(--color-text-secondary)';

  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <span
        className="font-[var(--font-mono)] text-[11px] tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function ProgressBar({
  percent,
  fillColor,
  startLabel,
  endLabel,
}: {
  percent: number;
  fillColor: string;
  startLabel: string;
  endLabel: string;
}) {
  return (
    <div className="mt-1">
      <div className="mb-1 flex justify-between">
        <span className="text-[9px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
          {startLabel}
        </span>
        <span className="text-[9px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
          {percent}%
        </span>
      </div>

      <div className="mb-1 h-[3px] w-full overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-[2px] transition-[width] duration-[0.4s] ease-in-out"
          style={{ width: `${percent}%`, background: fillColor }}
        />
      </div>

      <span className="text-[9px] uppercase tracking-[0.04em] text-[var(--color-text-tertiary)]">
        {endLabel}
      </span>
    </div>
  );
}

function PTColumn() {
  const pt = ptPosition;

  return (
    <div className="border-r-[var(--border)]">
      <div className="border-b-[var(--border)] px-4 pb-[9px] pt-[10px]">
        <PositionTag type="PT" />
      </div>

      <div className="px-4 py-3">
        <p className="mb-[2px] font-[var(--font-mono)] text-[20px] font-medium tabular-nums text-[var(--color-text-primary)]">
          {pt.amount.toFixed(2)} PT
        </p>
        <p className="mb-3 text-[10px] text-[var(--color-text-tertiary)]">
          {pt.underlying} · {pt.maturityDate}
        </p>

        <div className="mb-[14px] flex flex-col gap-[7px]">
          <MetricRow label="Maturity" value={`${pt.daysToMaturity} days`} />
          <MetricRow
            label="Implied APY"
            value={`${pt.impliedApy.toFixed(2)}%`}
            accent="pt"
          />
          <MetricRow
            label="Redemption value"
            value={`${pt.redemptionValue.toFixed(2)} ${pt.underlying}`}
          />
          <MetricRow
            label="Current price"
            value={`${pt.currentPrice.toFixed(4)} ${pt.underlying}`}
          />
          <MetricRow label="Principal risk" value="Protected" />
        </div>

        <ProgressBar
          percent={pt.convergencePercent}
          fillColor="var(--color-pt-fill)"
          startLabel="Convergence to par"
          endLabel="Par at maturity"
        />
      </div>
    </div>
  );
}

function YTColumn() {
  const yt = ytPosition;

  return (
    <div>
      <div className="border-b-[var(--border)] px-4 pb-[9px] pt-[10px]">
        <PositionTag type="YT" />
      </div>

      <div className="px-4 py-3">
        <p className="mb-[2px] font-[var(--font-mono)] text-[20px] font-medium tabular-nums text-[var(--color-text-primary)]">
          {yt.amount.toFixed(2)} YT
        </p>
        <p className="mb-3 text-[10px] text-[var(--color-text-tertiary)]">
          {yt.underlying} · {yt.maturityDate}
        </p>

        <div className="mb-[14px] flex flex-col gap-[7px]">
          <MetricRow
            label="Time remaining"
            value={`${yt.daysToMaturity} days`}
            accent="yt"
          />
          <MetricRow
            label="Implied APY"
            value={`${yt.impliedApy.toFixed(2)}%`}
            accent="yt"
          />
          <MetricRow
            label="Yield accrued"
            value={`${yt.yieldAccrued.toFixed(2)} ${yt.underlying}`}
          />
          <MetricRow
            label="YT price"
            value={`${yt.ytPrice.toFixed(4)} ${yt.underlying}`}
          />
          <MetricRow label="Yield risk" value="Exposed" accent="yt" />
        </div>

        <ProgressBar
          percent={yt.timeValuePercent}
          fillColor="var(--color-yt-fill)"
          startLabel="Time value remaining"
          endLabel="Zero at maturity"
        />
      </div>
    </div>
  );
}

export default function PositionMatrix() {
  return (
    <Panel
      title="Positions — PT / YT"
      action={{ label: 'Split position →', onClick: () => { } }}
    >
      <div className="grid grid-cols-2">
        <PTColumn />
        <YTColumn />
      </div>
    </Panel>
  );
}