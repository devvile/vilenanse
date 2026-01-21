'use client'

import { Category } from '@/lib/types/database.types'
import { CategoryCard } from './category-card'
import { FolderOpen } from 'lucide-react'

interface CategoriesListProps {
  categories: (Category & { subcategories: Category[] })[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-12 text-center">
        <FolderOpen className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-sm font-semibold text-white">No categories</h3>
        <p className="mt-1 text-sm text-gray-400">
          Get started by creating a new category.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}