'use client';
import { ytScenarios } from '@/lib/data';
import Panel from './panel';

export default function YTSensitivity() {
  return (
    <Panel title="YT Sensitivity">
      <div className={`px-4 py-[14px]`}>
        <p className={`mb-3 text-[11px] leading-[1.6] text-(--color-text-tertiary)`}>
          If implied APY shifts from current 8.34%, your YT position value changes as follows:
        </p>
        <table className={`w-full border-collapse text-[11px]`}>
          <thead>
            <tr>
              {['Scenario', 'APY', 'YT Price', 'P&L'].map((h, i) => (
                <th
                  key={h}
                  className={`border-b-(--border) py-1 text-left text-[9px] font-normal uppercase tracking-[0.07em] text-(--color-text-tertiary) ${i > 0 ? `text-right` : ``}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ytScenarios.map((s) => {
              const isCurrent = s.pnlPercent === null;
              const isPos = (s.pnlPercent ?? 0) > 0;
              const pnlColor = isCurrent
                ? 'var(--color-text-tertiary)'
                : isPos
                  ? 'var(--color-positive)'
                  : 'var(--color-negative)';

              return (
                <tr
                  key={s.label}
                  className={`${isCurrent ? `border-b-(--border) bg-(--color-bg-subtle)` : `border-b-(--border)`}`}
                >
                  <td className={`py-[7px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary)`}>{s.label}</td>
                  <td className={`py-[7px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) text-right`}>
                    {s.apy.toFixed(2)}%
                  </td>
                  <td className={`py-[7px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) text-right`}>
                    {s.ytPrice.toFixed(4)}
                  </td>
                  <td className={`py-[7px] font-(--font-mono) text-[11px] tabular-nums text-(--color-text-primary) text-right`} style={{ color: pnlColor }}>
                    {isCurrent
                      ? 'Current'
                      : `${isPos ? '+' : ''}${s.pnlPercent!.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

