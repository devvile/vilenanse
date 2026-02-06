'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createExpense } from '@/lib/actions/expenses'
import { getCategoriesHierarchical } from '@/lib/actions/categories'
import { Category } from '@/lib/types/database.types'
import { X } from 'lucide-react'

interface AddExpenseModalProps {
  onClose: () => void
}

export function AddExpenseModal({ onClose }: AddExpenseModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'PLN',
    merchant: '',
    description: '',
    category_id: '',
    comment: '',
  })

  useEffect(() => {
    getCategoriesHierarchical().then(setCategories).catch(console.error)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createExpense({
        transaction_date: formData.transaction_date,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        merchant: formData.merchant || undefined,
        description: formData.description || undefined,
        category_id: formData.category_id || undefined,
        comment: formData.comment || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "mt-1 block w-full rounded-lg bg-[#0d0d12] border border-white/[0.1] px-3 py-2 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1a1a24] border border-white/[0.08] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Add New Expense</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className={inputClasses}
              />
            </div>

            {/* Currency */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className={inputClasses}
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className={inputClasses}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className={inputClasses}
            >
              <option value="">Select category...</option>
              {categories.map((main) => (
                <optgroup key={main.id} label={`${main.icon || '📁'} ${main.name}`} className="bg-[#1a1a24] text-white">
                  {main.subcategories?.map((sub: Category) => (
                    <option key={sub.id} value={sub.id} className="bg-[#1a1a24] text-white">
                      {sub.icon || '🔹'} {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Merchant / Payee
            </label>
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              placeholder="e.g., Starbucks, Amazon"
              className={inputClasses}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What was this for?"
              className={inputClasses}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}