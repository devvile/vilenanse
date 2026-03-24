'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  ArrowRight,
  Check,
  X,
  Trash2,
  Archive,
  Clock,
  ChevronRight,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  getProposals,
  addProposal,
  updateProposal,
  deleteProposal,
  Proposal
} from '@/lib/evolution'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  reported: {
    label: 'Reported',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  archived: {
    label: 'Archived',
    color: 'text-gray-400',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10'
  }
}

export default function EvolutionPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProposals()
      setProposals(data)
    } catch (error) {
      console.error('Failed to fetch proposals', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addProposal({ title, description })
      setTitle('')
      setDescription('')
      setShowForm(false)
      await fetchData()
    } catch (error) {
      console.error('Failed to create proposal', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: Proposal['status']) => {
    try {
      await updateProposal(id, { status })
      await fetchData()
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id)
      await fetchData()
    } catch (error) {
      console.error('Failed to delete proposal', error)
    }
  }

  // Filtering: only reported and in_progress by default
  const filteredProposals = proposals.filter(p => {
    if (showArchived) return p.status === 'archived'
    return p.status === 'reported' || p.status === 'in_progress' || p.status === 'completed'
  }).filter(p => {
    if (showArchived) return true
    return p.status !== 'archived' && (p.status !== 'completed' || showArchived) // Completed is hidden by default in plain list but user can toggle
  })

  // User specifically said: "By default only 'reported' and 'in progress' task shall be visible"
  const displayProposals = proposals.filter(p => {
    if (showArchived) return p.status === 'archived'
    return p.status === 'reported' || p.status === 'in_progress'
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pt-24 pb-20 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-amber-400" />
            Evolution
          </h1>
          <p className="text-text-secondary text-sm">
            Shape the future of Holi. Propose features and track our progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
              showArchived 
                ? "bg-white/10 border-white/20 text-white" 
                : "bg-transparent border-white/10 text-text-secondary hover:text-white hover:border-white/20"
            )}
          >
            {showArchived ? 'View Active' : 'View Archived'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Propose Change
          </button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-card border-white/[0.08] animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary ml-1">Title</label>
              <input
                autoFocus
                placeholder="What should we improve?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-background border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary ml-1">Detail (Optional)</label>
              <textarea
                placeholder="Explain the benefit or use case..."
                value={description}
                rows={3}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-background border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-text-secondary hover:text-white font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-xl transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/[0.05] rounded-2xl" />
            ))}
          </div>
        ) : displayProposals.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No proposals found</h3>
            <p className="text-text-secondary text-sm">
              {showArchived ? 'No archived proposals.' : 'Start by proposing a change to the app.'}
            </p>
          </div>
        ) : (
          displayProposals.map((proposal) => (
            <Card
              key={proposal.id}
              className={cn(
                "group bg-card border-white/[0.08] hover:border-white/20 transition-all overflow-hidden",
                proposal.status === 'in_progress' && "border-blue-500/30"
              )}
            >
              <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest",
                      STATUS_CONFIG[proposal.status].bgColor,
                      STATUS_CONFIG[proposal.status].color
                    )}>
                      {proposal.status === 'reported' && <Clock className="h-3 w-3" />}
                      {proposal.status === 'in_progress' && <Clock className="h-3 w-3 animate-spin-slow" />}
                      {proposal.status === 'completed' && <Check className="h-3 w-3" />}
                      {proposal.status === 'archived' && <Archive className="h-3 w-3" />}
                      {STATUS_CONFIG[proposal.status].label}
                    </div>
                    <span className="text-[10px] text-text-muted font-bold tracking-wider">
                      {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {proposal.title}
                  </h3>
                  {proposal.description && (
                    <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
                      {proposal.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {proposal.status === 'reported' && (
                    <button
                      onClick={() => handleUpdateStatus(proposal.id, 'in_progress')}
                      className="p-3 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 group/btn"
                      title="Start Working"
                    >
                      <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {proposal.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(proposal.id, 'completed',)}
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
                      title="Mark Completed"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                  {proposal.status !== 'archived' && (
                    <button
                      onClick={() => handleUpdateStatus(proposal.id, 'archived')}
                      className="p-3 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white rounded-xl transition-all"
                      title="Archive"
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                  )}
                  {proposal.status === 'archived' && (
                     <button
                     onClick={() => handleUpdateStatus(proposal.id, 'reported')}
                     className="p-3 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white rounded-xl transition-all"
                     title="Restore"
                   >
                     <Plus className="h-5 w-5 rotate-45" />
                   </button>
                  )}
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="p-3 bg-red-500/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
