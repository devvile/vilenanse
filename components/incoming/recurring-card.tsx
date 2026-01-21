'use client'

import { format } from 'date-fns'
import { Calendar, Clock, Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { RecurringExpense, deleteRecurringExpense } from '@/lib/actions/recurring'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

interface RecurringCardProps {
  expense: RecurringExpense
  onEdit: (expense: RecurringExpense) => void
}

export function RecurringCard({ expense, onEdit }: RecurringCardProps) {
  const [isPending, startTransition] = useTransition()
  
  const today = new Date()
  const currentDay = today.getDate()
  
  let daysLeft = expense.payment_day - currentDay
  let nextDate = new Date(today.getFullYear(), today.getMonth(), expense.payment_day)
  
  if (daysLeft < 0) {
    // Next month
    daysLeft += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    nextDate = new Date(today.getFullYear(), today.getMonth() + 1, expense.payment_day)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recurring expense?')) {
      startTransition(async () => {
        await deleteRecurringExpense(expense.id)
      })
    }
  }

  return (
    <Card className="relative overflow-hidden bg-[#1a1a24] border-white/[0.08] p-5 transition-all hover:bg-[#1f1f2b] hover:border-white/[0.12] group">
      {/* Progress Bar Background (optional visual flair) */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-emerald-500/20" 
        style={{ width: `${Math.max(0, Math.min(100, (1 - daysLeft/30) * 100))}%` }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ 
              backgroundColor: `${expense.category?.color || '#6b7280'}20`, 
              color: expense.category?.color || '#6b7280' 
            }}
          >
            {expense.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{expense.name}</h3>
            <p className="text-xs text-gray-400">{expense.category?.name || 'Uncategorized'}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/[0.08] text-white">
            <DropdownMenuItem onClick={() => onEdit(expense)} className="hover:bg-[#272732] cursor-pointer">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-red-400 hover:bg-[#272732] hover:text-red-300 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white mb-1">
            {Number(expense.amount).toFixed(2)} <span className="text-sm font-normal text-gray-400">PLN</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
             <Calendar className="h-3 w-3" />
             <span>Day {expense.payment_day}</span>
          </div>
        </div>

        <div className="text-right">
           <div className={cn(
             "px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5",
             daysLeft <= 3 ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
             daysLeft <= 7 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
             "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
           )}>
             <Clock className="h-3 w-3" />
             {daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
           </div>
           <p className="text-[10px] text-gray-500 mt-1">
             {format(nextDate, 'MMM d, yyyy')}
           </p>
        </div>
      </div>
    </Card>
  )
}
