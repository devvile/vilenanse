// components/expenses/expenses-list.tsx
'use client'

import { ExpenseWithCategory } from '@/lib/types/database.types'
import { ExpenseCard } from './expense-card'
import { useState, useEffect } from 'react'
import { bulkDeleteExpenses, bulkUpdateExpenseCategories } from '@/lib/actions/expenses'
import { useRouter } from 'next/navigation'

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
}

export function ExpensesList({ expenses, categories = [] }: ExpensesListProps) {
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
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-md">
          <div className="flex flex-col gap-4">
            {/* Top Row - Selection Info and Clear */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-blue-900">
                  {selectedIds.size} expense{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
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
                  className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {updating ? 'Assigning...' : 'Assign Category'}
              </button>

              {/* Delete Section */}
              <div className="flex items-center gap-2 border-l border-blue-300 pl-3">
                {showDeleteConfirm ? (
                  <>
                    <p className="text-sm text-red-900 mr-2 whitespace-nowrap">
                      Delete {selectedIds.size}?
                    </p>
                    <button
                      onClick={handleBulkDelete}
                      disabled={deleting}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
                  >
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <input
          type="checkbox"
          checked={selectedIds.size === expenses.length && expenses.length > 0}
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Select all ({expenses.length} expenses)
        </label>
      </div>

      {/* Expenses List */}
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-start gap-3">
          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              checked={selectedIds.has(expense.id)}
              onChange={() => toggleSelection(expense.id)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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