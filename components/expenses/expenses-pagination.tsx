'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpensesPaginationProps {
  currentPage: number
  totalPages: number
}

export function ExpensesPagination({ currentPage, totalPages }: ExpensesPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    // Preserve all existing search params
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/expenses?${params.toString()}`)
  }

  const pages = []
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, maxVisiblePages)
    } else {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1)
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  const btnClasses = "flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#1a1a24] text-sm font-medium text-gray-400 transition-all hover:bg-white/[0.05] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
  const activeClasses = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"

  return (
    <nav className="flex items-center gap-1.5" aria-label="Pagination">
      {/* First Page */}
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={btnClasses}
        title="First Page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>

      {/* Previous Page */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnClasses}
        title="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 mx-1">
        {startPage > 1 && (
          <>
            <button onClick={() => goToPage(1)} className={btnClasses}>1</button>
            {startPage > 2 && <span className="w-6 text-center text-gray-600">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={cn(btnClasses, page === currentPage && activeClasses)}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="w-6 text-center text-gray-600">...</span>}
            <button onClick={() => goToPage(totalPages)} className={btnClasses}>{totalPages}</button>
          </>
        )}
      </div>

      {/* Next Page */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnClasses}
        title="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className={btnClasses}
        title="Last Page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </nav>
  )
}