'use client'

import { useState } from 'react'
import { AddSubcategoryModal } from './add-subcategory-modal'
import { Plus } from 'lucide-react'

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
        className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
      >
        <Plus className="h-3 w-3" />
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