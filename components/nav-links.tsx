'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, FileText, Clock, Activity, Moon, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

const financeLinks = [
  { href: '/finance/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance/expenses', label: 'Expenses', icon: FileText },
  { href: '/finance/incoming', label: 'Incoming', icon: Clock },
  { href: '/finance/categories', label: 'Categories', icon: BarChart3 },
]

const healthLinks = [
  { href: '/health/calories', label: 'Calories', icon: Activity },
  { href: '/health/sleep', label: 'Sleep', icon: Moon },
  { href: '/health/fitness', label: 'Fitness', icon: Dumbbell },
]

export function NavLinks() {
  const pathname = usePathname()

  const isFinance = pathname?.startsWith('/finance')
  const isHealth = pathname?.startsWith('/health')

  const links = isFinance ? financeLinks : isHealth ? healthLinks : []

  if (links.length === 0) return null

  return (
    <div className="hidden md:flex items-center gap-1 rounded-full bg-card p-1">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              isActive 
                ? "text-emerald-400 bg-emerald-500/10" 
                : "text-text-secondary hover:text-text-primary hover:bg-background-secondary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
