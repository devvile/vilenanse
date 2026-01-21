'use client'

import { Category } from '@/lib/types/database.types'
import { useState } from 'react'
import { EditCategoryModal } from './edit-category-modal'
import { DeleteCategoryButton } from './delete-category-button'
import { AddSubcategoryButton } from './add-subcategory-button'
import { Pencil, Trash2 } from 'lucide-react'

interface CategoryCardProps {
  category: Category & { subcategories: Category[] }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] shadow-sm">
        {/* Main Category Header */}
        <div className="border-b border-white/[0.08] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon || '📁'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-400">{category.description}</p>
                )}
                {category.is_system && (
                  <span className="mt-2 inline-block rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-gray-400">
                    System
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="rounded-lg bg-white/[0.05] p-2 text-gray-400 hover:bg-white/[0.1] hover:text-white transition-colors"
                title="Edit Category"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {!category.is_system && (
                <DeleteCategoryButton categoryId={category.id} />
              )}
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-400">
              Subcategories ({category.subcategories?.length || 0})
            </h4>
            <AddSubcategoryButton parentId={category.id} parentColor={category.color} />
          </div>

          {category.subcategories && category.subcategories.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.subcategories.map((sub) => (
                <SubcategoryItem key={sub.id} subcategory={sub} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No subcategories yet</p>
          )}
        </div>
      </div>

      {isEditOpen && (
        <EditCategoryModal
          category={category}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}

function SubcategoryItem({ subcategory }: { subcategory: Category }) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <div className="group relative rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{subcategory.icon || '🏷️'}</span>
            <div>
              <p className="text-sm font-medium text-gray-200">{subcategory.name}</p>
              {subcategory.description && (
                <p className="text-xs text-gray-500">{subcategory.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1.5 text-gray-400 hover:bg-white/[0.1] hover:text-white"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {!subcategory.is_system && (
              <DeleteCategoryButton categoryId={subcategory.id} isSubcategory />
            )}
          </div>
        </div>
      </div>

      {isEditOpen && (
        <EditCategoryModal
          category={subcategory}
          isSubcategory
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  )
}