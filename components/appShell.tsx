'use client';
import React from 'react';
import Sidebar from '@/components/layout/sidebar/sidebar';
import { useSidebarContext } from '@/lib/context/SidebarContext';
import DashboardHeader from '@/components/dashboard/dashboardHeader';
import Footer from '@/components/layout/footer/footer';

interface AppShellProps {
    children: React.ReactNode;
}

function MainContent({
    children
}: AppShellProps) {
    const { collapsed } = useSidebarContext();

    return (
        <main className='flex-1 min-w-0 h-screen overflow-y-auto transition-[margin-left] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]'>
            {children}
        </main>
    );
}

export default function AppShell({
    children
}: AppShellProps) {
    return (
        <div className='flex h-screen overflow-hidden bg-(--color-bg-base)'>
            <Sidebar />
            <div className='flex min-w-0 flex-1 flex-col h-screen overflow-hidden'>
                <DashboardHeader
                    walletAddress="7xKq…d4Rn"
                    network="mainnet"
                />
                <main className='flex-1 min-h-0 overflow-y-auto'>
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
