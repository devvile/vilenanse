'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })

  if (error) throw error

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

// Create main category
export async function createMainCategory(input: {
  name: string
  description?: string
  color?: string
  icon?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get max display_order for main categories
  const { data: existing } = await supabase
    .from('categories')
    .select('display_order')
    .eq('user_id', user.id)
    .is('parent_id', null)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      parent_id: null,
      name: input.name,
      description: input.description,
      color: input.color || '#3B82F6',
      icon: input.icon,
      is_system: false,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/categories')
  revalidatePath('/expenses')
  return data
}

// Create subcategory
export async function createSubcategory(input: {
  parent_id: string
  name: string
  description?: string
  icon?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify parent category belongs to user
  const { data: parent, error: parentError } = await supabase
    .from('categories')
    .select('id, color')
    .eq('id', input.parent_id)
    .eq('user_id', user.id)
    .single()

  if (parentError || !parent) throw new Error('Parent category not found')

  // Get max display_order for subcategories of this parent
  const { data: existing } = await supabase
    .from('categories')
    .select('display_order')
    .eq('user_id', user.id)
    .eq('parent_id', input.parent_id)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      parent_id: input.parent_id,
      name: input.name,
      description: input.description,
      color: parent.color, // Inherit parent color
      icon: input.icon,
      is_system: false,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/categories')
  revalidatePath('/expenses')
  return data
}

// Update category
export async function updateCategory(input: {
  id: string
  name?: string
  description?: string
  color?: string
  icon?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { id, ...updates } = input

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/categories')
  revalidatePath('/expenses')
  return data
}

// Delete category (will cascade to subcategories due to ON DELETE CASCADE)
export async function deleteCategory(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if category is system category
  const { data: category } = await supabase
    .from('categories')
    .select('is_system')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (category?.is_system) {
    throw new Error('Cannot delete system categories')
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/categories')
  revalidatePath('/expenses')
  return { success: true }
}