'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format, parseISO, isWithinInterval, subDays } from 'date-fns'

export type DateRange = 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all_time'

function getDateRangeInterval(range: DateRange) {
  const now = new Date()
  switch (range) {
    case 'this_week':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      return { start: startOfWeek, end: now }
    case 'this_month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'last_3_months':
      return { start: subMonths(now, 3), end: now }
    case 'this_year':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'all_time':
      return { start: new Date(0), end: now }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export async function getDashboardStats(range: DateRange = 'this_month') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  // Fetch all expenses for the range
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('amount, transaction_date')
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())

  if (error) throw error

  // Calculate stats
  let totalIncome = 0
  let totalExpenses = 0
  let largestTransaction = 0
  let transactionCount = 0

  expenses?.forEach(e => {
    const amount = e.amount
    if (amount > 0) {
      totalIncome += amount
    } else {
      totalExpenses += Math.abs(amount)
      if (Math.abs(amount) > largestTransaction) {
        largestTransaction = Math.abs(amount)
      }
    }
    transactionCount++
  })

  // Calculate average daily spending
  // For 'this_month', divide by current day of month
  // For others, divide by days in range
  const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const avgDailyValidPixels = totalExpenses / daysDiff

  // Determine actual days passed in the interval for "this month" to be more accurate
  // If range is this month, use current date - start of month
  let activeDays = daysDiff
  if (range === 'this_month') {
     activeDays = new Date().getDate()
  }
  const avgDaily = totalExpenses / Math.max(1, activeDays)

  return {
    totalIncome,
    totalExpenses,
    avgDaily,
    largestTransaction,
    transactionCount
  }
}

export async function getExpensesByCategory(range: DateRange = 'this_month') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      category:categories(id, name, color, parent_id)
    `)
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0) // Only expenses

  if (error) throw error

  // Aggregate by category
  const categoryMap = new Map<string, { name: string, value: number, color: string, id: string, parent_id: string | null }>()

  expenses?.forEach(e => {
    const amount = Math.abs(e.amount)
    // Handle uncategorized
    const category = e.category || { id: 'uncategorized', name: 'Uncategorized', color: '#6b7280', parent_id: null }
    // @ts-ignore - Supabase types can be tricky with joined relations
    const catData = Array.isArray(category) ? category[0] : category
    
    // We want to group by MAIN category essentially, but if we have subcategories, we might want to group by parent
    // For now, let's just group by the assigned category
    const catId = catData.id
    
    if (categoryMap.has(catId)) {
      categoryMap.get(catId)!.value += amount
    } else {
      categoryMap.set(catId, {
        id: catId,
        name: catData.name,
        value: amount,
        color: catData.color,
        parent_id: catData.parent_id
      })
    }
  })

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)
}

export async function getSpendingOverTime(range: DateRange = 'this_year') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('amount, transaction_date')
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0) 

  if (error) throw error

  // Aggregate by month or day depending on range
  // For 'this_year', aggregate by month
  // For 'this_month' or shorter, aggregate by day
  
  const isMonthly = range === 'this_year' || range === 'all_time'
  
  const timeMap = new Map<string, number>()
  
  // Initialize map with 0s for the whole range if possible (simplified here: just sparse)
  
  expenses?.forEach(e => {
    const date = new Date(e.transaction_date)
    const key = isMonthly ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd')
    const amount = Math.abs(e.amount)
    
    timeMap.set(key, (timeMap.get(key) || 0) + amount)
  })

  // Fill in gaps? For now return sparse
  return Array.from(timeMap.entries()).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTopMerchants(range: DateRange = 'this_month') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('amount, merchant')
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0)

  if (error) throw error

  const merchantMap = new Map<string, number>()

  expenses?.forEach(e => {
    const merchant = e.merchant || 'Unknown'
    const amount = Math.abs(e.amount)
    merchantMap.set(merchant, (merchantMap.get(merchant) || 0) + amount)
  })

  return Array.from(merchantMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

export async function getUncategorizedCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { count, data, error } = await supabase
    .from('expenses')
    .select('amount', { count: 'exact' })
    .eq('user_id', user.id)
    .is('category_id', null)

  if (error) throw error

  const totalAmount = data?.reduce((sum, e) => sum + Math.abs(e.amount), 0) || 0

  return {
    count: count || 0,
    totalAmount
  }
}
