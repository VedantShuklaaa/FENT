'use client';
import Panel from '@/components/dashboard/panel';

interface MechanicNote {
    title: string;
    body: string;
    dotColor: string;
}

const NOTES: MechanicNote[] = [
    {
        dotColor: 'var(--color-accent)',
        title: 'Uniform-price auction',
        body: 'All winning bids in a round settle at the single clearing price — not individual bid prices. Bidding above clearing gives you a better fill probability but you still pay clearing.',
    },
    {
        dotColor: 'var(--color-pt-fill)',
        title: 'PT price discovery',
        body: 'PT prices are expressed as a fraction of par (1.0). A clearing price of 0.9712 means a 2.88% discount — which, annualised over 82 days, implies a 7.84% APY.',
    },
    {
        dotColor: 'var(--color-yt-fill)',
        title: 'YT price dynamics',
        body: 'YT price = LST APY expectation x time remaining. As maturity nears or expected yield drops, YT prices fall. YT reaches zero at maturity.',
    },
    {
        dotColor: 'var(--color-text-tertiary)',
        title: 'On-chain settlement',
        body: 'Clearing price is computed on-chain from the order book at round close. Bids at or above clearing price are filled. Bids below clearing are returned in full.',
    },
    {
        dotColor: 'var(--color-text-tertiary)',
        title: 'Round cadence',
        body: 'Auctions run on a fixed schedule tied to epoch boundaries. Each round is independent — prices reset to the new order book at the start of every round.',
    },
];

export default function AuctionMechanics() {
    return (
        <Panel title="Auction Mechanics">
            <div className={`flex flex-col gap-3 px-4 py-[14px]`}>
                {NOTES.map((note) => (
                    <div key={note.title} className={`flex items-start gap-[10px]`}>
                        <span className={`mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full`} style={{ background: note.dotColor }} aria-hidden />
                        <p className={`text-[11px] leading-[1.65] text-(--color-text-secondary)`}>
                            <strong className={`text-[11px] font-medium text-(--color-text-primary)`}>{note.title} — </strong>
                            {note.body}
                        </p>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

