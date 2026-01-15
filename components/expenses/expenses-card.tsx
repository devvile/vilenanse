'use client'

import { ExpenseWithCategory } from '@/lib/types/database.types'
import { useState } from 'react'
import { EditExpenseModal } from './edit-expense-modal'
import { DeleteExpenseButton } from './delete-expense-button'

interface ExpenseCardProps {
  expense: ExpenseWithCategory
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const categoryPath = expense.category
    ? expense.category.parent_id && expense.parent_category
      ? `${expense.parent_category.name} > ${expense.category.name}`
      : expense.category.name
    : 'Uncategorized'

  const formattedDate = new Date(expense.transaction_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const amountColor = expense.amount >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Date and Category */}
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                {expense.category?.icon && <span>{expense.category.icon}</span>}
                {categoryPath}
              </span>
            </div>

            {/* Merchant/Description */}
            <h3 className="text-lg font-semibold text-gray-900">
              {expense.merchant || expense.description || 'No description'}
            </h3>

            {/* Description (if merchant exists) */}
            {expense.merchant && expense.description && (
              <p className="mt-1 text-sm text-gray-600">{expense.description}</p>
            )}

            {/* Comment */}
            {expense.comment && (
              <div className="mt-2 rounded-md bg-blue-50 p-2">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Note:</span> {expense.comment}
                </p>
              </div>
            )}

            {/* Transaction Type */}
            {expense.transaction_type && (
              <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {expense.transaction_type}
              </span>
            )}
          </div>

          {/* Amount */}
          <div className="ml-4 text-right">
            <p className={`text-2xl font-bold ${amountColor}`}>
              {expense.amount >= 0 ? '+' : ''}
              {expense.amount.toFixed(2)} {expense.currency}
            </p>
            {expense.original_amount && expense.original_currency && (
              <p className="mt-1 text-sm text-gray-500">
                ({expense.original_amount.toFixed(2)} {expense.original_currency})
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={() => setIsEditOpen(true)}
            className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            Edit
          </button>
          <DeleteExpenseButton expenseId={expense.id} />
        </div>
      </div>

      {isEditOpen && (
        <EditExpenseModal
          expense={expense}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}