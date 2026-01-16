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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {Math.abs(totalExpenses).toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-full bg-red-100 p-3">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Total Income */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Income</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {totalIncome.toFixed(2)} PLN
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        {hasActiveFilters && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {filteredCount} of {totalCount} expenses
          </p>
        )}
      </div>

      {/* Net Balance */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Net Balance</p>
            <p className={`mt-2 text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{netAmount.toFixed(2)} PLN
            </p>
          </div>
          <div className={`rounded-full p-3 ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            <svg 
              className={`h-6 w-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
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