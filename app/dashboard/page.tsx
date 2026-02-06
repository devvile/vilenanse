import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UncategorizedAlert } from "@/components/dashboard/uncategorized-alert";
import { subMonths } from "date-fns";
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

  // Parallel data fetching with this_month as default
  const [
    stats,
    donutData,
    spendingData,
    merchantsData,
    uncategorized,
    incomeVsExpensesData,
  ] = await Promise.all([
    getDashboardStats("this_month"),
    getExpensesByCategory("this_month"),
    getSpendingOverTime("this_year"),
    getTopMerchants("this_month"),
    getUncategorizedCount(),
    getIncomeVsExpensesOverTime("this_year"),
  ]);

  // Calculate net balance for the selected timeframe
  const totalBalance = stats.totalIncome - stats.totalExpenses;

  return (
    <div className="min-h-screen bg-background pb-6 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Uncategorized Alert */}
        {uncategorized.count > 0 && (
          <UncategorizedAlert
            count={uncategorized.count}
            totalAmount={uncategorized.totalAmount}
          />
        )}

        {/* Global Dashboard Shell (Handles range sync) */}
        <DashboardShell 
          initialStats={stats}
          initialDonutData={donutData}
          initialSpendingData={spendingData}
          initialMerchantsData={merchantsData}
          initialIncomeVsExpensesData={incomeVsExpensesData}
          totalBalance={totalBalance}
        />
      </div>
    </div>
  );
}
