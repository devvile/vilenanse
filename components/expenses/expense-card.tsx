'use client'

import { ExpenseWithCategory } from '@/lib/types/database.types'
import { useState } from 'react'
import { EditExpenseModal } from './edit-expense-modal'
import { DeleteExpenseButton } from './delete-expense-button'
import { Pencil } from 'lucide-react'

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

  const amountColor = expense.amount >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <>
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-5 hover:border-white/[0.12] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Date and Category */}
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-gray-400">
                {expense.category?.icon && <span>{expense.category.icon}</span>}
                {categoryPath}
              </span>
            </div>

            {/* Merchant/Description */}
            <h3 className="text-lg font-semibold text-white">
              {expense.merchant || expense.description || 'No description'}
            </h3>

            {/* Description (if merchant exists) */}
            {expense.merchant && expense.description && (
              <p className="mt-1 text-sm text-gray-400">{expense.description}</p>
            )}

            {/* Comment */}
            {expense.comment && (
              <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <p className="text-sm text-emerald-400">
                  <span className="font-medium">Note:</span> {expense.comment}
                </p>
              </div>
            )}

            {/* Transaction Type */}
            {expense.transaction_type && (
              <span className="mt-2 inline-block rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400">
                {expense.transaction_type}
              </span>
            )}
          </div>

          {/* Amount */}
          <div className="ml-4 text-right">
            <p className={`text-2xl font-bold ${amountColor}`}>
              {expense.amount >= 0 ? '+' : ''}
              {expense.amount.toFixed(2)} <span className="text-sm font-medium opacity-70">PLN</span>
            </p>
            {expense.original_amount && expense.original_currency && (
              <p className="mt-1 text-sm text-gray-500">
                ({expense.original_amount.toFixed(2)} {expense.original_currency})
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-4">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/[0.08] hover:text-white transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
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