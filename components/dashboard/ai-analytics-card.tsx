'use client'

import { Card } from '@/components/ui/card'
import { Sparkles, Users, MousePointer } from 'lucide-react'

export function AIAnalyticsCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-black/10 blur-xl" />
      
      {/* Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1">
        <Sparkles className="h-3.5 w-3.5 text-white" />
        <span className="text-xs font-medium text-white">AI Assistant</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3">
        Advanced AI Analytics
      </h3>

      {/* Description */}
      <p className="text-sm text-white/80 mb-6 leading-relaxed">
        Use our AI assistant to gain deeper insights, advanced analytics, 
        smarter decisions, personalized predictions, and real-time market intelligence.
      </p>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-white/70" />
          <div>
            <span className="text-lg font-bold text-white">7.8K+</span>
            <p className="text-xs text-white/60">People rely on us daily</p>
          </div>
        </div>
      </div>

      {/* Cursor decoration */}
      <div className="absolute bottom-6 right-6">
        <div className="relative">
          <MousePointer className="h-6 w-6 text-white rotate-12" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white animate-pulse" />
        </div>
      </div>
    </div>
  )
}
