'use client'

import { useState } from 'react'
import { AddMainCategoryModal } from './add-main-category-modal'

export function AddMainCategoryButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Category
      </button>

      {isOpen && <AddMainCategoryModal onClose={() => setIsOpen(false)} />}
    </>
  )
}