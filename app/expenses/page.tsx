import { getExpenses } from '@/lib/actions/expenses'
import { ExpensesList } from '@/components/expenses/expenses-list'
import { AddExpenseButton } from '@/components/expenses/add-expense-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { imported?: string }
}) {
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
          <div className="flex items-center gap-3">
            <Link
              href="/expenses/import"
              className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import CSV
            </Link>
            <AddExpenseButton />
          </div>
        </div>

        {/* Success message after import */}
        {searchParams.imported === 'true' && (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              ✅ Expenses imported successfully! You can now categorize them below.
            </p>
          </div>
        )}

        {/* Expenses List */}
        <ExpensesList expenses={expenses} />
      </div>
    </div>
  )
}