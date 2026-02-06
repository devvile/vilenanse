'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Wallet, RefreshCw } from 'lucide-react'
import { UpdateBalanceModal } from './update-balance-modal'

interface BalanceCardProps {
  totalBalance: number
}

export function BalanceCard({ 
  totalBalance = 0
}: BalanceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const balance = Math.round(totalBalance)

  return (
    <>
      <Card className="relative overflow-hidden p-6 flex flex-col justify-between bg-card border-card-border h-full lg:h-auto">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
        
        <div>
          {/* Icon and Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background-secondary">
              <Wallet className="h-6 w-6 text-emerald-500" />
            </div>
          </div>

          {/* Label and Balance */}
          <div className="mb-6">
            <p className="text-sm text-text-muted mb-1 font-medium uppercase tracking-wider">Timeframe Net</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-text-primary">
                {totalBalance < 0 ? '-' : ''}{Math.abs(balance).toLocaleString()}
              </span>
              <span className="text-sm font-medium text-text-muted">PLN</span>
            </div>
          </div>
        </div>


        {/* Action buttons - Hidden per user request */}
        {/* <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-background-secondary border border-card-border py-3 text-sm font-semibold text-text-primary hover:bg-card-hover transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Update Balance
          </button>
        </div> */}
      </Card>
      
      <UpdateBalanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBalance={totalBalance}
      />
    </>
  )
}
