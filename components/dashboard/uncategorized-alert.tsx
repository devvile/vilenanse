'use client'

import { Card } from '@/components/ui/card'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UncategorizedAlertProps {
  count: number
  totalAmount: number
}

export function UncategorizedAlert({ count, totalAmount }: UncategorizedAlertProps) {
  if (count === 0) return null

  return (
    <div className="mb-6">
       <Card className="p-4 bg-orange-500/10 border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/20 rounded-full">
               <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
               <h4 className="font-semibold text-white">Uncategorized Expenses</h4>
               <p className="text-sm text-gray-400">
                  You have <span className="text-white font-medium">{count}</span> transactions totaling <span className="text-white font-medium">${totalAmount.toLocaleString()}</span> that need categorization.
               </p>
            </div>
         </div>
         <Link 
            href="/expenses?category=uncategorized"
            className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
         >
            Categorize Now
            <ArrowRight className="h-4 w-4" />
         </Link>
       </Card>
    </div>
  )
}
