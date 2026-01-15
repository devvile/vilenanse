'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateExpenseInput, UpdateExpenseInput } from '@/lib/types/database.types'

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