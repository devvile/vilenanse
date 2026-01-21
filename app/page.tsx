import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Upload, Brain, BarChart3, Settings, Shield, Users, ArrowRight, Sparkles } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#0d0d12]">
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">AI-Powered Finance</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Track Your Expenses with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              AI-Powered
            </span>{' '}
            Categorization
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your bank statements, let AI categorize your expenses automatically,
            and gain insights into your spending habits with beautiful dashboards.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="group flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-full border border-white/[0.15] bg-white/[0.05] px-8 py-4 text-lg font-semibold text-white hover:bg-white/[0.1] transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Powerful features to help you understand and control your spending
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-emerald-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Upload className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">CSV Upload</h3>
              <p className="mt-2 text-gray-400">
                Simply upload your bank statement CSV files and we&apos;ll handle the rest. Support for multiple formats.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-purple-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">AI Categorization</h3>
              <p className="mt-2 text-gray-400">
                Our AI automatically categorizes your expenses with custom rules and smart learning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-blue-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Visual Dashboards</h3>
              <p className="mt-2 text-gray-400">
                Beautiful charts and graphs showing your spending patterns over time by category.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-orange-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                <Settings className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Custom Rules</h3>
              <p className="mt-2 text-gray-400">
                Create and manage your own categorization rules to fit your unique spending patterns.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-red-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Secure & Private</h3>
              <p className="mt-2 text-gray-400">
                Your financial data is encrypted and stored securely. Only you can access your information.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-8 hover:border-cyan-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                <Users className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Multi-User</h3>
              <p className="mt-2 text-gray-400">
                Each user has their own private workspace. Perfect for personal finance management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to take control of your finances?
            </h2>
            <p className="mt-4 text-xl text-white/80">
              Start tracking your expenses today. No credit card required.
            </p>
            <div className="mt-8">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-emerald-600 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-emerald-600 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <span className="text-sm font-bold text-black">V</span>
            </div>
            <span className="text-lg font-semibold text-white">Vinance</span>
          </div>
          <p className="text-gray-500">
            © 2025 Vinance. Built with Next.js and Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}