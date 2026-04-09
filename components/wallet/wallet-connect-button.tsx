"use client";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { truncateAddress } from "@/lib/utils";

type WalletConnectButtonProp = {
    className?: string,
    showNetwork?: boolean
}

export function WalletConnectButton({
    className,
    showNetwork = false,
}: WalletConnectButtonProp) {
    const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
    const { setVisible } = useWalletModal();

    const shortAddress = useMemo(() => {
        return publicKey ? truncateAddress(publicKey.toBase58()) : '';
    }, [publicKey]);

    const handleClick = async () => {
        if (connected) {
            await disconnect().catch(console.error);
        } else {
            setVisible(true); 
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-2 border border-zinc-700 p-2 text-sm font-mono text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors cursor-pointer rounded-sm ${className}`}
        >
            {connecting && <span>Connecting...</span>}
            {!connecting && !connected && <span>Connect Wallet</span>}
            {connected && <span>{shortAddress}</span>}

            {showNetwork && connected && (
                <span className="opacity-50">{wallet?.adapter.name}</span>
            )}
        </button>
        </div>
    )
}