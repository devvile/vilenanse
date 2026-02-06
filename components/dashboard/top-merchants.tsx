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
    <Card className="p-6 bg-card border-card-border h-full flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-card/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text-primary">Top Merchants</h3>
        <div className="flex bg-background rounded-lg p-1">
            <button
               onClick={() => handleRangeChange('this_month')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_month' 
                   ? "bg-background-secondary text-text-primary shadow-sm" 
                   : "text-text-muted hover:text-text-secondary"
               )}
             >
              Month
             </button>
             <button
               onClick={() => handleRangeChange('this_year')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_year' 
                   ? "bg-background-secondary text-text-primary shadow-sm" 
                   : "text-text-muted hover:text-text-secondary"
               )}
             >
               Year
             </button>
        </div>
      </div>

      <div className="space-y-4 overflow-auto pr-2 custom-scrollbar flex-1">
        {data.length === 0 ? (
           <div className="h-full flex items-center justify-center text-text-muted text-sm">
             No merchant data
           </div>
        ) : (
           data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center gap-3 text-sm">
                <span className="text-text-primary font-medium" title={item.name}>
                  {item.name.length > 25 ? item.name.slice(0, 22) + '...' : item.name}
                </span>
                <span className="text-text-muted shrink-0 font-bold">{item.value.toLocaleString()} PLN</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
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
