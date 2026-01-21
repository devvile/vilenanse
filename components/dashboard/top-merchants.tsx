'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { getTopMerchants, DateRange } from '@/lib/actions/dashboard'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface TopMerchantsChartProps {
  initialData: { name: string; value: number }[]
}

export function TopMerchantsChart({ initialData }: TopMerchantsChartProps) {
  const [data, setData] = useState(initialData)
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [loading, setLoading] = useState(false)

  const handleRangeChange = async (range: DateRange) => {
    setDateRange(range)
    setLoading(true)
    try {
      const newData = await getTopMerchants(range)
      setData(newData)
    } catch (error) {
      console.error('Failed to fetch top merchants', error)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...data.map(d => d.value), 0)

  return (
    <Card className="p-6 bg-[#1a1a24] border-white/[0.08] h-full flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-[#1a1a24]/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">Top Merchants</h3>
        <div className="flex bg-[#0d0d12] rounded-lg p-1">
            <button
               onClick={() => handleRangeChange('this_month')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_month' 
                   ? "bg-[#272732] text-white shadow-sm" 
                   : "text-gray-400 hover:text-gray-300"
               )}
             >
              Month
             </button>
             <button
               onClick={() => handleRangeChange('this_year')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_year' 
                   ? "bg-[#272732] text-white shadow-sm" 
                   : "text-gray-400 hover:text-gray-300"
               )}
             >
               Year
             </button>
        </div>
      </div>

      <div className="space-y-4 overflow-auto pr-2 custom-scrollbar flex-1">
        {data.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-500 text-sm">
             No merchant data
           </div>
        ) : (
           data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white font-medium truncate max-w-[180px]" title={item.name}>
                  {item.name}
                </span>
                <span className="text-gray-400">{item.value.toLocaleString()} PLN</span>
              </div>
              <div className="h-2 w-full bg-[#0d0d12] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
