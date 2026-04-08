import Landing from '@/components/landing/landing'
import { ArrowDown } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
    return (
        <main className='font-mono bg-black'>
            <div className='z-0 pointer-events-none fixed inset-0 opacity-[0.04] bg-[url(/bg.svg)]' />

            <div className='h-screen grid grid-cols-3 p-2'>
                <div className='flex flex-col justify-between py-2'>
                    <span />
                    <nav className='flex flex-col gap-1'>
                        <Link href="/" className='text-zinc-500 hover:text-zinc-300 transition-colors'>Home</Link>
                        <Link href="/explore" className='text-zinc-500 hover:text-zinc-300 transition-colors'>Explore</Link>
                        <Link href="/docs" className='text-zinc-500 hover:text-zinc-300 transition-colors'>Docs</Link>
                    </nav>
                    <span />
                </div>

                <div className='flex flex-col items-center justify-between py-2'>
                    <span />
                    <div className='flex flex-col items-center'>
                        <span className='text-[170px] leading-none '>FENt.</span>
                        <span className='text-zinc-500'>pure yield rush</span>
                    </div>
                    <button className='flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer'>
                        <ArrowDown height={15} width={15} className='animate-bounce' />
                        scroll
                    </button>
                </div>

                <div className='flex flex-col items-end justify-between py-2'>
                    <span />
                    <span className='max-w-52 text-end text-zinc-500 text-sm leading-relaxed'>
                        FENT is a Solana-native protocol for turning staking yield into tradable
                        exposure through transparent auctions and tokenized positions
                    </span>
                    <span className='text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer'>
                        Fentanyl
                    </span>
                </div>
            </div>

            <div>
                <Landing />
            </div>
        </main>
    )
}