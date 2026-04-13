"use client";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";


export const description = "A line chart"
const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
]
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
}


export default function Page() {



    return (
        <main className="font-mono min-h-screen w-full flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]" >
            <div className="z-0 pointer-events-none fixed inset-0 opacity-[0.04] bg-[url(/bg.svg)]" />

            <div className="h-[50vh] w-full flex">
                <div className="h-full w-[70%] flex p-1">
                    <div className={`h-full w-full border border-(--color-border-medium) rounded-md p-2 flex `}>
                        <div className="h-10 w-full flex items-center justify-between text-(--color-text-secondary)">
                            <div>
                                <span className="text-lg">Solana</span>
                                <span className="text-xs">(SOL)</span>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div className="h-full w-[30%] flex flex-col gap-2 p-1">
                    <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                    </div>

                    <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                    </div>

                    <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                    </div>
                </div>
            </div>

            <div className="h-[50vh] w-full p-1">
                <div className="h-full w-full rounded-md">

                </div>
            </div>

            <div className="h-[30vh] w-full p-1 gap-2 flex">
                <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                </div>

                <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                </div>

                <div className={`h-full w-full border border-(--color-border-medium) rounded-md`}>

                </div>
            </div>

        </main>
    )
}