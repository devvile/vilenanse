
import { createClient } from '@/lib/supabase/server'
import { getExpensesByCategory, getUncategorizedCount } from '@/lib/actions/dashboard'

export async function runDebug() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('No authenticated user found for debug script (server-side context required).')
    return
  }

  console.log('User ID:', user.id)

  // 1. Check total expense count
  const { count: totalCount } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  console.log('Total Expenses in DB:', totalCount)

  // 2. Check uncategorized count (All Time)
  const uncategorized = await getUncategorizedCount()
  console.log('Uncategorized (All Time):', uncategorized.count)

  // 3. Check categorized expenses distribution by date
  const { data: categorizedExpenses } = await supabase
    .from('expenses')
    .select('transaction_date, amount, category_id')
    .eq('user_id', user.id)
    .neq('category_id', null) // Only categorized

  console.log('Categorized Expenses Count:', categorizedExpenses?.length)

  // Group by month
  const byMonth: Record<string, number> = {}
  categorizedExpenses?.forEach(e => {
    const month = e.transaction_date.substring(0, 7) // YYYY-MM
    byMonth[month] = (byMonth[month] || 0) + 1
  })

  console.log('Categorized Expenses by Month:', byMonth)

  // 4. Run getExpensesByCategory for 'this_month'
  const thisMonthData = await getExpensesByCategory('this_month')
  console.log('getExpensesByCategory("this_month") result count:', thisMonthData.length)
  console.log('this_month categories:', thisMonthData.map(c => c.name))

  // 5. Run getExpensesByCategory for 'this_year'
  const thisYearData = await getExpensesByCategory('this_year')
  console.log('getExpensesByCategory("this_year") result count:', thisYearData.length)
  console.log('this_year categories:', thisYearData.map(c => c.name))
}
