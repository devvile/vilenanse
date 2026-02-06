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
      <div className="rounded-xl border border-card-border bg-card p-12 text-center">
        <FolderOpen className="mx-auto h-12 w-12 text-text-muted" />
        <h3 className="mt-2 text-sm font-semibold text-text-primary">No categories</h3>
        <p className="mt-1 text-sm text-text-muted">
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