import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExpensesList } from '@/components/expenses/expenses-list'
import { AddExpenseButton } from '@/components/expenses/add-expense-button'
import { ExpensesPagination } from '@/components/expenses/expenses-pagination'

const ITEMS_PER_PAGE = 20

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; page?: string }> // ✅ Must be Promise type
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // ✅ CRITICAL: Await searchParams BEFORE using it
  const resolvedSearchParams = await searchParams
  const currentPage = parseInt(resolvedSearchParams.page || '1')
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  // Get total count
  const { count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Get paginated expenses
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  if (error) throw error

  // Get unique parent category IDs
  const parentCategoryIds = expenses
    ?.map(e => e.category?.parent_id)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) || []

  // Fetch parent categories separately
  let parentCategories: any[] = []
  if (parentCategoryIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from('categories')
      .select('*')
      .in('id', parentCategoryIds)
    
    if (parentsError) {
      console.error('Error fetching parent categories:', parentsError)
    } else {
      parentCategories = parents || []
    }
  }

  // Combine the data
  const expensesWithParents = expenses?.map(expense => ({
    ...expense,
    parent_category: expense.category?.parent_id
      ? parentCategories.find(p => p.id === expense.category?.parent_id) || null
      : null
  })) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-2 text-gray-600">
              {totalCount} total expense{totalCount !== 1 ? 's' : ''} • Page {currentPage} of {totalPages}
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
        {resolvedSearchParams.imported === 'true' && (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              ✅ Expenses imported successfully! You can now categorize them below.
            </p>
          </div>
        )}

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{offset + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(offset + ITEMS_PER_PAGE, totalCount)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{totalCount}</span>
            </p>
            <ExpensesPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
            />
          </div>
        )}

        {/* Expenses List with key to force re-render */}
        <ExpensesList key={`page-${currentPage}`} expenses={expensesWithParents} />

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <ExpensesPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
            />
          </div>
        )}
      </div>
    </div>
  )
}