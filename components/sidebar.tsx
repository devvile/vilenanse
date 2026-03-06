'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, Heart, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const areas = [
  {
    name: 'Finance',
    icon: Wallet,
    href: '/finance/dashboard',
    activePattern: /^\/finance/,
  },
  {
    name: 'Health',
    icon: Heart,
    href: '/health/calories',
    activePattern: /^\/health/,
  },
  {
    name: 'Tasks',
    icon: CheckSquare,
    href: '/tasks/habits',
    activePattern: /^\/tasks/,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Don't show sidebar on landing page or auth pages
  const isAuthPage = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/'

  if (isAuthPage || isLandingPage) return null

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-white/[0.08] bg-[#0d0d12] transition-all duration-300 sticky top-0 h-screen",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center px-6 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shrink-0">
            <span className="text-sm font-bold text-black">V</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-white">Holi</span>
          )}
        </Link>
      </div>

      <div className="flex-1 py-6 px-3 space-y-2">
        {areas.map((area) => {
          const isActive = area.activePattern.test(pathname || '')
          return (
            <Link
              key={area.name}
              href={area.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <area.icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "group-hover:text-white")} />
              {!isCollapsed && <span className="font-medium">{area.name}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />
              )}
            </Link>
          )
        })}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mt-auto m-4 p-2 rounded-lg border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  )
}
