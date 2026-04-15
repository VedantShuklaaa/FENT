import RedeemHistory from '@/components/redeem/redeemHistory';
import HistorySummary from '@/components/history/historySummary'

export default function Page() {
    return (
        <div className="flex flex-col h-[35vh] gap-4 p-2">
            {/*History Summary*/}
            <HistorySummary />

            {/*Redeem History*/}
            <RedeemHistory />
        </div>
    )
}