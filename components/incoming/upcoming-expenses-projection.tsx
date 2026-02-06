'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Landmark, TrendingDown } from 'lucide-react'
import { RecurringExpense } from '@/lib/actions/recurring'

interface UpcomingExpensesProjectionProps {
  expenses: RecurringExpense[]
}

export function UpcomingExpensesProjection({ expenses }: UpcomingExpensesProjectionProps) {
  const [payday, setPayday] = useState(18)
  const today = new Date()
  const currentDay = today.getDate()

  const calculateTotalBeforePayday = () => {
    let total = 0
    expenses.forEach(expense => {
      const pDay = expense.payment_day
      
      if (payday > currentDay) {
        // Range is [today, payday] within this month
        if (pDay >= currentDay && pDay < payday) {
          total += Number(expense.amount)
        }
      } else {
        // Range spans across months: [today, end of month] + [start of next month, payday]
        if (pDay >= currentDay || pDay < payday) {
          total += Number(expense.amount)
        }
      }
    })
    return total
  }

  const projectedTotal = calculateTotalBeforePayday()

  return (
    <Card className="p-6 bg-card border-card-border relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Landmark className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Salary Projection</h3>
          <p className="text-xs text-text-muted">Total bills before your next payday</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            My next payday is on the:
          </label>
          <div className="flex items-center gap-3">
            <select
              value={payday}
              onChange={(e) => setPayday(parseInt(e.target.value))}
              className="w-20 rounded-xl border border-card-border bg-background px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-muted">day of the month</span>
          </div>
        </div>

        <div className="pt-4 border-t border-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <TrendingDown className="h-4 w-4" />
              <span>Projected Outflow:</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-text-primary">
                {projectedTotal.toFixed(2)}
              </span>
              <span className="text-sm text-text-muted ml-1">PLN</span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted mt-2 italic">
            * Sum of all recurring items due from today up to the {payday}th.
          </p>
        </div>
      </div>
    </Card>
  )
}
