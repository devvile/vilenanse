import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Heart, Wallet, Brain, BarChart3, Activity, Shield, ArrowRight, Sparkles, Dumbbell, Moon } from 'lucide-react'

export const dynamic = 'force-dynamic'

const QUOTES = [
  "Excellence is not a destination; it's a continuous journey.",
  "Your only limit is the one you set for yourself.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The best way to predict the future is to create it.",
  "Discipline is the bridge between goals and accomplishment.",
  "Don't watch the clock; do what it does. Keep going.",
  "The secret of getting ahead is getting started.",
  "Strive for progress, not perfection.",
  "Your life only gets better when you get better.",
  "Action is the foundational key to all success.",
  "The man who moves a mountain begins by carrying away small stones.",
  "Don't be afraid to give up the good to go for the great.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "The only place where success comes before work is in the dictionary.",
  "Focus on being productive instead of busy.",
  "Your time is limited, so don't waste it living someone else's life.",
  "The only way to do great work is to love what you do.",
  "Energy and persistence conquer all things.",
  "Everything you’ve ever wanted is on the other side of fear.",
  "Be so good they can't ignore you.",
]

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    
    return (
      <div className="min-h-screen bg-[#0d0d12] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-2xl space-y-12 animate-in fade-in duration-1000 slide-in-from-bottom-4">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/90 italic tracking-tight leading-relaxed">
            "{randomQuote}"
          </p>
          
          <div className="pt-4">
            <Link
              href="/finance/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:scale-105 transition-all"
            >
              Aim for Excellence
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 sm:px-4 py-1.5 sm:py-2">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-emerald-400">Life Optimization Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Aim for{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Excellence
            </span>{' '}
            Every Day
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-400 max-w-2xl mx-auto px-2">
            Track your finances, monitor your health, and optimize your habits — all in one beautiful platform built for those who refuse to settle.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            {/* Guest View CTAs */}
            <Link
              href="/auth/signup"
              className="group flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-white/[0.15] bg-white/[0.05] px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-white/[0.1] transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center px-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              One platform. Every dimension of your life.
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-400">
              Holi brings together the tools you need to optimize finances, health, and daily habits.
            </p>
          </div>

          {/* Two main pillars */}
          <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Finance Pillar */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Finance</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Import bank statements, auto-categorize expenses with AI, set budgets, and visualize spending patterns with stunning dashboards.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/[0.03] rounded-lg px-3 py-2">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Smart Dashboards</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/[0.03] rounded-lg px-3 py-2">
                  <Brain className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>AI Categories</span>
                </div>
              </div>
            </div>

            {/* Health Pillar */}
            <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-b from-pink-500/5 to-transparent p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-pink-500/10">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Health</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Track calories, log workouts, monitor sleep quality, and build habits that compound into a healthier, more energized life.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/[0.03] rounded-lg px-3 py-2">
                  <Activity className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <span>Calorie Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 bg-white/[0.03] rounded-lg px-3 py-2">
                  <Dumbbell className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>Fitness Logs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-4 sm:p-8 hover:border-emerald-500/30 transition-all">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/10">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-xl font-semibold text-white">AI-Powered</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-400">
                Smart categorization learns from your patterns.
              </p>
            </div>

            <div className="group rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-4 sm:p-8 hover:border-purple-500/30 transition-all">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-purple-500/10">
                <Moon className="h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-xl font-semibold text-white">Sleep Tracking</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-400">
                Monitor and improve your sleep quality.
              </p>
            </div>

            <div className="group rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-4 sm:p-8 hover:border-blue-500/30 transition-all col-span-2 lg:col-span-1">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/10">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-xl font-semibold text-white">Private & Secure</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-base text-gray-400">
                Your data is encrypted. Only you have access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative px-6 py-10 sm:px-8 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Ready to optimize your life?
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-xl text-white/80 px-2">
              Start your journey to excellence today. Free forever.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-emerald-600 shadow-lg hover:bg-gray-50 transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500">
              <span className="text-xs sm:text-sm font-bold text-black">H</span>
            </div>
            <span className="text-base sm:text-lg font-semibold text-white">Holi</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            © 2025 Holi. Aim for Excellence.
          </p>
        </div>
      </footer>
    </div>
  )
}