import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserMenu } from './user-menu'
import { LayoutDashboard, BarChart3, FileText, Settings, Bell, Menu } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0d0d12]/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white transition-colors lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <span className="text-sm font-bold text-black">V</span>
              </div>
              <span className="text-lg font-semibold text-white">Vinance</span>
            </Link>
          </div>

          {/* Center: Navigation Pills */}
          {user && (
            <div className="hidden md:flex items-center gap-1 rounded-full bg-[#1a1a24] p-1">
              <Link
                href="/dashboard"
                className="nav-pill flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/expenses"
                className="nav-pill flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <FileText className="h-4 w-4" />
                Expenses
              </Link>
              <Link
                href="/categories"
                className="nav-pill flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                Categories
              </Link>
            </div>
          )}

          {/* Right side: Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="relative rounded-lg p-2 text-gray-400 hover:bg-white/[0.05] hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
                </button>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}