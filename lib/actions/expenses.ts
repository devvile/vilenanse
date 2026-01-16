'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateExpenseInput, UpdateExpenseInput } from '@/lib/types/database.types'
import { ParsedExpense, findDuplicates } from '@/lib/utils/csv-parser'

export async function getExpenses() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First get expenses with their direct category
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (expensesError) throw expensesError

  // Then fetch parent categories for those that have them
  const categoryIds = expenses
    ?.map(e => e.category?.parent_id)
    .filter(Boolean) || []

  let parentCategories: any[] = []
  if (categoryIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)
    
    if (parentsError) throw parentsError
    parentCategories = parents || []
  }

  // Combine the data
  const expensesWithParents = expenses?.map(expense => ({
    ...expense,
    parent_category: expense.category?.parent_id
      ? parentCategories.find(p => p.id === expense.category?.parent_id)
      : null
  }))

  return expensesWithParents
}

export async function bulkDeleteExpenses(ids: string[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/expenses')
  return { success: true, deleted: ids.length }
}

export async function getExpensesPaginated(page: number = 1, limit: number = 20) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const offset = (page - 1) * limit

  // Get total count
  const { count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get paginated data
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories!expenses_category_id_fkey(*)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  // Fetch parent categories
  const categoryIds = data
    ?.map(e => e.category?.parent_id)
    .filter(Boolean) || []

  let parentCategories: any[] = []
  if (categoryIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)
    
    if (!parentsError) {
      parentCategories = parents || []
    }
  }

  const expensesWithParents = data?.map(expense => ({
    ...expense,
    parent_category: expense.category?.parent_id
      ? parentCategories.find(p => p.id === expense.category?.parent_id)
      : null
  }))

  return {
    expenses: expensesWithParents || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  }
}

export async function bulkUpdateExpenseCategories(ids: string[], categoryId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .update({ category_id: categoryId })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/expenses')
  return { success: true, updated: ids.length }
}


export async function getExpense(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get the expense with its category
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (expenseError) throw expenseError

  // If the category has a parent, fetch it
  let parent_category = null
  if (expense.category?.parent_id) {
    const { data: parent, error: parentError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', expense.category.parent_id)
      .single()
    
    if (!parentError) {
      parent_category = parent
    }
  }

  return {
    ...expense,
    parent_category
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      transaction_date: input.transaction_date,
      amount: input.amount,
      currency: input.currency || 'PLN',
      merchant: input.merchant,
      description: input.description,
      category_id: input.category_id,
      comment: input.comment,
      transaction_type: input.transaction_type,
      is_confirmed: true, // Manual entries are auto-confirmed
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/expenses')
  return data
}

export async function updateExpense(input: UpdateExpenseInput) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { id, ...updates } = input

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/expenses')
  return data
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/expenses')
  return { success: true }
}

export async function bulkCreateExpenses(expenses: ParsedExpense[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Prepare data for bulk insert
  const expensesToInsert = expenses.map(expense => ({
    user_id: user.id,
    transaction_date: expense.transaction_date,
    booking_date: expense.booking_date,
    amount: expense.amount,
    currency: expense.currency,
    merchant: expense.merchant,
    description: expense.description,
    transaction_type: expense.transaction_type,
    original_amount: expense.original_amount,
    original_currency: expense.original_currency,
    category_id: null, // All imported expenses are uncategorized initially
    is_confirmed: false, // User needs to review
  }))

  const { data, error } = await supabase
    .from('expenses')
    .insert(expensesToInsert)
    .select()

  if (error) throw error
  
  revalidatePath('/expenses')
  return data
}

// Helper to check for potential duplicates
export async function checkDuplicates(expenses: ParsedExpense[]) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all existing expenses for this user
  const { data: existingExpenses, error } = await supabase
    .from('expenses')
    .select('transaction_date, amount, merchant')
    .eq('user_id', user.id)

  if (error) throw error

  const duplicates = findDuplicates(expenses, existingExpenses || [])
  
  return Array.from(duplicates)
}