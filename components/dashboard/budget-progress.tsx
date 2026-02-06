'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetProgressProps {
  spent: number
  incoming: number
  limit: number
  onLimitChange?: (newLimit: number) => void
  showIncoming?: boolean
  loading?: boolean
}

export function BudgetProgress({ spent, incoming, limit, onLimitChange, showIncoming, loading }: BudgetProgressProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempLimit, setTempLimit] = useState(limit.toString())

  const totalProjected = spent + (showIncoming ? incoming : 0)
  const spentPercentage = Math.min((spent / (limit || 1)) * 100, 100)
  const incomingPercentage = showIncoming ? Math.min((incoming / (limit || 1)) * 100, 100 - spentPercentage) : 0
  
  const isOverBudget = totalProjected > limit
  const budgetDifference = limit - totalProjected
  
  const handleSave = () => {
    const newLimit = parseFloat(tempLimit)
    if (!isNaN(newLimit) && newLimit > 0) {
      onLimitChange?.(newLimit)
      setIsEditing(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-card-border relative overflow-hidden group">
      {/* Background decoration */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-500",
        isOverBudget ? "bg-red-500/10 group-hover:bg-red-500/15" : "bg-emerald-500/5 group-hover:bg-emerald-500/10"
      )} />

      {loading && (
        <div className="absolute inset-0 z-20 bg-card/60 backdrop-blur-[2px] flex items-center justify-center">
           <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Updating Budget...</span>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">
            {showIncoming ? 'Projected Budget' : 'Period Budget'}
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
             {loading ? (
                <div className="h-8 w-24 bg-background-secondary animate-pulse rounded-md" />
             ) : (
                <span className={cn("text-2xl font-black transition-colors", isOverBudget ? "text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "text-text-primary")}>
                  {isOverBudget ? '-' : ''}{Math.abs(budgetDifference).toLocaleString()}
                  <span className="text-xs font-bold ml-1 uppercase opacity-70">
                    {isOverBudget ? 'PLN Over Limit' : 'PLN Left'}
                  </span>
                </span>
             )}
          </div>
        </div>

        <div className="flex flex-col items-end">
           {isEditing ? (
             <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-card-border">
                <input 
                  type="number"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-20 bg-transparent text-right text-sm font-bold text-text-primary focus:outline-none px-1"
                  autoFocus
                />
                <button onClick={handleSave} className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-500/20 text-red-500 rounded">
                  <X className="h-3 w-3" />
                </button>
             </div>
           ) : (
             <button 
               onClick={() => { setIsEditing(true); setTempLimit(limit.toString()); }}
               className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-widest bg-background-secondary px-2 py-1 rounded-md border border-card-border"
             >
               Limit: {limit.toLocaleString()} <Edit2 className="h-2.5 w-2.5" />
             </button>
           )}
           <span className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-tight">
              {loading ? '--%' : `${((totalProjected / (limit || 1)) * 100).toFixed(0)}%`} Utilized
           </span>
        </div>
      </div>
      
      {/* Segmented Progress Bar */}
      <div className="h-4 w-full bg-background rounded-full overflow-hidden mb-4 flex border border-card-border">
        {/* Spent (Red-ish) */}
        {!loading && (
          <>
            <div 
              className="h-full bg-red-500 transition-all duration-700 ease-out"
              style={{ width: `${spentPercentage}%` }}
            />
            {/* Incoming (Orange-ish) */}
            {showIncoming && incoming > 0 && (
              <div 
                className="h-full bg-orange-500/80 transition-all duration-700 ease-out delay-100"
                style={{ width: `${incomingPercentage}%` }}
              />
            )}
          </>
        )}
        {loading && <div className="h-full w-full bg-background-secondary animate-pulse" />}
      </div>
      
      {/* Legend / Details */}
      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tight">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-text-primary">Spent: {loading ? '...' : spent.toLocaleString()}</span>
        </div>
        {showIncoming && incoming > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-orange-500/80" />
            <span className="text-text-secondary">Incoming: {loading ? '...' : incoming.toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
