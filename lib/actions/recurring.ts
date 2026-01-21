'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type RecurringExpense = {
  id: string
  user_id: string
  name: string
  amount: number
  payment_day: number
  category_id: string | null
  created_at: string
  category?: {
    id: string
    name: string
    color: string
  } | null
}

export type RecurringStats = {
  totalMonthly: number
  nextPaymentDate: string
  nextPaymentAmount: number
  daysUntilNext: number
}

export async function getRecurringExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('recurring_expenses')
    .select(`
      *,
      category:categories(id, name, color)
    `)
    .eq('user_id', user.id)
    .order('payment_day', { ascending: true })

  if (error) {
    console.error('Error fetching recurring expenses:', error)
    throw new Error('Failed to fetch recurring expenses')
  }

  const today = new Date()
  const currentDay = today.getDate()

  // Custom sort: items due earlier (closer to today or earlier this month) first
  // If payment_day >= currentDay, it's due this month.
  // If payment_day < currentDay, it's due next month.
  const sortedData = (data as RecurringExpense[]).sort((a, b) => {
    const aDueThisMonth = a.payment_day >= currentDay
    const bDueThisMonth = b.payment_day >= currentDay

    if (aDueThisMonth && !bDueThisMonth) return -1
    if (!aDueThisMonth && bDueThisMonth) return 1
    
    // If both are due in the same "period" (this month or next month), sort by day
    return a.payment_day - b.payment_day
  })

  return sortedData
}

export async function addRecurringExpense(data: {
  name: string
  amount: number
  payment_day: number
  category_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('recurring_expenses').insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    payment_day: data.payment_day,
    category_id: data.category_id || null
  })

  if (error) {
    console.error('Error adding recurring expense:', error)
    throw new Error('Failed to add recurring expense')
  }

  revalidatePath('/incoming')
  revalidatePath('/dashboard') // In case we add stats there later
}

export async function updateRecurringExpense(id: string, data: {
  name?: string
  amount?: number
  payment_day?: number
  category_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('recurring_expenses')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating recurring expense:', error)
    throw new Error('Failed to update recurring expense')
  }

  revalidatePath('/incoming')
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting recurring expense:', error)
    throw new Error('Failed to delete recurring expense')
  }

  revalidatePath('/incoming')
}

export async function getRecurringStats(expenses: RecurringExpense[]): Promise<RecurringStats> {
  const today = new Date()
  const currentDay = today.getDate()
  
  const totalMonthly = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  
  // Find next payment
  let nextPayment: RecurringExpense | null = null
  let minDaysDiff = Infinity
  
  expenses.forEach(expense => {
    let diff = expense.payment_day - currentDay
    if (diff < 0) {
      // Payment is next month
      // Estimate days until next month's payment day
      // Simple approximation: (days in month - current day) + payment day
      // Better: accurate date calculation
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, expense.payment_day)
      const diffTime = Math.abs(nextMonth.getTime() - today.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
      
      if (diffDays < minDaysDiff) {
        minDaysDiff = diffDays
        nextPayment = expense
      }
    } else {
      // Payment is this month
      if (diff < minDaysDiff) {
        minDaysDiff = diff
        nextPayment = expense
      }
    }
  })

  // Format next payment date string
  let nextPaymentDateStr = '-'
  if (nextPayment) {
    const nextDate = new Date()
    if ((nextPayment as RecurringExpense).payment_day < currentDay) {
       nextDate.setMonth(nextDate.getMonth() + 1)
    }
    nextDate.setDate((nextPayment as RecurringExpense).payment_day)
    nextPaymentDateStr = nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return {
    totalMonthly,
    nextPaymentDate: nextPaymentDateStr,
    nextPaymentAmount: nextPayment ? (nextPayment as RecurringExpense).amount : 0,
    daysUntilNext: minDaysDiff === Infinity ? 0 : minDaysDiff
  }
}
