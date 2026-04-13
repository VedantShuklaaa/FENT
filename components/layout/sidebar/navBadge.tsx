'use client';
import React from 'react';

interface NavBadgeProps {
  value:     string;
  collapsed?: boolean;
}

export default function NavBadge({ value, collapsed = false }: NavBadgeProps) {
  const isNumeric = /^\d+$/.test(value);

  if (collapsed && !isNumeric) return null;

  const isLive = value === 'Live';

  return (
    <span style={{
      ...styles.base,
      ...(isLive    ? styles.live    : {}),
      ...(isNumeric ? styles.numeric : {}),
      ...(collapsed ? styles.collapsed : {}),
    }}>
      {isLive && <span style={styles.liveDot} />}
      {value}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            4,
    fontFamily:     'var(--font-mono)',
    fontSize:       9,
    fontWeight:     500,
    letterSpacing:  '0.04em',
    padding:        '2px 6px',
    borderRadius:   3,
    lineHeight:     1,
    whiteSpace:     'nowrap',
  },

  live: {
    background: 'var(--color-accent-bg)',
    color:      'var(--color-accent-text)',
    border:     '0.5px solid var(--color-accent-border)',
  },

  numeric: {
    background: 'var(--color-bg-muted)',
    color:      'var(--color-text-secondary)',
    minWidth:   18,
    justifyContent: 'center',
  },

  collapsed: {
    position:   'absolute',
    top:        4,
    right:      4,
    padding:    '1px 4px',
    fontSize:   8,
  },

  liveDot: {
    display:      'inline-block',
    width:        5,
    height:       5,
    borderRadius: '50%',
    background:   'var(--color-accent)',
    flexShrink:   0,
  },
};