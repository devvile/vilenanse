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

  const amountColor = expense.amount >= 0 ? 'text-emerald-500' : 'text-red-500'

  return (
    <>
      <div className="rounded-xl border border-card-border bg-card p-5 hover:border-card-hover transition-all">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Date and Category */}
            <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-text-secondary">
                {expense.category?.icon && <span>{expense.category.icon}</span>}
                {categoryPath}
              </span>
            </div>

            {/* Merchant/Description */}
            <h3 className="text-lg font-semibold text-text-primary">
              {expense.merchant || expense.description || 'No description'}
            </h3>

            {/* Description (if merchant exists) */}
            {expense.merchant && expense.description && (
              <p className="mt-1 text-sm text-text-secondary">{expense.description}</p>
            )}

            {/* Comment */}
            {expense.comment && (
              <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <p className="text-sm text-emerald-500">
                  <span className="font-medium">Note:</span> {expense.comment}
                </p>
              </div>
            )}

            {/* Transaction Type */}
            {expense.transaction_type && (
              <span className="mt-2 inline-block rounded-full bg-background-secondary px-2.5 py-1 text-xs text-text-secondary">
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
              <p className="mt-1 text-sm text-text-muted">
                ({expense.original_amount.toFixed(2)} {expense.original_currency})
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-card-border pt-4">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-background-secondary px-3 py-2 text-sm font-medium text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors"
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