import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react'

interface ExpensesSummaryProps {
  totalExpenses: number
  totalIncome: number
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
}

export function ExpensesSummary({ 
  totalExpenses, 
  totalIncome, 
  totalCount,
  filteredCount,
  hasActiveFilters 
}: ExpensesSummaryProps) {
  const netAmount = totalIncome + totalExpenses // totalExpenses is negative
  const isPositive = netAmount >= 0

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Expenses */}
      <div className="rounded-xl border border-card-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-red-500">
              {Math.abs(totalExpenses).toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-3">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-text-muted">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Total Income */}
      <div className="rounded-xl border border-card-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Income</p>
            <p className="mt-2 text-3xl font-bold text-emerald-500">
              {totalIncome.toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-text-muted">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Net Balance */}
      <div className="rounded-xl border border-card-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Net Balance</p>
            <p className={`mt-2 text-3xl font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{netAmount.toFixed(2)} PLN
            </p>
          </div>
          <div className={`rounded-xl p-3 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <DollarSign className={`h-6 w-6 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-text-muted">
            Based on filtered results
          </p>
        )}
      </div>
    </div>
  )
}