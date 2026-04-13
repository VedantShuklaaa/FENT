export type NavItemId ='dashboard'| 'positions'| 'auctions'| 'lst'| 'redeem'| 'history'| 'settings';

export interface NavItem {
  id:       NavItemId;
  label:    string;
  href:     string;
  icon:     string;   
  badge?:   string;  
  section?: 'main' | 'protocol' | 'account'; 
}

export interface NavSection {
  key:   string;
  label: string;
  items: NavItem[];
}


const ICONS: Record<NavItemId, string> = {
  dashboard:
    'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 5a4 4 0 1 0 8 0 4 4 0 0 0-8 0z',
  positions:
    'M3 17h4v4H3v-4zm6-6h4v10H9V11zm6-8h4v18h-4V3z',
  auctions:
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  lst:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
  redeem:
    'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
  history:
    'M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  settings:
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a6.94 6.94 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
};

// ─── Grouped nav sections ──────────────────────────────────────

export const NAV_SECTIONS: NavSection[] = [
  {
    key:   'main',
    label: 'Overview',
    items: [
      {
        id:      'dashboard',
        label:   'Dashboard',
        href:    '/dashboard',
        icon:    ICONS.dashboard,
        section: 'main',
      },
      {
        id:      'positions',
        label:   'Positions',
        href:    '/positions',
        icon:    ICONS.positions,
        //badge:   '3',
        section: 'main',
      },
    ],
  },
  {
    key:   'protocol',
    label: 'Protocol',
    items: [
      {
        id:      'auctions',
        label:   'Auctions',
        href:    '/auctions',
        icon:    ICONS.auctions,
        badge:   'Live',
        section: 'protocol',
      },
      {
        id:      'lst',
        label:   'LST Allocation',
        href:    '/lst',
        icon:    ICONS.lst,
        section: 'protocol',
      },
      {
        id:      'redeem',
        label:   'Redeem',
        href:    '/redeem',
        icon:    ICONS.redeem,
        section: 'protocol',
      },
    ],
  },
  {
    key:   'account',
    label: 'Account',
    items: [
      {
        id:      'history',
        label:   'History',
        href:    '/history',
        icon:    ICONS.history,
        section: 'account',
      },
      {
        id:      'settings',
        label:   'Settings',
        href:    '/settings',
        icon:    ICONS.settings,
        section: 'account',
      },
    ],
  },
];