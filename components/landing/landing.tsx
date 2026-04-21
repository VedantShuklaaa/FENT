'use client';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { WalletConnectButton } from "../wallet/wallet-connect-button";
import { NetworkBridge } from "../wallet/network-bridge";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const sections = gsap.utils.toArray<HTMLDivElement>(".panel");

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            snap: {
                snapTo: 1 / (sections.length - 1),
                duration: 0.5,
                ease: "power2.inOut",
            },
        });
    }, { scope: containerRef });

    return (
        <div ref={containerRef}>
            <div className="panel h-screen flex flex-col items-center justify-center gap-2">
                <NetworkBridge/>
                <WalletConnectButton/>
            </div>
            <div className="panel h-screen flex items-center justify-center">Section 2</div>
            <div className="panel h-screen flex items-center justify-center">Section 3</div>
            <div className="panel h-screen flex items-center justify-center">Section 4</div>
        </div>
    )
}