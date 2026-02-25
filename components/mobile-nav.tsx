'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Menu, 
  X, 
  Wallet, 
  Heart, 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Clock, 
  Activity, 
  Moon, 
  Dumbbell,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const areas = [
  {
    name: 'Finance',
    icon: Wallet,
    href: '/finance/dashboard',
    activePattern: /^\/finance/,
    links: [
      { href: '/finance/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/finance/expenses', label: 'Expenses', icon: FileText },
      { href: '/finance/incoming', label: 'Incoming', icon: Clock },
      { href: '/finance/categories', label: 'Categories', icon: BarChart3 },
    ]
  },
  {
    name: 'Health',
    icon: Heart,
    href: '/health/calories',
    activePattern: /^\/health/,
    links: [
      { href: '/health/calories', label: 'Calories', icon: Activity },
      { href: '/health/sleep', label: 'Sleep', icon: Moon },
      { href: '/health/fitness', label: 'Fitness', icon: Dumbbell },
    ]
  },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const activeArea = areas.find(area => area.activePattern.test(pathname || ''))

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[101] w-[280px] bg-[#0d0d12] border-r border-white/[0.08] lg:hidden transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/[0.08]">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <span className="text-sm font-bold text-black">V</span>
              </div>
              <span className="text-lg font-semibold text-white">Vilenance</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
            {/* Areas */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 mb-4">Areas</p>
              {areas.map((area) => {
                const isActive = area.activePattern.test(pathname || '')
                return (
                  <Link
                    key={area.name}
                    href={area.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                      isActive 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <area.icon className="h-5 w-5" />
                      <span className="font-medium">{area.name}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                  </Link>
                )
              })}
            </div>

            {/* Sub Links for current area */}
            {activeArea && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 mb-4">
                  {activeArea.name} Navigation
                </p>
                {activeArea.links.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive 
                          ? "text-emerald-400 font-bold" 
                          : "text-gray-400 hover:text-white"
                      )}
                    >
                      <link.icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-gray-500")} />
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08]">
            <p className="text-[10px] text-center text-text-muted">
              Vinance v1.0 • Built for Excellence
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
