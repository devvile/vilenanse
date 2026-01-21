import { Card } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, CreditCard } from "lucide-react"

interface QuickStatsProps {
  income: number
  expenses: number
  avgDaily: number
  largestTransaction: number
}

export function QuickStats({ income, expenses, avgDaily, largestTransaction }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 flex items-center gap-4 bg-[#1a1a24] border-white/[0.08]">
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ArrowUpRight className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Total Income</p>
          <p className="text-lg font-bold text-white">${income.toLocaleString()}</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-center gap-4 bg-[#1a1a24] border-white/[0.08]">
        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <ArrowDownRight className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Total Expenses</p>
          <p className="text-lg font-bold text-white">${expenses.toLocaleString()}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4 bg-[#1a1a24] border-white/[0.08]">
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Avg. Daily Spend</p>
          <p className="text-lg font-bold text-white">${avgDaily.toFixed(2)}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4 bg-[#1a1a24] border-white/[0.08]">
        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Largest Transaction</p>
          <p className="text-lg font-bold text-white">${largestTransaction.toLocaleString()}</p>
        </div>
      </Card>
    </div>
  )
}
