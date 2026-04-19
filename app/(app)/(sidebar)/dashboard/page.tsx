'use client';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import LSTAllocation from '@/components/dashboard/LSTAllocation';
import PositionMatrix from '@/components/dashboard/PositionMatrix';
import AuctionPanel from '@/components/dashboard/AuctionPanel';
import { ProtocolNotes, ProtocolEvents } from '@/components/dashboard/ProtocolNotes';
import ActionRail from '@/components/dashboard/ActionRail';
import YTSensitivity from '@/components/dashboard/YTSensitivity';

export default function Page() {
  return (
    <div className="min-h-full bg-[var(--color-bg-base)]">
      <PortfolioSummary />

      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-4 px-6 py-5">
        <div className="flex flex-col gap-4">
          <LSTAllocation />
          <PositionMatrix />
          <AuctionPanel />
        </div>

        <div className="flex flex-col gap-4">
          <ActionRail />
          <ProtocolNotes />
          <ProtocolEvents />
          <YTSensitivity />
        </div>
      </div>
    </div>
  );
}