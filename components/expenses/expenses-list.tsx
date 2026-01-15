'use client'

import { ExpenseWithCategory } from '@/lib/types/database.types'
import { ExpenseCard } from './expenses-card'

interface ExpensesListProps {
  expenses: ExpenseWithCategory[]
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No expenses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new expense.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  )
}