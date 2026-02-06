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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 flex items-center gap-4 bg-card border-card-border">
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <ArrowUpRight className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Total Income</p>
          <p className="text-lg font-bold text-text-primary">{Math.round(income).toLocaleString()} PLN</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-center gap-4 bg-card border-card-border">
        <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <ArrowDownRight className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Total Expenses</p>
          <p className="text-lg font-bold text-text-primary">{Math.round(expenses).toLocaleString()} PLN</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4 bg-card border-card-border">
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Avg. Daily Spend</p>
          <p className="text-lg font-bold text-text-primary">{Math.round(avgDaily).toLocaleString()} PLN</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-4 bg-card border-card-border">
        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <p className="text-xs text-text-muted">Largest Transaction</p>
          <p className="text-lg font-bold text-text-primary">{Math.round(largestTransaction).toLocaleString()} PLN</p>
        </div>
      </Card>
    </div>
  )
}
