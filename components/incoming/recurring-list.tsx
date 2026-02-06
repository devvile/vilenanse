'use client'

import { useState } from 'react'
import { RecurringCard } from './recurring-card'
import { EditRecurringModal } from './edit-recurring-modal'
import { RecurringExpense } from '@/lib/actions/recurring'
import { Plus } from 'lucide-react'
import { AddRecurringModal } from './add-recurring-modal'

interface Category {
  id: string
  name: string
  color: string
  parent_id: string | null
}

interface RecurringListProps {
  expenses: RecurringExpense[]
  categories: Category[]
}

export function RecurringList({ expenses, categories }: RecurringListProps) {
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleEdit = (expense: RecurringExpense) => {
    setEditingExpense(expense)
    setIsEditOpen(true)
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border bg-card/50 p-12 text-center">
        <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
          <Plus className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No recurrent expenses</h3>
        <p className="text-sm text-text-muted max-w-sm mb-6">
          Add your monthly subscriptions, rent, or other fixed costs to track them automatically.
        </p>
        <AddRecurringModal categories={categories} />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((expense) => (
          <RecurringCard 
            key={expense.id} 
            expense={expense} 
            onEdit={handleEdit} 
          />
        ))}
      </div>

      <EditRecurringModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        expense={editingExpense} 
        categories={categories}
      />
    </>
  )
}
