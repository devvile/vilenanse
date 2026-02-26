'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SleepRecord {
  id?: string
  user_id: string
  logical_date: string // YYYY-MM-DD
  woke_up_at: string | null // ISO TIMESTAMPTZ
  started_day_at: string | null // ISO TIMESTAMPTZ
  went_to_bed_at: string | null // ISO TIMESTAMPTZ
  created_at?: string
  updated_at?: string
}

export interface SleepPreferences {
  desired_woke_up_at: string // HH:mm:ss
  desired_started_day_at: string // HH:mm:ss
  desired_went_to_bed_at: string // HH:mm:ss
}

export async function getSleepRecord(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('sleep_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('logical_date', date)
    .maybeSingle()

  if (error) {
    console.error('Error fetching sleep record:', error)
    return null
  }
  return data as SleepRecord | null
}

export async function getSleepRecordsForWeek(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('sleep_records')
    .select('*')
    .eq('user_id', user.id)
    .gte('logical_date', startDate)
    .lte('logical_date', endDate)
    .order('logical_date', { ascending: true })

  if (error) {
    console.error('Error fetching sleep records for week:', error)
    return []
  }
  return data as SleepRecord[]
}

export async function getSleepRecordsLast30Days() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('sleep_records')
    .select('*')
    .eq('user_id', user.id)
    .order('logical_date', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Error fetching last 30 days sleep records:', error)
    return []
  }
  return data as SleepRecord[]
}

export async function upsertSleepRecord(date: string, fields: Partial<Omit<SleepRecord, 'id' | 'user_id' | 'logical_date'>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('sleep_records')
    .upsert({
      user_id: user.id,
      logical_date: date,
      ...fields,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,logical_date' })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/health/sleep')
  return data as SleepRecord
}

export async function deleteSleepField(date: string, field: 'woke_up_at' | 'started_day_at' | 'went_to_bed_at') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('sleep_records')
    .update({ [field]: null, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('logical_date', date)

  if (error) throw error
  revalidatePath('/health/sleep')
}

export async function getSleepPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .select('desired_woke_up_at, desired_started_day_at, desired_went_to_bed_at')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching sleep preferences:', error)
    return {
      desired_woke_up_at: '07:00:00',
      desired_started_day_at: '08:00:00',
      desired_went_to_bed_at: '23:00:00'
    } as SleepPreferences
  }
  return data as SleepPreferences
}

export async function updateSleepPreferences(preferences: Partial<SleepPreferences>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update(preferences)
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/health/sleep')
}
