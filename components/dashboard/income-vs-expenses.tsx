'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { useTheme } from '../theme-provider'

interface IncomeVsExpensesChartProps {
  data: {
    month: string
    income: number
    expenses: number
  }[]
}

const defaultData = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 2000, expenses: 9800 },
  { month: 'Apr', income: 2780, expenses: 3908 },
  { month: 'May', income: 1890, expenses: 4800 },
  { month: 'Jun', income: 2390, expenses: 3800 },
  { month: 'Jul', income: 3490, expenses: 4300 },
]

export function IncomeVsExpensesChart({ data = defaultData }: IncomeVsExpensesChartProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <Card className="p-6 bg-card border-card-border h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-semibold text-text-primary">Income vs Expenses</h3>
        <p className="text-sm text-text-muted">Monthly comparison</p>
      </div>

      <div className="flex-1 min-h-[300px]">
         {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-muted text-sm">
               No data available
            </div>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
               <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isLight ? '#64748b' : '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isLight ? '#64748b' : '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${value} PLN`}
              />
              <Tooltip 
                cursor={{ fill: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#1a1a24', 
                  border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: isLight ? '#1e293b' : '#fff' }}
                labelStyle={{ color: isLight ? '#1e293b' : '#fff' }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} PLN`, '']}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                name="Income"
                fill="#22c55e" 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar 
                dataKey="expenses" 
                name="Expenses"
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
         )}
      </div>
    </Card>
  )
}
