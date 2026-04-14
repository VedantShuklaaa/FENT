'use client';
import Panel from './panel';

interface Action {
  label: string;
  icon: string;
  primary?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}

const ACTIONS: Action[] = [
  { label: 'Stake SOL', icon: '↓', primary: true, ariaLabel: 'Stake SOL into the protocol' },
  { label: 'Mint LST', icon: '→', ariaLabel: 'Mint liquid staking token' },
  { label: 'Split PT / YT', icon: '⌥', ariaLabel: 'Split LST into PT and YT' },
  { label: 'Buy PT', icon: '+', ariaLabel: 'Buy Principal Token' },
  { label: 'Buy YT', icon: '+', ariaLabel: 'Buy Yield Token' },
  { label: 'Redeem', icon: '↑', ariaLabel: 'Redeem matured position' },
];

export default function ActionRail() {
  return (
    <Panel title="Actions">
      <div className="grid grid-cols-2 gap-2 p-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            aria-label={action.ariaLabel ?? action.label}
            className={
              action.primary
                ? "flex items-center justify-between rounded-md bg-(--color-accent) px-3 py-[9px] text-left font-(--font-sans) text-[12px] font-medium text-[#E8F5F0] transition-[background,transform] duration-[120ms] active:scale-[0.98] hover:bg-[#236650] cursor-pointer"
                : "flex items-center justify-between rounded-md border-(--border-md) bg-(--color-bg-surface) px-3 py-[9px] text-left font-(--font-sans) text-[12px] font-medium text-(--color-text-primary) transition-[background,border-color,transform] duration-[120ms] active:scale-[0.98] hover:bg-(--color-bg-subtle) hover:border-(--color-border-medium) cursor-pointer"
            }
          >
            <span>{action.label}</span>
            <span className="text-[14px] opacity-[0.45]" aria-hidden>
              {action.icon}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}