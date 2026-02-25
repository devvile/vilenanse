'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMealsForDay(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .eq('eaten_at', date)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching meals for day:', error)
    return []
  }
  return data || []
}

export async function getMealsForWeek(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('eaten_at', startDate)
    .lte('eaten_at', endDate)
    .order('eaten_at', { ascending: true })

  if (error) {
    console.error('Error fetching meals for week:', error)
    return []
  }
  return data || []
}

export async function getMealsForMonth(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('eaten_at', startDate)
    .lte('eaten_at', endDate)
    .order('eaten_at', { ascending: true })

  if (error) {
    console.error('Error fetching meals for month:', error)
    return []
  }
  return data || []
}

export async function addMeal(meal: {
  name: string
  calories: number
  eaten_at: string
  caused_hurt: boolean
  is_munchies: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('meals')
    .insert([{ ...meal, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/health/calories')
  return data
}

export async function updateMeal(mealId: string, updates: {
  name?: string
  calories?: number
  eaten_at?: string
  caused_hurt?: boolean
  is_munchies?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', mealId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/health/calories')
  return data
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/health/calories')
}

export async function getCalorieLimit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .select('daily_calorie_limit')
    .eq('id', user.id)
    .single()

  if (error) {
    // If profile doesn't exist, create it
    if (error.code === 'PGRST116') {
      const { data: newData, error: createError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, daily_calorie_limit: 2000 }])
        .select('daily_calorie_limit')
        .single()
      
      if (createError) {
        console.error('Error creating profile:', createError)
        return 2000
      }
      return newData?.daily_calorie_limit || 2000
    }
    console.error('Error fetching calorie limit:', error)
    return 2000
  }
  return data?.daily_calorie_limit || 2000
}

export async function updateCalorieLimit(limit: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, daily_calorie_limit: limit })

  if (error) throw error
  revalidatePath('/health/calories')
}
