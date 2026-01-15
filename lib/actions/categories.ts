'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}

export async function getCategoriesHierarchical() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all categories
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })

  if (error) throw error

  // Organize into hierarchy
  const mainCategories = data.filter(cat => !cat.parent_id)
  const hierarchy = mainCategories.map(main => ({
    ...main,
    subcategories: data.filter(cat => cat.parent_id === main.id)
  }))

  return hierarchy
}

export async function getSubcategories(parentId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('parent_id', parentId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data
}