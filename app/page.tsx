import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">Expense Tracker</h1>
        <p className="mt-4 text-xl text-gray-600">
          Track your expenses with AI-powered categorization
        </p>
        
        <div className="mt-8 flex gap-4 justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-500"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md border border-blue-600 px-6 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}