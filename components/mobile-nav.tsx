'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

function MobileNavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const activeArea = areas.find(area => area.activePattern.test(pathname || ''))

  return (
    <>
      {/* Backdrop — solid dark overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{ zIndex: 99998 }}
        onClick={onClose}
      />

      {/* Full-screen drawer */}
      <div
        className={cn(
          "fixed inset-0 w-screen h-screen bg-[#0d0d12] transition-all duration-500 ease-[cubic-bezier(0.32,0,0.67,0)] flex flex-col",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
        style={{ zIndex: 99999 }}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/[0.08] shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-sm font-bold text-black uppercase">V</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Vilenance</span>
          </Link>
          <button
            onClick={onClose}
            className="p-3 bg-white/[0.05] rounded-full text-white hover:bg-white/[0.1] transition-all active:scale-90"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
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
                    onClick={onClose}
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
                      onClick={onClose}
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
        <div className="p-8 border-t border-white/[0.08] bg-black/20 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium text-white/50">Vilenance v1.0</p>
            <div className="h-1 w-12 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Wait for client-side mount for portal
  useEffect(() => {
    setMounted(true)
  }, [])

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
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Portal: render drawer at document.body root so it's outside any stacking context */}
      {mounted && createPortal(
        <MobileNavDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  )
}
