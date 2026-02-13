'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UserPreferences {
  id: string
  user_id: string
  language: string
  theme: string
  currency: string
  created_at: string
  updated_at: string
}

export interface UpdatePreferencesInput {
  language?: string
  theme?: string
  currency?: string
}

/**
 * Get the current user's preferences
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error('Error fetching preferences:', error)
    return null
  }

  return data
}

/**
 * Update user preferences (upsert)
 */
export async function updateUserPreferences(input: UpdatePreferencesInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...input,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error updating preferences:', error)
    throw new Error('Failed to update preferences')
  }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return { success: true }
}
