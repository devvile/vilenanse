'use client'

import { useState } from 'react'
import { AddSubcategoryModal } from './add-subcategory-modal'

interface AddSubcategoryButtonProps {
  parentId: string
  parentColor: string
}

export function AddSubcategoryButton({ parentId, parentColor }: AddSubcategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Subcategory
      </button>

      {isOpen && (
        <AddSubcategoryModal
          parentId={parentId}
          parentColor={parentColor}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}