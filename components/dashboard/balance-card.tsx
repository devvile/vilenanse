'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowUpRight, Wallet, RefreshCw } from 'lucide-react'
import { UpdateBalanceModal } from './update-balance-modal'

interface BalanceCardProps {
  totalBalance: number
  lastUpdated?: string
}

export function BalanceCard({ 
  totalBalance = 0,
  lastUpdated
}: BalanceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const balance = Math.round(totalBalance)

  return (
    <>
      <Card className="relative overflow-hidden p-6 h-full">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
        
        {/* Icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex flex-col items-end">
             {lastUpdated && (
                <span className="text-xs text-gray-500 mb-1">Updated: {lastUpdated}</span>
             )}
          </div>
        </div>

        {/* Label */}
        <p className="text-sm text-gray-400 mb-2">Total Balance</p>

        {/* Balance */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-white">
            {totalBalance < 0 ? '-' : ''}{balance.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-gray-400 ml-1">PLN</span>
        </div>

        {/* Action buttons */}
        <div className="mt-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/[0.05] border border-white/[0.1] py-3 text-sm font-semibold text-white hover:bg-white/[0.1] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Update Balance
          </button>
        </div>
      </Card>
      
      <UpdateBalanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBalance={totalBalance}
      />
    </>
  )
}
