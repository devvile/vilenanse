'use client'

import { useState, FormEvent } from 'react'
import { createSubcategory } from '@/lib/actions/categories'

interface AddSubcategoryModalProps {
  parentId: string
  parentColor: string
  onClose: () => void
}

const COMMON_ICONS = [
  '🛒', '🍴', '🍔', '☕', '🛵', '🏘️', '🏦', '⚡', '💧', '📡', '🔧',
  '🚇', '🚕', '⛽', '🅿️', '✈️', '📺', '🎥', '🎵', '🎮', '📚',
  '👕', '💻', '🪴', '🎁', '📦', '👨‍⚕️', '💊', '🦷', '🛡️', '💪',
  '📱', '📋', '💇‍♂️', '💄', '🧖', '💵', '💼', '📈', '🏷️'
]

export function AddSubcategoryModal({ parentId, parentColor, onClose }: AddSubcategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏷️',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createSubcategory({
        parent_id: parentId,
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subcategory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Subcategory</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subcategory Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Restaurants"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {COMMON_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`h-10 rounded-md border-2 text-xl transition-all ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Or enter custom emoji"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-2xl focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              maxLength={2}
            />
          </div>

          {/* Color Preview (inherited from parent) */}
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-600">
              Color will be inherited from parent category:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-8 w-8 rounded"
                style={{ backgroundColor: parentColor }}
              />
              <span className="text-sm font-medium text-gray-700">{parentColor}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Subcategory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}