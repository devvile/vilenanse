'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-[#1a1a24] border-white/[0.08] text-center">
        <div className="mb-6 rounded-full bg-red-500/10 w-16 h-16 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-gray-400 mb-8">
          {error.message.includes('recurring_expenses') 
            ? "It looks like the recurring_expenses table hasn't been created yet in your database. Please run the SQL migration."
            : "We encountered an error while loading your recurring expenses."}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
          
          <a
            href="/dashboard"
            className="block w-full py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </Card>
    </div>
  )
}
