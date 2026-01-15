import { getExpenses } from '@/lib/actions/expenses'
import { ExpensesList } from '@/components/expenses/expenses-list'
import { AddExpenseButton } from '@/components/expenses/add-expense-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ExpensesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const expenses = await getExpenses()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-2 text-gray-600">
              Manage your expense transactions
            </p>
          </div>
          <AddExpenseButton />
        </div>

        {/* Expenses List */}
        <ExpensesList expenses={expenses} />
      </div>
    </div>
  )
}