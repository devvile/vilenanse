'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format, parseISO, isWithinInterval, subDays } from 'date-fns'

export type DateRange = 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'last_year' | 'last_12_months' | 'all_time'

function getDateRangeInterval(range: DateRange) {
  const now = new Date()
  let start: Date
  let end: Date
  
  switch (range) {
    case 'this_week':
      start = new Date(now)
      start.setDate(now.getDate() - now.getDay()) // Sunday
      start.setHours(0, 0, 0, 0)
      end = now
      break
    case 'this_month':
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break
    case 'last_3_months':
      start = subMonths(now, 3)
      end = now
      break
    case 'this_year':
      start = startOfYear(now)
      end = endOfYear(now)
      break
    case 'last_year':
      start = startOfYear(subMonths(now, 12))
      end = endOfYear(subMonths(now, 12))
      break
    case 'last_12_months':
      start = subMonths(now, 12)
      end = now
      break
    case 'all_time':
      start = new Date('2000-01-01')
      end = now
      break
    default:
      start = startOfMonth(subMonths(now, 1))
      end = endOfMonth(subMonths(now, 1))
  }
  
  console.log(`Date range for ${range}:`, {
    start: start.toISOString(),
    end: end.toISOString()
  })
  
  return { start, end }
}

export async function getDashboardStats(range: DateRange = 'last_month') {
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
  const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  
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

export async function getExpensesByCategory(range: DateRange = 'last_month') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  console.log('Fetching expenses with date range:', { start: start.toISOString(), end: end.toISOString() })

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      category_id,
      transaction_date,
      category:categories(id, name, color, parent_id)
    `)
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0) // Only expenses

  if (error) {
    console.error('Error fetching expenses by category:', error)
    throw error
  }

  console.log('Raw expenses data:', expenses?.length, 'expenses found')

  // Get all unique parent category IDs from subcategories
  const parentIds = expenses
    // @ts-ignore
    ?.map(e => e.category && !Array.isArray(e.category) ? e.category.parent_id : null)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) as string[] || []

  // Fetch parent categories
  let parentCategoriesMap = new Map<string, { id: string, name: string, color: string }>()
  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from('categories')
      .select('id, name, color')
      .in('id', parentIds)
    
    parents?.forEach(p => {
      parentCategoriesMap.set(p.id, { id: p.id, name: p.name, color: p.color })
    })
  }

  console.log('Parent categories found:', parentCategoriesMap.size)
  
  // Aggregate by MAIN (parent) category
  const categoryMap = new Map<string, { name: string, value: number, color: string, id: string, parent_id: string | null }>()

  expenses?.forEach((e, index) => {
    const amount = Math.abs(e.amount)
    
    // Handle uncategorized (when category_id is null)
    if (!e.category_id || !e.category) {
      const uncatId = 'uncategorized'
      if (categoryMap.has(uncatId)) {
        categoryMap.get(uncatId)!.value += amount
      } else {
        categoryMap.set(uncatId, {
          id: uncatId,
          name: 'Uncategorized',
          value: amount,
          color: '#6b7280',
          parent_id: null
        })
      }
      return
    }

    // @ts-ignore
    const category = Array.isArray(e.category) ? e.category[0] : e.category
    
    if (!category) {
      console.warn(`Expense ${index} has category_id but no category data:`, e.category_id)
      return
    }

    // If this is a subcategory (has parent_id), group under parent
    if (category.parent_id && parentCategoriesMap.has(category.parent_id)) {
      const parent = parentCategoriesMap.get(category.parent_id)!
      
      if (categoryMap.has(parent.id)) {
        categoryMap.get(parent.id)!.value += amount
      } else {
        categoryMap.set(parent.id, {
          id: parent.id,
          name: parent.name,
          value: amount,
          color: parent.color,
          parent_id: null
        })
      }
    } else {
      // This is already a main category (no parent_id)
      const catId = category.id
      
      if (categoryMap.has(catId)) {
        categoryMap.get(catId)!.value += amount
      } else {
        categoryMap.set(catId, {
          id: catId,
          name: category.name,
          value: amount,
          color: category.color,
          parent_id: category.parent_id
        })
      }
    }
  })

  const result = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)
  console.log('Aggregated categories (main only):', result.length, 'categories')
  console.log('Category breakdown:', result)
  
  return result
}

export async function getSpendingOverTime(range: DateRange = 'this_year', categoryId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)

  let query = supabase
    .from('expenses')
    .select('amount, transaction_date')
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0)

  if (categoryId) {
    if (categoryId === 'uncategorized') {
      query = query.is('category_id', null)
    } else {
      // Fetch expenses for this category or its subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId)
      
      const ids = [categoryId, ...(subcategories?.map(c => c.id) || [])]
      query = query.in('category_id', ids)
    }
  }

  const { data: expenses, error } = await query
  if (error) throw error

  // Aggregate by month or day depending on range
  const isMonthly = range === 'this_year' || range === 'all_time' || range === 'last_3_months' || range === 'last_year' || range === 'last_12_months'
  
  const timeMap = new Map<string, number>()
  
  expenses?.forEach(e => {
    const date = new Date(e.transaction_date)
    const key = isMonthly ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd')
    const amount = Math.abs(e.amount)
    
    timeMap.set(key, (timeMap.get(key) || 0) + amount)
  })

  return Array.from(timeMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getTopMerchants(range: DateRange = 'last_month') {
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

// New function for Income vs Expenses over multiple months
export async function getIncomeVsExpensesOverTime(range: DateRange = 'this_year') {
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

  if (error) throw error

  // Aggregate by month
  const monthMap = new Map<string, { income: number, expenses: number }>()
  
  expenses?.forEach(e => {
    const date = new Date(e.transaction_date)
    const monthKey = format(date, 'MMM yyyy') // e.g., "Dec 2024"
    const amount = e.amount
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthMap.get(monthKey)!
    if (amount > 0) {
      monthData.income += amount
    } else {
      monthData.expenses += Math.abs(amount)
    }
  })

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      // Sort by actual date
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
}

export async function getExpensesBySubcategory(categoryId: string, range: DateRange) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)
  const isUncategorized = categoryId === 'uncategorized'

  let query = supabase
    .from('expenses')
    .select(`
      amount,
      category:categories(id, name, color, parent_id)
    `)
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0)

  if (isUncategorized) {
    query = query.is('category_id', null)
  } else {
    // Step 1: Get all child category IDs (and the category itself)
    const { data: subcategories } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
    
    const ids = [categoryId, ...(subcategories?.map(c => c.id) || [])]
    query = query.in('category_id', ids)
  }

  const { data: expenses, error } = await query
  if (error) throw error

  const subcategoryMap = new Map<string, { id: string, name: string, value: number, color: string }>()

  expenses?.forEach(e => {
    const amount = Math.abs(e.amount)
    let catName = 'Uncategorized'
    let catColor = '#6b7280'
    let catId = 'uncategorized'

    if (e.category) {
       // @ts-ignore
      const cat = Array.isArray(e.category) ? e.category[0] : e.category
      catId = cat.id
      catName = cat.name
      catColor = cat.color
    }

    if (subcategoryMap.has(catId)) {
      subcategoryMap.get(catId)!.value += amount
    } else {
      subcategoryMap.set(catId, {
        id: catId,
        name: catName,
        value: amount,
        color: catColor
      })
    }
  })

  return Array.from(subcategoryMap.values()).sort((a, b) => b.value - a.value)
}

export async function getBalanceAtEndOfRange(range: DateRange) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { end } = getDateRangeInterval(range)

  // Fetch all income - all expenses from the start of time until 'end'
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .lte('transaction_date', end.toISOString())

  if (error) throw error

  const balance = data?.reduce((sum, e) => sum + e.amount, 0) || 0
  
  return {
    balance,
    asOf: end.toLocaleDateString()
  }
}

export async function getCategoryTransactions(categoryId: string, range: DateRange) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = getDateRangeInterval(range)
  const isUncategorized = categoryId === 'uncategorized'

  let query = supabase
    .from('expenses')
    .select(`
      id,
      amount,
      merchant,
      transaction_date
    `)
    .eq('user_id', user.id)
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString())
    .lt('amount', 0)
    .order('transaction_date', { ascending: false })

  if (isUncategorized) {
    query = query.is('category_id', null)
  } else {
    const { data: subcategories } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
    
    const ids = [categoryId, ...(subcategories?.map(c => c.id) || [])]
    query = query.in('category_id', ids)
  }

  const { data: expenses, error } = await query
  if (error) throw error

  return expenses
}
