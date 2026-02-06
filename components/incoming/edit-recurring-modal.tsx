'use client'

import { useState, useTransition, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RecurringExpense, updateRecurringExpense } from '@/lib/actions/recurring'
import { Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
  parent_id: string | null
}

interface EditRecurringModalProps {
  expense: RecurringExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

export function EditRecurringModal({ expense, open, onOpenChange, categories }: EditRecurringModalProps) {
  const [isPending, startTransition] = useTransition()
  
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('1')
  const [categoryId, setCategoryId] = useState('')

  const mainCategories = categories.filter(c => !c.parent_id)
  
  useEffect(() => {
    if (expense) {
      setName(expense.name)
      setAmount(String(expense.amount))
      setDay(String(expense.payment_day))
      setCategoryId(expense.category_id || '')
    }
  }, [expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !amount || !day || !expense) return
    
    startTransition(async () => {
       try {
         await updateRecurringExpense(expense.id, {
           name,
           amount: Number(amount),
           payment_day: Number(day),
           category_id: categoryId || undefined
         })
         onOpenChange(false)
       } catch (error) {
         console.error('Failed to update recurring expense', error)
       }
    })
  }

  const inputClasses = "w-full rounded-xl border border-card-border bg-background px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
  const labelClasses = "block text-sm font-medium text-text-muted mb-1.5"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-card-border text-text-primary p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">Edit Recurring Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClasses}>Expense Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix Subscription"
              className={inputClasses}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className={labelClasses}>Amount (PLN)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={inputClasses}
                  required
                />
             </div>
             <div>
                <label className={labelClasses}>Day of Month</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={inputClasses}
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
             </div>
          </div>
          
          <div>
            <label className={labelClasses}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClasses}
            >
              <option value="">Uncategorized</option>
              {mainCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
