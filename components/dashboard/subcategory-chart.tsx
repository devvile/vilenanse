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

interface SubcategoryChartProps {
  data: { name: string; value: number; color: string }[]
  loading: boolean
  categoryName: string
}

export function SubcategoryChart({ data, loading, categoryName }: SubcategoryChartProps) {
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  return (
    <Card className="p-6 bg-[#1a1a24] border-white/[0.08] h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-white">
            {categoryName ? `${categoryName} Breakdown` : 'Subcategory Analysis'}
          </h3>
          <p className="text-sm text-gray-400">
            {categoryName ? 'Detailed look at expenses in this category' : 'Select a category to see details'}
          </p>
        </div>
        
        {categoryName && !loading && total > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Category Total</p>
            <p className="text-xl font-bold text-emerald-500">
              {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium opacity-70">PLN</span>
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 bg-[#1a1a24]/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        {(!data || data.length === 0) && !loading ? (
          <div className="text-gray-500 text-sm">
            {categoryName ? 'No subcategory data available' : 'Click on the chart to analyze specifics'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                width={100}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.18)' }}
                contentStyle={{ 
                  backgroundColor: '#1a1a24', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: any) => [`${Number(value).toFixed(2)} PLN`, 'Spent']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
