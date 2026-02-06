'use client'

import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

interface Transaction {
  id: string
  amount: number
  merchant: string | null
  transaction_date: string
}

interface MinimalTransactionListProps {
  transactions: Transaction[]
  loading?: boolean
  categoryName?: string
}

export function MinimalTransactionList({ transactions, loading, categoryName }: MinimalTransactionListProps) {
  if (loading) {
    return (
      <Card className="p-6 bg-card border-card-border flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
           <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
           <p className="text-xs text-text-muted font-medium tracking-tight">Loading transactions...</p>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6 bg-card border-card-border flex items-center justify-center h-full">
        <p className="text-sm text-text-muted">No transactions found for {categoryName || 'this category'}.</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-card-border overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
           Recent {categoryName ? `"${categoryName}"` : ''} Expenses
        </h3>
        <span className="text-[10px] font-medium text-text-muted">{transactions.length} items</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <div className="grid gap-1 py-2">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-background-secondary transition-colors group"
            >
              <div className="flex flex-col min-w-0 pr-4">
                <span className="text-sm font-semibold text-text-primary group-hover:text-emerald-500 transition-colors" title={tx.merchant || ''}>
                  {tx.merchant 
                    ? (tx.merchant.length > 25 ? tx.merchant.slice(0, 22) + '...' : tx.merchant)
                    : 'Unknown Merchant'}
                </span>
                <span className="text-[10px] text-text-muted font-medium">
                  {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-bold text-text-primary">
                  {Math.abs(tx.amount).toLocaleString()}
                  <span className="ml-1 text-[10px] text-text-muted font-medium">PLN</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
