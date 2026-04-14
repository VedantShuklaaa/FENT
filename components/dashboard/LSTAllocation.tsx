'use client';

import React from 'react';
import {
  lstPositions,
  formatSol,
  formatUsd,
  LSTPosition,
} from '@/lib/data';
import Panel from './panel';

function WeightBar({ weight, color }: { weight: number; color: string }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="h-[3px] w-[48px] overflow-hidden rounded-[2px] bg-[var(--color-bg-muted)]">
        <div
          className="h-full rounded-[2px]"
          style={{ width: `${weight}%`, background: color }}
        />
      </div>
      <span className="min-w-[28px] text-right font-[var(--font-mono)] text-[11px] tabular-nums text-[var(--color-text-secondary)]">
        {weight}%
      </span>
    </div>
  );
}

function LSTRow({ item }: { item: LSTPosition }) {
  return (
    <tr className="lst-row cursor-default">
      <td className="whitespace-nowrap border-b-[var(--border)] px-[16px] py-[10px]">
        <div className="flex items-center gap-2">
          <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: item.color }} />
          <div>
            <p className="font-medium text-[12px] text-[var(--color-text-primary)]">{item.symbol}</p>
            <p className="text-[10px] text-[var(--color-text-tertiary)]">{item.name}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap border-b-(--border) px-[16px] py-[10px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-secondary)">{formatSol(item.holdings)} {item.symbol}</td>
      <td className="whitespace-nowrap border-b-(--border) px-[16px] py-[10px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-secondary)">{formatUsd(item.valueUsd)}</td>
      <td className="whitespace-nowrap border-b-(--border) px-[16px] py-[10px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-secondary)">{item.yieldSource}</td>
      <td className="whitespace-nowrap border-b-(--border) px-[16px] py-[10px] text-right font-(--font-mono) text-[11px] tabular-nums text-(--color-text-secondary)">
        <WeightBar weight={item.weight} color={item.color} />
      </td>
    </tr>
  );
}

export default function LSTAllocation() {
  return (
    <>
      <style>{`.lst-row:hover td { background: var(--color-bg-subtle); }`}</style>

      <Panel
        title="LST Allocation"
        action={{ label: 'Mint LST →', onClick: () => { } }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Token', 'Holdings', 'Value', 'Yield Source', 'Weight'].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap border-b-(--border) px-[16px] py-[8px] text-left text-[10px] font-normal uppercase tracking-[0.07em] text-(--color-text-tertiary) ${i > 0 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {lstPositions.map((item) => (
              <LSTRow key={item.symbol} item={item} />
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}