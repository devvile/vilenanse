'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addRecurringExpense } from '@/lib/actions/recurring'
import { Plus, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
  parent_id: string | null
}

interface AddRecurringModalProps {
  categories: Category[]
}

export function AddRecurringModal({ categories }: AddRecurringModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('1')
  const [categoryId, setCategoryId] = useState('')

  const mainCategories = categories.filter(c => !c.parent_id)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !amount || !day) return
    
    startTransition(async () => {
       try {
         await addRecurringExpense({
           name,
           amount: Number(amount),
           payment_day: Number(day),
           category_id: categoryId || undefined
         })
         setOpen(false)
         resetForm()
       } catch (error) {
         console.error('Failed to add recurring expense', error)
       }
    })
  }
  
  const resetForm = () => {
    setName('')
    setAmount('')
    setDay('1')
    setCategoryId('')
  }

  const inputClasses = "w-full rounded-xl border border-white/[0.08] bg-[#1a1a24] px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
  const labelClasses = "block text-sm font-medium text-gray-400 mb-1.5"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
          <Plus className="h-4 w-4" />
          Add Recurring
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0d0d12] border-white/[0.08] text-white p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">New Recurring Expense</DialogTitle>
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
              {isPending ? 'Adding...' : 'Add Recurring Expense'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
