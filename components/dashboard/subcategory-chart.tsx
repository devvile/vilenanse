'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { useTheme } from '../theme-provider'

interface SubcategoryChartProps {
  data: { id: string; name: string; value: number; color: string }[]
  loading: boolean
  categoryName: string
  onSubcategorySelect?: (subcategory: { id: string; name: string }) => void
  selectedSubcategoryId?: string
}

export function SubcategoryChart({ 
  data, 
  loading, 
  categoryName, 
  onSubcategorySelect,
  selectedSubcategoryId 
}: SubcategoryChartProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  return (
    <Card className="p-6 bg-card border-card-border h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-text-primary">
            {categoryName ? `${categoryName} Breakdown` : 'Subcategory Analysis'}
          </h3>
          <p className="text-sm text-text-muted">
            {categoryName ? 'Detailed look at expenses in this category' : 'Select a category to see details'}
          </p>
        </div>
        
        {categoryName && !loading && total > 0 && (
          <div className="text-right">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Category Total</p>
            <p className="text-xl font-bold text-emerald-500">
              {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium opacity-70">PLN</span>
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 bg-card/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        {(!data || data.length === 0) && !loading ? (
          <div className="text-text-muted text-sm">
            {categoryName ? 'No subcategory data available' : 'Click on the chart to analyze specifics'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: isLight ? '#64748b' : '#9ca3af', fontSize: 12 }}
                width={100}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)', stroke: 'none', strokeWidth: 0 }}
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#1a1a24', 
                  border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: isLight ? '#1e293b' : '#fff' }}
                labelStyle={{ color: isLight ? '#1e293b' : '#fff' }}
                formatter={(value: any) => [`${Number(value).toFixed(2)} PLN`, 'Spent']}
              />
<Bar 
  dataKey="value" 
  radius={[0, 4, 4, 0]} 
  barSize={32}
  className="cursor-pointer focus:outline-none"
  isAnimationActive={true}
  activeBar={false}
  onClick={(data, index, e) => {
    // Prevent focus
    const target = e?.target as HTMLElement
    if (target) {
      target.blur()
      target.style.outline = 'none'
    }
    if (data && data.id && data.name) {
      onSubcategorySelect?.({ id: data.id, name: data.name })
    }
  }}
>
  {data.map((entry, index) => (
    <Cell 
      key={`cell-${index}`} 
      fill={entry.color} 
      fillOpacity={selectedSubcategoryId && selectedSubcategoryId !== entry.id ? 0.3 : 1}
      className="transition-all duration-300"
    />
  ))}
</Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
