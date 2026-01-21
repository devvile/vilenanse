import { getCategoriesHierarchical } from '@/lib/actions/categories'
import { CategoriesList } from '@/components/categories/categories-list'
import { AddMainCategoryButton } from '@/components/categories/add-main-category-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const categories = await getCategoriesHierarchical()

  return (
    <div className="min-h-screen bg-[#0d0d12] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Categories</h1>
            <p className="mt-2 text-gray-400">
              Manage your expense categories and subcategories
            </p>
          </div>
          <AddMainCategoryButton />
        </div>

        {/* Categories List */}
        <CategoriesList categories={categories} />
      </div>
    </div>
  )
}