// components/expenses/expenses-list.tsx
'use client'

import { ExpenseWithCategory } from '@/lib/types/database.types'
import { ExpenseCard } from './expense-card'
import { useState, useEffect } from 'react'
import { bulkDeleteExpenses, bulkUpdateExpenseCategories } from '@/lib/actions/expenses'
import { useRouter } from 'next/navigation'
import { FileText, X, Trash2, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  parent_id: string | null
  color?: string
  icon?: string
  display_order?: number
}

interface ExpensesListProps {
  expenses: ExpenseWithCategory[]
  categories?: Category[]
  totalCount?: number
}

export function ExpensesList({ expenses, categories = [], totalCount }: ExpensesListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  // Get hierarchical categories
  const mainCategories = categories.filter(cat => !cat.parent_id)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('')
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([])

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedMainCategory) {
      const subcats = categories.filter(cat => cat.parent_id === selectedMainCategory)
      setAvailableSubcategories(subcats)
      setSelectedCategoryId('') // Reset subcategory selection
    } else {
      setAvailableSubcategories([])
      setSelectedCategoryId('')
    }
  }, [selectedMainCategory, categories])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(expenses.map(e => e.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    setDeleting(true)
    try {
      await bulkDeleteExpenses(Array.from(selectedIds))
      setSelectedIds(new Set())
      setShowDeleteConfirm(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete expenses:', error)
      alert('Failed to delete expenses. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkCategoryAssignment = async () => {
    if (selectedIds.size === 0 || !selectedCategoryId) {
      alert('Please select a category first')
      return
    }

    setUpdating(true)
    try {
      await bulkUpdateExpenseCategories(Array.from(selectedIds), selectedCategoryId)
      setSelectedIds(new Set())
      setSelectedMainCategory('')
      setSelectedCategoryId('')
      router.refresh()
    } catch (error) {
      console.error('Failed to update categories:', error)
      alert('Failed to update categories. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const selectClasses = "w-full rounded-lg border border-card-border bg-background-secondary px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-card-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-text-muted" />
        <h3 className="mt-2 text-sm font-semibold text-text-primary">No expenses</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Get started by creating a new expense.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-lg p-4 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Top Row - Selection Info and Clear */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-emerald-300">
                  {selectedIds.size} expense{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear selection
                </button>
              </div>
            </div>

            {/* Bottom Row - Category Assignment and Delete */}
            <div className="flex items-center gap-3">
              {/* Main Category Dropdown */}
              <div className="flex-1">
                <select
                  value={selectedMainCategory}
                  onChange={(e) => setSelectedMainCategory(e.target.value)}
                  className={selectClasses}
                  disabled={updating}
                >
                  <option value="">Select main category...</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              <div className="flex-1">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={!selectedMainCategory || availableSubcategories.length === 0 || updating}
                  className={`${selectClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Select subcategory...</option>
                  {availableSubcategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign Button */}
              <button
                onClick={handleBulkCategoryAssignment}
                disabled={!selectedCategoryId || updating}
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
              >
                <Tag className="h-4 w-4" />
                {updating ? 'Assigning...' : 'Assign Category'}
              </button>

              {/* Delete Section */}
              <div className="flex items-center gap-2 border-l border-card-border pl-3">
                {showDeleteConfirm ? (
                  <>
                    <p className="text-sm text-red-400 mr-2 whitespace-nowrap">
                      Delete {selectedIds.size}?
                    </p>
                    <button
                      onClick={handleBulkDelete}
                      disabled={deleting}
                      className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50 whitespace-nowrap transition-colors"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-full border border-card-border bg-background-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:bg-card-hover whitespace-nowrap transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/30 whitespace-nowrap transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center justify-between rounded-xl border border-card-border bg-card p-4 text-sm">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="select-all-checkbox"
            checked={selectedIds.size === expenses.length && expenses.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-gray-600 bg-background-secondary text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="select-all-checkbox" className="font-medium text-text-secondary cursor-pointer">
            Select all <span className="text-text-muted ml-1 font-normal">({expenses.length} on page)</span>
          </label>
        </div>
        {totalCount !== undefined && (
          <p className="text-text-secondary">
            Total match: <span className="font-bold text-text-primary">{totalCount}</span> expenses
          </p>
        )}
      </div>

      {/* Expenses List */}
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-start gap-3">
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              checked={selectedIds.has(expense.id)}
              onChange={() => toggleSelection(expense.id)}
              className="h-5 w-5 rounded border-gray-600 bg-background-secondary text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
          </div>
          <div className="flex-1">
            <ExpenseCard expense={expense} />
          </div>
        </div>
      ))}
    </div>
  )
}