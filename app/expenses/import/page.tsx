import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CSVUploadForm } from '@/components/expenses/csv-upload-form'

export default async function ImportExpensesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-[#0d0d12] py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Import Expenses</h1>
          <p className="mt-2 text-gray-400 font-medium">
            Upload a CSV file from your bank to import expenses in bulk
          </p>
        </div>

        <CSVUploadForm />
      </div>
    </div>
  )
}