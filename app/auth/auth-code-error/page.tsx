'use client'

import Link from 'next/link'
import { Sparkles, AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-card-border bg-card p-8 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            We encountered an error while trying to sign you in.
          </p>
        </div>

        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-500 font-medium mb-2">Possible causes:</p>
          <ul className="text-sm text-red-400 space-y-1 list-disc list-inside">
            <li>The authentication link expired</li>
            <li>Database setup is incomplete</li>
            <li>Server configuration issue</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="flex w-full justify-center rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Try Again
          </Link>

          <div className="text-center text-sm">
            <span className="text-text-muted">Need help? </span>
            <a href="mailto:support@vilenanse.com" className="font-medium text-emerald-500 hover:text-emerald-400">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
