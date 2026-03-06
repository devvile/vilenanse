'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Habit {
    id: string
    name: string
    emoji: string
    color: string
    is_archived: boolean
    display_order: number
    created_at: string
}

export interface HabitCompletion {
    id: string
    habit_id: string
    completed_at: string // YYYY-MM-DD
}

export async function getHabits() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching habits:', error)
        return []
    }
    return data as Habit[]
}

export async function addHabit(habit: { name: string; emoji: string; color: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check limit of 5 active habits
    const { count } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_archived', false)

    if (count && count >= 5) {
        throw new Error('You can only have up to 5 active habits.')
    }

    const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    revalidatePath('/tasks/habits')
    return data
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) throw error
    revalidatePath('/tasks/habits')
    return data
}

export async function deleteHabit(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw error
    revalidatePath('/tasks/habits')
}

export async function toggleHabitCompletion(habitId: string, date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Check if completion exists
    const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completed_at', date)
        .single()

    if (existing) {
        const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('id', existing.id)
        if (error) throw error
    } else {
        const { error } = await supabase
            .from('habit_completions')
            .insert([{ habit_id: habitId, user_id: user.id, completed_at: date }])
        if (error) throw error
    }

    revalidatePath('/tasks/habits')
}

export async function getHabitCompletions(startDate: string, endDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate)

    if (error) {
        console.error('Error fetching completions:', error)
        return []
    }
    return data as HabitCompletion[]
}

export async function getHabitStreaks(habitId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false })

    if (error || !completions) return { current: 0, longest: 0 }

    const completionsSet = new Set(completions.map(c => c.completed_at))

    let currentStreak = 0
    let longestStreak = 0

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Current streak
    if (completionsSet.has(todayStr) || completionsSet.has(yesterdayStr)) {
        let checkDate = completionsSet.has(todayStr) ? today : yesterday
        while (completionsSet.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
        }
    }

    // Longest streak
    if (completions.length > 0) {
        let tempStreak = 1
        for (let i = 1; i < completions.length; i++) {
            const curr = new Date(completions[i - 1].completed_at)
            const prev = new Date(completions[i].completed_at)
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

            if (Math.round(diff) === 1) {
                tempStreak++
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 1
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak)
    }

    return { current: currentStreak, longest: longestStreak }
}
