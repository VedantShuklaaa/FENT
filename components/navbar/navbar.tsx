import Link from "next/link";
import { WalletConnectButton } from "../wallet/wallet-connect-button";

interface NavElement {
    title: string;
    href: string;
}

type NavbarProps = {
    elements: NavElement[],
    Title: string,
    className?: string,
};

export function Navbar({
    elements,
    Title,
    className = ""
}: NavbarProps) {
    return (
        <nav className={`absolute w-[60vw] top-5 left-1/2 -translate-x-1/2 px-5 py-2 border flex items-center justify-between rounded-lg font-mono ${className}`}>
            <span className="text-2xl cursor-pointer hover:text-zinc-200">{Title}</span>

            <div className="flex gap-6">
                {elements.map((items, idx) => (
                    <Link
                        key={idx}
                        href={items.href}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
                    >
                        {items.title}
                    </Link>
                ))}
            </div>

            <WalletConnectButton />
        </nav>
    );
}