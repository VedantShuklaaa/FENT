import React from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import DashboardHeader from "@/components/dashboard/dashboardHeader";

export default function Page() {
    return (
        <div className="font-mono bg-background" style={{backgroundColor: 'var(--background)'}}>
            <div className="z-0 pointer-events-none fixed inset-0 opacity-[0.04] bg-[url(/bg.svg)]" />

            <DashboardHeader
                walletAddress="7xKq…d4Rn"
                network="mainnet"
            />
        </div>
    )
}