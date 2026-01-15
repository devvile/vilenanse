'use client'

import { Category } from '@/lib/types/database.types'
import { useState } from 'react'
import { EditCategoryModal } from './edit-category-modal'
import { DeleteCategoryButton } from './delete-category-button'
import { AddSubcategoryButton } from './add-subcategory-button'

interface CategoryCardProps {
  category: Category & { subcategories: Category[] }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Main Category Header */}
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon || '📁'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
                {category.is_system && (
                  <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    System
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Edit
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
            <h4 className="text-sm font-semibold text-gray-700">
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
            <p className="text-sm text-gray-500">No subcategories yet</p>
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
      <div className="group relative rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{subcategory.icon || '🏷️'}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{subcategory.name}</p>
              {subcategory.description && (
                <p className="text-xs text-gray-500">{subcategory.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1 hover:bg-gray-100"
              title="Edit"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
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