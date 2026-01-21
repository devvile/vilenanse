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
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {Math.abs(totalExpenses).toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-3">
            <TrendingDown className="h-6 w-6 text-red-400" />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Total Income */}
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Income</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {totalIncome.toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Net Balance */}
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Net Balance</p>
            <p className={`mt-2 text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{netAmount.toFixed(2)} PLN
            </p>
          </div>
          <div className={`rounded-xl p-3 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <DollarSign className={`h-6 w-6 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-gray-500">
            Based on filtered results
          </p>
        )}
      </div>
    </div>
  )
}