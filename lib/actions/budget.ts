'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMonthlyBudget(month: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('monthly_budgets')
    .select('limit_amount')
    .eq('user_id', user.id)
    .eq('month', month)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.warn('Error fetching budget:', error)
    return 7500 // Default budget if table missing or error
  }

  return data?.limit_amount ?? 7500
}

export async function updateMonthlyBudget(month: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('monthly_budgets')
    .upsert({
      user_id: user.id,
      month: month,
      limit_amount: amount,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,month'
    })

  if (error) {
    console.error('Error updating budget:', error)
    // If table doesn't exist, we'll see it here. 
    // In a real app we'd need a migration, but here I'll try to use it.
    throw new Error('Failed to update budget limit. Please ensure the monthly_budgets table exists.')
  }

  revalidatePath('/dashboard')
  return { success: true }
}
