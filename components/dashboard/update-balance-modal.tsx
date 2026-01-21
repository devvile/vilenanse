'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createExpense } from '@/lib/actions/expenses'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface UpdateBalanceModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
}

export function UpdateBalanceModal({ isOpen, onClose, currentBalance }: UpdateBalanceModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('Balance Adjustment')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount)) return

      // If user wants to set NEW balance to X, we need to calculate difference
      // But user likely just wants to ADD/SUBTRACT money or set a specific amount.
      // Let's assume this adds a transaction.
      // If we want "Update Balance" to SET the balance, we'd need to calculate the diff.
      // Let's implement "Add Transaction" style for now as it's safer.
      // Or better: "Set Balance" to value X -> creates adjustments.
      
      // Feature: Set specific balance
      // target = current + adjustment
      // adjustment = target - current
      
      const adjustment = numAmount - currentBalance
      
      if (Math.abs(adjustment) < 0.01) {
        onClose()
        return
      }

      await createExpense({
        amount: adjustment,
        transaction_date: date,
        description: description,
        category_id: undefined, // Uncategorized or System
        currency: 'PLN', // Default
        transaction_type: adjustment > 0 ? 'deposit' : 'withdrawal'
      })

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Failed to update balance', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a24] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle>Update Balance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium text-gray-400">
              New Balance Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currentBalance.toFixed(2)}
              className="flex h-10 w-full rounded-md border border-white/[0.08] bg-[#0d0d12] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            <p className="text-xs text-gray-500">
              This will create a transaction to adjust your balance to this amount.
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-400">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/[0.08] bg-[#0d0d12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="desc" className="text-sm font-medium text-gray-400">
              Note
            </label>
            <input
              id="desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/[0.08] bg-[#0d0d12] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500 text-black hover:bg-emerald-400 h-10 px-4 py-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Balance'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
