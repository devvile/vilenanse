import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MealCSVUpload } from '@/components/health/meal-csv-upload'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ImportMealsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    return (
        <div className="min-h-screen bg-[#0d0d12] py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        href="/health/calories"
                        className="inline-flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors mb-4"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Calories
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">Import Meals</h1>
                    <p className="mt-2 text-gray-400 font-medium">
                        Upload a CSV file to import your meal history in bulk
                    </p>
                </div>

                <MealCSVUpload />
            </div>
        </div>
    )
}
