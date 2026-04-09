"use client";
import { useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

type NetworkBridgeProps = {
    className?: string
}

const NETWORK_CONFIG: Record<string, { label: string; styles: string }> = {
    devnet: { label: "Devnet", styles: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
    testnet: { label: "Testnet", styles: "bg-yellow-500/10  text-yellow-300  border-yellow-500/20" },
    mainnet: { label: "Mainnet", styles: "bg-blue-500/10    text-blue-300    border-blue-500/20" },
    localhost: { label: "Localnet", styles: "bg-purple-500/10  text-purple-300  border-purple-500/20" },
    "127.0.0.1": { label: "Localnet", styles: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
} as const;

const FALLBACK = { label: "Custom RPC", styles: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" };

function resolveNetwork(endpoint: string) {
    const lower = endpoint.toLowerCase();
    return Object.entries(NETWORK_CONFIG).find(([key]) => lower.includes(key))?.[1] ?? FALLBACK;
}

export function NetworkBridge({ className = "" }: NetworkBridgeProps) {
    const { connection } = useConnection();

    const { label, styles } = useMemo(
        () => resolveNetwork(connection.rpcEndpoint),
        [connection.rpcEndpoint]
    );

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${styles} ${className}`}>
            <span className="h-2 w-2 rounded-full bg-current opacity-80 animate-pulse duration-75" />
            <span>{label}</span>
        </div>
    );
}