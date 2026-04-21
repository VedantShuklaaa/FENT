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
            console.log('wallet button clicked')
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
                className={`flex items-center gap-2 px-[11px] py-[6px] border p-2 bg-(--color-bg-subtle) [border:var(--border-md)] text-sm font-mono text-(--color-text-secondary) hover:border-zinc-400 transition-colors cursor-pointer rounded-md ${className}`}
            >
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-(--color-accent)" />
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