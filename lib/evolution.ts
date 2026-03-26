'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Proposal {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'reported' | 'in_progress' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export async function getProposals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching proposals:', error)
    return []
  }

  // Sort: 'in_progress' first, then 'reported', then others.
  // Actually, 'in_progress' tasks being higher (sorting) was requested.
  const sorted = (data || []).sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'in_progress': 0,
      'reported': 1,
      'completed': 2,
      'archived': 3
    }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  return sorted as Proposal[]
}

export async function addProposal(proposal: {
  title: string
  description?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('proposals')
    .insert([{ ...proposal, user_id: user.id, status: 'reported' }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/evolution')
  return data as Proposal
}

export async function updateProposal(id: string, updates: Partial<Omit<Proposal, 'id' | 'user_id' | 'created_at'>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/evolution')
  return data as Proposal
}

export async function deleteProposal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/evolution')
}
