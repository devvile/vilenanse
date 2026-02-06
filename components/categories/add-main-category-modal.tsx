'use client'

import { useState, FormEvent } from 'react'
import { createMainCategory } from '@/lib/actions/categories'
import { X, Check } from 'lucide-react'

interface AddMainCategoryModalProps {
  onClose: () => void
}

const COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Gray', value: '#6B7280' },
]

const COMMON_ICONS = ['🍽️', '🏠', '🚗', '🎬', '🛍️', '🏥', '💡', '💇', '💰', '📦', '✈️', '🎓', '🐾', '🏋️', '📱']

export function AddMainCategoryModal({ onClose }: AddMainCategoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createMainCategory({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        icon: formData.icon,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "mt-1 block w-full rounded-lg border border-card-border bg-background-secondary px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  const labelClasses = "block text-sm font-medium text-text-muted mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Add Category</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-background-secondary hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className={labelClasses}>
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Food & Dining"
              className={inputClasses}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClasses}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              className={inputClasses}
            />
          </div>

          {/* Color */}
          <div>
            <label className={labelClasses}>
              Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-text-primary scale-110'
                      : 'border-transparent hover:border-text-muted'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className={labelClasses}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {COMMON_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`flex h-10 items-center justify-center rounded-lg border border-card-border bg-background-secondary text-xl transition-all ${
                    formData.icon === icon
                      ? 'border-emerald-500 bg-emerald-500/10 scale-110'
                      : 'hover:bg-card-hover'
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
              className={`${inputClasses} text-center text-xl`}
              maxLength={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-card-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-card-border bg-background-secondary px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}