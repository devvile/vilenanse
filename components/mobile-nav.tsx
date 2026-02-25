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
          className="fixed inset-0 z-[9998] bg-[#0d0d12]/95 backdrop-blur-xl lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] w-full h-full bg-[#0d0d12] lg:hidden transform transition-all duration-500 ease-[cubic-bezier(0.32,0,0.67,0)]",
          isOpen 
            ? "translate-y-0 opacity-100 pointer-events-auto visible" 
            : "-translate-y-full opacity-0 pointer-events-none invisible"
        )}
      >
        <div className="flex flex-col h-full safe-top">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/[0.08]">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <span className="text-sm font-bold text-black uppercase">V</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Holi</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 bg-white/[0.05] rounded-full text-white hover:bg-white/[0.1] transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-10 px-6 space-y-12">
            {/* Areas */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] px-2">Main Sections</p>
              <div className="grid grid-cols-1 gap-3">
                {areas.map((area) => {
                  const isActive = area.activePattern.test(pathname || '')
                  return (
                    <Link
                      key={area.name}
                      href={area.href}
                      className={cn(
                        "flex items-center justify-between px-5 py-5 rounded-2xl transition-all border",
                        isActive 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                          : "bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <area.icon className={cn("h-6 w-6", isActive ? "text-emerald-400" : "text-gray-500")} />
                        <span className="text-lg font-semibold">{area.name}</span>
                      </div>
                      <ChevronRight className={cn("h-5 w-5 opacity-30", isActive && "opacity-100")} />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Sub Links for current area */}
            {activeArea && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] px-2">
                  Explore {activeArea.name}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {activeArea.links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
                          isActive 
                            ? "bg-white/[0.05] text-white font-bold" 
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                          isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.03] text-gray-600"
                        )}>
                          <link.icon className="h-4 w-4" />
                        </div>
                        <span className="text-base">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/[0.08] bg-black/20">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-white/50">Holi v1.0 • Built for Excellence</p>
              <div className="h-1 w-12 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
