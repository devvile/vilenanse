'use client'

import { Card } from '@/components/ui/card'
import { Shield, CheckCircle } from 'lucide-react'

export function AccountVerification() {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
          <Shield className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Account Verification</h3>
          <p className="text-xs text-gray-500 mt-1">
            Complete your account verification to unlock secure transactions and full financial access.
          </p>
        </div>
      </div>

      <button className="w-full rounded-full border border-emerald-500 bg-transparent py-2.5 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors">
        Verify Account
      </button>
    </Card>
  )
}
