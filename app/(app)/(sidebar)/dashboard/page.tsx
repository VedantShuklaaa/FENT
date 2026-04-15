'use client';
import React from 'react';
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import LSTAllocation from '@/components/dashboard/LSTAllocation';
import PositionMatrix from '@/components/dashboard/PositionMatrix';
import AuctionPanel from '@/components/dashboard/AuctionPanel';
import { ProtocolNotes, ProtocolEvents } from '@/components/dashboard/ProtocolNotes';
import ActionRail from '@/components/dashboard/ActionRail';
import YTSensitivity from '@/components/dashboard/YTSensitivity';

export default function Page() {
  return (
    <div style={styles.root}>
      {/* ── Portfolio summary strip ──────────────────────────── */}
      <PortfolioSummary />

      {/* ── Main body: asymmetric 2-col grid ────────────────── */}
      <div style={styles.body}>

        {/* Left column — 3fr */}
        <div style={styles.leftCol}>
          <LSTAllocation />
          <PositionMatrix />
          <AuctionPanel />
        </div>

        {/* Right column — 2fr */}
        <div style={styles.rightCol}>
          <ActionRail />
          <ProtocolNotes />
          <ProtocolEvents />
          <YTSensitivity />
        </div>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100%',
    background: 'var(--color-bg-base)',
  },

  body: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
    gap: 16,
    padding: '20px 24px',
    maxWidth: 1400,
    margin: '0 auto',
    alignItems: 'start',
  },

  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
};