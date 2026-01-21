import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { ExpensesAnalysis } from '@/components/dashboard/expenses-analysis'
import { SpendingLineChart } from "@/components/dashboard/spending-line-chart";
import { IncomeVsExpensesChart } from "@/components/dashboard/income-vs-expenses";
import { TopMerchantsChart } from "@/components/dashboard/top-merchants";
import { UncategorizedAlert } from "@/components/dashboard/uncategorized-alert";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import {
  getDashboardStats,
  getExpensesByCategory,
  getSpendingOverTime,
  getTopMerchants,
  getUncategorizedCount,
  getIncomeVsExpensesOverTime,
} from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Parallel data fetching with last_month as default
  const [
    stats,
    donutData,
    spendingData,
    merchantsData,
    uncategorized,
    incomeVsExpensesData,
  ] = await Promise.all([
    getDashboardStats("last_month"),
    getExpensesByCategory("last_month"),
    getSpendingOverTime("this_year"),
    getTopMerchants("last_month"),
    getUncategorizedCount(),
    getIncomeVsExpensesOverTime("this_year"),
  ]);

  // Calculate total balance from all time
  const allTimeStats = await getDashboardStats("all_time");
  const totalBalance = allTimeStats.totalIncome - allTimeStats.totalExpenses;

  return (
    <div className="min-h-screen bg-[#0d0d12] pb-6 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Uncategorized Alert */}
        {uncategorized.count > 0 && (
          <UncategorizedAlert
            count={uncategorized.count}
            totalAmount={uncategorized.totalAmount}
          />
        )}

        {/* Top Section: Balance & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <BalanceCard
              totalBalance={totalBalance}
              lastUpdated={new Date().toLocaleDateString()}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <QuickStats
              income={stats.totalIncome}
              expenses={stats.totalExpenses}
              avgDaily={stats.avgDaily}
              largestTransaction={stats.largestTransaction}
            />
            <BudgetProgress spent={stats.totalExpenses} limit={5000} />
          </div>
        </div>

        {/* Charts Row 1: Line Chart & Donut Chart */}
        <div className="grid grid-cols-1 mb-6">
            <ExpensesAnalysis initialDonutData={donutData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 mb-6">
          <div className="h-[400px]">
            <SpendingLineChart initialData={spendingData} />
          </div>
        </div>

        {/* Charts Row 2: Income vs Expenses & Top Merchants */}
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
  );
}
