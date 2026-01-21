import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRecurringExpenses, getRecurringStats } from '@/lib/actions/recurring'
import { RecurringList } from '@/components/incoming/recurring-list'
import { AddRecurringModal } from '@/components/incoming/add-recurring-modal'
import { Card } from '@/components/ui/card'
import { CalendarClock, Wallet, CalendarDays } from 'lucide-react'
import { UpcomingExpensesProjection } from '@/components/incoming/upcoming-expenses-projection'

export const dynamic = 'force-dynamic'

export default async function IncomingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const expenses = await getRecurringExpenses()
  const stats = await getRecurringStats(expenses)
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <div className="min-h-screen bg-[#0d0d12] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Incoming</h1>
            <p className="mt-2 text-gray-400">Manage your recurring expenses and subscriptions</p>
          </div>
          <div className="flex items-center gap-2">
             <AddRecurringModal categories={categories || []} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-[#1a1a24] border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                 <Wallet className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Monthly Fixed</p>
                <p className="text-2xl font-bold text-white">{stats.totalMonthly.toFixed(2)} PLN</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1a24] border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                 <CalendarClock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Next Payment Due</p>
                <p className="text-2xl font-bold text-white">{stats.nextPaymentDate}</p>
                <p className="text-xs text-gray-500">{stats.daysUntilNext} days left</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-[#1a1a24] border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                 <CalendarDays className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{expenses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Subscriptions List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Your Subscriptions</h2>
            <RecurringList expenses={expenses} categories={categories || []} />
          </div>

          {/* Right Column: Projection & Actions */}
          <div className="space-y-6">
            <UpcomingExpensesProjection expenses={expenses} />
            
            <Card className="p-6 bg-[#1a1a24]/50 border-white/[0.05] border-dashed">
              <h4 className="text-sm font-semibold text-white mb-2">Manage Categories</h4>
              <p className="text-xs text-gray-400 mb-4">
                Organize your subscriptions by categories to see better analytics.
              </p>
              <a 
                href="/categories" 
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Go to Categories &rarr;
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
