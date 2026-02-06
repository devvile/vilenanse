'use client'

import { useState, FormEvent } from 'react'
import { createSubcategory } from '@/lib/actions/categories'
import { X, Check } from 'lucide-react'

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

  const inputClasses = "mt-1 block w-full rounded-lg border border-card-border bg-background-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  const labelClasses = "block text-sm font-medium text-text-muted mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Add Subcategory</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-background-secondary hover:text-text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className={labelClasses}>
              Subcategory Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Restaurants"
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

          {/* Icon */}
          <div>
            <label className={labelClasses}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2 mb-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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

          {/* Color Preview (inherited from parent) */}
          <div className="rounded-xl border border-card-border bg-background p-4">
            <p className="text-xs text-text-muted mb-2">
              Color inherited from parent category:
            </p>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg shadow-sm"
                style={{ backgroundColor: parentColor }}
              />
              <span className="text-sm font-medium text-text-secondary font-mono bg-background-secondary px-2 py-1 rounded">
                {parentColor}
              </span>
            </div>
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
                  Create Subcategory
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}