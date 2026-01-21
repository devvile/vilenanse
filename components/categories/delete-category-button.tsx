'use client'

import { useState } from 'react'
import { deleteCategory } from '@/lib/actions/categories'
import { Trash2, AlertTriangle, X, Check } from 'lucide-react'

interface DeleteCategoryButtonProps {
  categoryId: string
  isSubcategory?: boolean
}

export function DeleteCategoryButton({ categoryId, isSubcategory = false }: DeleteCategoryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteCategory(categoryId)
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert("Cannot delete category with associated expenses.")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    if (isSubcategory) {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded p-1.5 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            title="Confirm"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded p-1.5 text-gray-400 hover:bg-white/[0.1] hover:text-white"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-lg bg-white/[0.05] px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/[0.1] hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (isSubcategory) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg bg-white/[0.05] p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      title="Delete Category"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}