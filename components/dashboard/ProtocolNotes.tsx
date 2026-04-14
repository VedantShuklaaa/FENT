'use client';
import Panel from './panel';
import { protocolEvents, ProtocolEvent } from '@/lib/data';

interface Note {
  dotType: 'pt' | 'yt' | 'neutral';
  heading: string;
  body: string;
}

const NOTES: Note[] = [
  {
    dotType: 'pt',
    heading: 'PT converges to par',
    body: 'The price of a Principal Token rises toward 1:1 redemption value as maturity approaches. Buying PT at a discount locks in a fixed yield.',
  },
  {
    dotType: 'yt',
    heading: 'YT decays over time',
    body: 'Yield Tokens lose value as each epoch passes, since fewer future yield epochs remain. At maturity, YT value reaches zero.',
  },
  {
    dotType: 'neutral',
    heading: 'Implied APY is market-driven',
    body: "Implied APY reflects the market's expectation of future staking yield. It changes as PT/YT prices shift in the auction.",
  },
  {
    dotType: 'neutral',
    heading: 'On-chain price discovery',
    body: 'Auction clearing price is fully on-chain. Each round sets a price based on submitted bids — no oracle dependency.',
  },
];

const dotColors: Record<Note['dotType'], string> = {
  pt: 'var(--color-pt-fill)',
  yt: 'var(--color-yt-fill)',
  neutral: 'var(--color-text-tertiary)',
};

const eventColors: Record<ProtocolEvent['type'], string> = {
  yield: 'var(--color-positive)',
  pt: 'var(--color-pt-fill)',
  auction: 'var(--color-text-tertiary)',
  yt: 'var(--color-yt-fill)',
  stake: 'var(--color-positive)',
};

export function ProtocolNotes() {
  return (
    <Panel title="Protocol Notes">
      <div className="flex flex-col gap-3 px-4 py-[14px]">
        {NOTES.map((note) => (
          <div key={note.heading} className="flex items-start gap-[10px]">
            <span
              className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full"
              style={{ background: dotColors[note.dotType] }}
              aria-hidden
            />
            <p className="text-[11px] leading-[1.6] text-[var(--color-text-secondary)]">
              <strong className="text-[11px] font-medium text-[var(--color-text-primary)]">
                {note.heading} —
              </strong>{' '}
              {note.body}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ProtocolEvents() {
  return (
    <Panel title="Protocol Events">
      <div>
        {protocolEvents.map((evt, i) => (
          <div
            key={i}
            className="flex cursor-default items-center gap-3 border-b-[var(--border)] px-4 py-[9px] transition-[background] duration-100 hover:bg-[var(--color-bg-subtle)]"
          >
            <span
              className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full"
              style={{ background: eventColors[evt.type] }}
              aria-hidden
            />
            <span className="flex-1 text-[11px] text-[var(--color-text-primary)]">
              {evt.description}
            </span>
            <span className="whitespace-nowrap font-[var(--font-mono)] text-[10px] text-[var(--color-text-tertiary)]">
              {evt.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}