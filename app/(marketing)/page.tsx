import { ArrowDown } from 'lucide-react'
import Link from 'next/link'

{/*LANDING PAGE*/ }
export default function Page() {
    return (
        <div className='min-h-screen h-screen flex items-center justify-between font-mono p-2'>
            <div className='z-0 pointer-events-none fixed inset-0 opacity-[0.04] bg-[url(/bg.svg)]'></div>
            <div className='flex flex-col items-start justify-between'>
                <span></span>
                <span className='w-50 flex flex-col '>
                    <Link href="/" className='text-zinc-500 hover:text-zinc-300 cursor-pointer'>Home</Link>
                    <Link href="/explore" className='text-zinc-500 hover:text-zinc-300 cursor-pointer'>Explore</Link>
                    <Link href="/docs" className='text-zinc-500 hover:text-zinc-300 cursor-pointer'>Docs</Link>
                </span>
                <span></span>
            </div>

            <div className='h-full flex flex-col items-center justify-between'>
                <div></div>
                <div className='flex flex-col items-center justify-end'>
                    <span className='text-[170px] text-zinc-400 flex items-center justify-center h-40'>FENT</span>
                    <span className='text-zinc-500'>pure yield rush</span>
                </div>
                <div className='flex items-end justify-between'>
                    <span></span>
                    <span className='flex items-center justify-end gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer'><ArrowDown height={15} width={15} /> scroll</span>
                    <span></span>
                </div>
            </div>

            <div className='h-full flex flex-col items-end justify-between'>
                <span></span>
                <span className='w-50 text-end text-zinc-500'>
                    FENT is a Solana-native protocol for turning staking yield into tradable exposure through transparent auctions and tokenized positions
                </span>
                <span className='text-zinc-500 hover:text-zinc-300 cursor-pointer'>Fentanyl</span>
            </div>
        </div>
    )
}