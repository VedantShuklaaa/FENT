'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yieldr:sidebar:collapsed';
const COLLAPSE_SHORTCUT = '[';
const MOBILE_BREAKPOINT = 768;

interface UseSidebarReturn {
  collapsed:  boolean;
  toggle:     () => void;
  collapse:   () => void;
  expand:     () => void;
  isMobile:   boolean;
}

export function useSidebar(defaultCollapsed = false): UseSidebarReturn {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : defaultCollapsed;
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) setCollapsed(true);
    };
    setIsMobile(mq.matches);
    if (mq.matches) setCollapsed(true);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === COLLAPSE_SHORTCUT) {
        setCollapsed((c) => !c);
      }
      if (e.key === 'Escape' && isMobile) {
        setCollapsed(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobile]);

  const toggle   = useCallback(() => setCollapsed((c) => !c), []);
  const collapse = useCallback(() => setCollapsed(true), []);
  const expand   = useCallback(() => setCollapsed(false), []);

  return { collapsed, toggle, collapse, expand, isMobile };
}