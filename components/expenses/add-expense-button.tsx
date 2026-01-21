'use client'

import { useState } from 'react'
import { AddExpenseModal } from './add-expense-modal'
import { Plus } from 'lucide-react'

export function AddExpenseButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Expense
      </button>

      {isOpen && <AddExpenseModal onClose={() => setIsOpen(false)} />}
    </>
  )
}