'use client';
import React, { createContext, useContext } from 'react';
import { useSidebar } from '@/lib/hooks/useSidebar';

interface SidebarContextValue {
  collapsed: boolean;
  toggle:    () => void;
  collapse:  () => void;
  expand:    () => void;
  isMobile:  boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar(false);

  return (
    <SidebarContext.Provider value={sidebar}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarContext must be used inside <SidebarProvider>');
  }
  return ctx;
}