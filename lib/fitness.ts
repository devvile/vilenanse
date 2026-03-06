'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Training {
    id: string
    user_id: string
    name: string
    description: string | null
    calories: number
    training_date: string // YYYY-MM-DD
    created_at: string
    updated_at: string
}

export async function getTrainings(startDate: string, endDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .eq('user_id', user.id)
        .gte('training_date', startDate)
        .lte('training_date', endDate)
        .order('training_date', { ascending: true })
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching trainings:', error)
        return []
    }
    return data as Training[]
}

export async function addTraining(training: Omit<Training, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('trainings')
        .insert([{ ...training, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    revalidatePath('/health/fitness')
    return data as Training
}

export async function updateTraining(id: string, updates: Partial<Omit<Training, 'id' | 'user_id' | 'created_at'>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('trainings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw error
    revalidatePath('/health/fitness')
    return data as Training
}

export async function deleteTraining(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw error
    revalidatePath('/health/fitness')
}
