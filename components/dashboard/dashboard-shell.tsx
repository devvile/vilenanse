'use client'

import { useState, useEffect } from 'react'
import { BalanceCard } from './balance-card'
import { QuickStats } from './quick-stats'
import { BudgetProgress } from './budget-progress'
import { ExpensesAnalysis } from './expenses-analysis'
import { DateRange, getDashboardStats, getTopMerchants, getIncomeVsExpensesOverTime, getExpensesByCategory, getSpendingOverTime } from '@/lib/actions/dashboard'
import { getIncomingRemainingThisMonth } from '@/lib/actions/recurring'
import { getMonthlyBudget, updateMonthlyBudget } from '@/lib/actions/budget'
import { IncomeVsExpensesChart } from './income-vs-expenses'
import { TopMerchantsChart } from './top-merchants'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

import { Card } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, CreditCard } from "lucide-react"

interface DashboardShellProps {
  initialStats: {
    totalIncome: number
    totalExpenses: number
    avgDaily: number
    largestTransaction: number
  }
  initialDonutData: any[]
  initialSpendingData: any[]
  initialMerchantsData: any[]
  initialIncomeVsExpensesData: any[]
  totalBalance: number
}

export function DashboardShell({ 
  initialStats, 
  initialDonutData, 
  initialSpendingData,
  initialMerchantsData,
  initialIncomeVsExpensesData,
  totalBalance,
}: DashboardShellProps) {
  const [stats, setStats] = useState(initialStats)
  const [donutData, setDonutData] = useState(initialDonutData)
  const [spendingData, setSpendingData] = useState(initialSpendingData)
  const [merchantsData, setMerchantsData] = useState(initialMerchantsData)
  const [incomeVsExpensesData, setIncomeVsExpensesData] = useState(initialIncomeVsExpensesData)
  const [currentBalance, setCurrentBalance] = useState(totalBalance)
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [loading, setLoading] = useState(false)
  
  // Budget stats
  const [budgetLimit, setBudgetLimit] = useState(7500)
  const [incomingRemaining, setIncomingRemaining] = useState(0)

  const currentMonthKey = format(new Date(), 'yyyy-MM')

  // Initial fetch for budget and incoming
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const [limit, incoming] = await Promise.all([
          getMonthlyBudget(currentMonthKey),
          getIncomingRemainingThisMonth()
        ])
        setBudgetLimit(limit)
        setIncomingRemaining(incoming)
      } catch (error) {
        console.error('Failed to fetch budget/incoming data', error)
      }
    }
    fetchBudgetData()
  }, [currentMonthKey])

  const getMonthsInPeriod = (range: DateRange): number => {
    switch (range) {
      case 'last_3_months': return 3
      case 'this_year':
      case 'last_year':
      case 'last_12_months':
      case 'all_time': return 12
      default: return 1
    }
  }

  const monthsInRange = getMonthsInPeriod(dateRange)
  const totalLimit = budgetLimit * monthsInRange

  const handleDateRangeChange = async (range: DateRange) => {
    setDateRange(range)
    setLoading(true)
    try {
      const [newStats, newMerchants, newIncomeVsExpenses, newDonut, newSpending] = await Promise.all([
        getDashboardStats(range),
        getTopMerchants(range),
        getIncomeVsExpensesOverTime(range === 'all_time' ? 'this_year' : range),
        getExpensesByCategory(range),
        getSpendingOverTime(range === 'all_time' ? 'this_year' : range)
      ])
      
      setStats(newStats)
      setMerchantsData(newMerchants)
      setIncomeVsExpensesData(newIncomeVsExpenses)
      setDonutData(newDonut)
      setSpendingData(newSpending)
      setCurrentBalance(newStats.totalIncome - newStats.totalExpenses)
    } catch (error) {
      console.error('Failed to update dashboard data for range:', range, error)
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetLimitChange = async (newTotalLimit: number) => {
    const months = getMonthsInPeriod(dateRange)
    const newMonthlyBase = newTotalLimit / months
    setBudgetLimit(newMonthlyBase)
    try {
      await updateMonthlyBudget(currentMonthKey, newMonthlyBase)
    } catch (error) {
      console.error('Failed to save budget limit', error)
    }
  }

  const ranges: { label: string; value: DateRange }[] = [
    { label: 'Week', value: 'this_week' },
    { label: 'Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: '3 Months', value: 'last_3_months' },
    { label: 'Year', value: 'this_year' },
    { label: 'All Time', value: 'all_time' },
  ]

  const includesRunningMonth = 
    dateRange === 'this_month' || 
    dateRange === 'this_week' || 
    dateRange === 'this_year' || 
    dateRange === 'all_time' || 
    dateRange === 'last_3_months' || 
    dateRange === 'last_12_months'

  return (
    <div className="relative space-y-4">
      
      {/* Row 1: Timeframe Selector (Full Width) */}
      <Card className="relative p-1.5 bg-card border-card-border flex items-center justify-between overflow-hidden">
        <span className="text-xs font-semibold text-text-muted ml-4 uppercase tracking-wider">Timeframe</span>
        <div className="flex bg-background rounded-full p-1 gap-1">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleDateRangeChange(range.value)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all duration-300 whitespace-nowrap uppercase tracking-tight",
                dateRange === range.value 
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
        {/* Loading Bar */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-background-secondary w-full">
            <div className="h-full bg-emerald-500 animate-[loading-bar_1.5s_infinite_ease-in-out] w-1/3" />
          </div>
        )}
      </Card>

      {/* Row 2: Unified Stats Grid (Balance + QuickStats in one row on large screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Balance Card (1st column) */}
        <div className="lg:col-span-1">
          <BalanceCard totalBalance={currentBalance} />
        </div>

        {/* Quick Stats (Next 4 columns) */}
        <Card className="p-4 flex items-center gap-4 bg-card border-card-border lg:col-span-1">
          <div className="h-10 w-10 min-w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted truncate">Total Income</p>
            <p className="text-lg font-bold text-text-primary truncate">{Math.round(stats.totalIncome).toLocaleString()} PLN</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4 bg-card border-card-border lg:col-span-1">
          <div className="h-10 w-10 min-w-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted truncate">Total Expenses</p>
            <p className="text-lg font-bold text-text-primary truncate">{Math.round(stats.totalExpenses).toLocaleString()} PLN</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-card border-card-border lg:col-span-1">
          <div className="h-10 w-10 min-w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted truncate">Avg. Daily Spend</p>
            <p className="text-lg font-bold text-text-primary truncate">{Math.round(stats.avgDaily).toLocaleString()} PLN</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-card border-card-border lg:col-span-1">
          <div className="h-10 w-10 min-w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted truncate">Largest Transaction</p>
            <p className="text-lg font-bold text-text-primary truncate">{Math.round(stats.largestTransaction).toLocaleString()} PLN</p>
          </div>
        </Card>
      </div>

      {/* Row 3: Budget Progress */}
      <div className="w-full">
        <BudgetProgress 
          spent={stats.totalExpenses} 
          incoming={incomingRemaining} 
          limit={totalLimit} 
          onLimitChange={handleBudgetLimitChange}
          showIncoming={includesRunningMonth}
          loading={loading}
        />
      </div>

      {/* Row 4: Expenses Analysis (Charts) */}
      <ExpensesAnalysis 
        initialDonutData={donutData} 
        initialSpendingData={spendingData} 
        dateRange={dateRange}
      />

      {/* Row 5: Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <IncomeVsExpensesChart data={incomeVsExpensesData} />
        </div>
        <div className="lg:col-span-1">
          <TopMerchantsChart initialData={merchantsData} />
        </div>
      </div>
    </div>
  )
}
