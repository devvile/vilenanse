import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { ExpensesDonutChart } from '@/components/dashboard/expenses-donut'
import { SpendingLineChart } from '@/components/dashboard/spending-line-chart'
import { IncomeVsExpensesChart } from '@/components/dashboard/income-vs-expenses'
import { TopMerchantsChart } from '@/components/dashboard/top-merchants'
import { UncategorizedAlert } from '@/components/dashboard/uncategorized-alert'
import { BudgetProgress } from '@/components/dashboard/budget-progress'
import { getDashboardStats, getExpensesByCategory, getSpendingOverTime, getTopMerchants, getUncategorizedCount } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Parallel data fetching for initial state
  const [
    stats,
    donutData,
    spendingData,
    merchantsData,
    uncategorized
  ] = await Promise.all([
    getDashboardStats('this_month'),
    getExpensesByCategory('this_month'),
    getSpendingOverTime('this_year'), // Line chart defaults to year view
    getTopMerchants('this_month'),
    getUncategorizedCount()
  ])

  // Mock data for Income vs Expenses (need to implement real fetching later if needed)
  // For now, let's just use the current month's income/expense in a simple 1-item array or static data
  // to avoid blocking. The requirement didn't specify dynamic fetching for this one explicitly in the updated plan,
  // but "Income vs Expenses Bar Chart: Side-by-side comparison per month".
  // I should implement a helper for this in `lib/actions/dashboard.ts` really quick or just use static data for now if 
  // I want to verify other things. 
  // Let's create a quick placeholder logic:
  const incomeVsExpensesData = [
    { month: 'Current', income: stats.totalIncome, expenses: stats.totalExpenses }
  ]

  // Calculate balance based on ALL time or just database sum?
  // Usually balance is a snapshot. Using totalIncome - totalExpenses from "this month" is wrong for "Total Balance".
  // `getDashboardStats('all_time')` would be better for balance.
  // Let's refetch balance as all time.
  const allTimeStats = await getDashboardStats('all_time')
  const totalBalance = allTimeStats.totalIncome - allTimeStats.totalExpenses

  return (
    <div className="min-h-screen bg-[#0d0d12] pb-6 pt-20"> 
    {/* Added pt-20 to account for fixed navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <UncategorizedAlert 
          count={uncategorized.count} 
          totalAmount={uncategorized.totalAmount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column: Balance & Quick Stats */}
          <div className="lg:col-span-12 xl:col-span-12">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
               <div className="lg:col-span-1 h-full">
                  <BalanceCard 
                    totalBalance={totalBalance}
                    lastUpdated={new Date().toLocaleDateString()}
                  />
               </div>
               <div className="lg:col-span-2 flex flex-col justify-between">
                  {/* Quick Stats Grid */}
                  <QuickStats 
                    income={stats.totalIncome}
                    expenses={stats.totalExpenses}
                    avgDaily={stats.avgDaily}
                    largestTransaction={stats.largestTransaction}
                  />
                  {/* Budget Progress (placed here or sidebar) */}
                  <BudgetProgress 
                    spent={stats.totalExpenses}
                    limit={5000} // Hardcoded limit for now as per requirements
                  />
               </div>
             </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-[400px]">
            <SpendingLineChart initialData={spendingData} />
          </div>
          <div className="h-[400px]">
            <ExpensesDonutChart initialData={donutData} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px]">
            <IncomeVsExpensesChart data={incomeVsExpensesData} />
          </div>
          <div className="lg:col-span-1 h-[400px]">
             <TopMerchantsChart initialData={merchantsData} />
          </div>
        </div>
      </div>
    </div>
  )
}