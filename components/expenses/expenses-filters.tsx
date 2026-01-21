// components/expenses/expenses-filters.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Filter, Search, Calendar } from 'lucide-react'

interface Category {
  id: string
  name: string
  parent_id: string | null
  color: string
}

interface ExpensesFiltersProps {
  categories: Category[]
}

export function ExpensesFilters({ categories }: ExpensesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current filter values from URL
  const currentMainCategory = searchParams.get('main_category') || ''
  const currentSubCategory = searchParams.get('sub_category') || ''
  const currentType = searchParams.get('type') || 'all'
  // Default to 'unassigned' if not present
  const currentAssignment = searchParams.get('assignment') || 'unassigned'
  const currentMerchant = searchParams.get('merchant') || ''
  const currentDateFrom = searchParams.get('date_from') || ''
  const currentDateTo = searchParams.get('date_to') || ''

  const [selectedMainCategory, setSelectedMainCategory] = useState(currentMainCategory)
  const [selectedSubCategory, setSelectedSubCategory] = useState(currentSubCategory)
  const [selectedType, setSelectedType] = useState(currentType)
  const [selectedAssignment, setSelectedAssignment] = useState(currentAssignment)
  const [merchantSearch, setMerchantSearch] = useState(currentMerchant)
  const [dateFrom, setDateFrom] = useState(currentDateFrom)
  const [dateTo, setDateTo] = useState(currentDateTo)

  // Get main categories and subcategories
  const mainCategories = categories.filter(cat => !cat.parent_id)
  const subcategories = selectedMainCategory
    ? categories.filter(cat => cat.parent_id === selectedMainCategory)
    : []

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    // Apply filters
    if (selectedMainCategory) {
      params.set('main_category', selectedMainCategory)
    } else {
      params.delete('main_category')
    }

    if (selectedSubCategory) {
      params.set('sub_category', selectedSubCategory)
    } else {
      params.delete('sub_category')
    }

    if (selectedType !== 'all') {
      params.set('type', selectedType)
    } else {
      params.delete('type')
    }

    if (selectedAssignment !== 'unassigned') {
      params.set('assignment', selectedAssignment)
    } else {
      params.delete('assignment')
    }

    if (merchantSearch.trim()) {
      params.set('merchant', merchantSearch.trim())
    } else {
      params.delete('merchant')
    }

    if (dateFrom) {
      params.set('date_from', dateFrom)
    } else {
      params.delete('date_from')
    }

    if (dateTo) {
      params.set('date_to', dateTo)
    } else {
      params.delete('date_to')
    }

    startTransition(() => {
      router.push(`/expenses?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSelectedMainCategory('')
    setSelectedSubCategory('')
    setSelectedType('all')
    // Reset to default 'unassigned'
    setSelectedAssignment('unassigned')
    setMerchantSearch('')
    setDateFrom('')
    setDateTo('')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('main_category')
    params.delete('sub_category')
    params.delete('type')
    params.delete('assignment')
    params.delete('merchant')
    params.delete('date_from')
    params.delete('date_to')
    params.set('page', '1')
    
    startTransition(() => {
      router.push(`/expenses?${params.toString()}`)
    })
  }

  const hasActiveFilters = selectedMainCategory || selectedSubCategory || selectedType !== 'all' || selectedAssignment !== 'all' || merchantSearch.trim() || dateFrom || dateTo

  // Quick date range presets
  const setDateRange = (range: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    switch (range) {
      case 'today':
        setDateFrom(`${year}-${month}-${day}`)
        setDateTo(`${year}-${month}-${day}`)
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        setDateFrom(`${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`)
        setDateTo(`${year}-${month}-${day}`)
        break
      case 'month':
        setDateFrom(`${year}-${month}-01`)
        setDateTo(`${year}-${month}-${day}`)
        break
      case 'year':
        setDateFrom(`${year}-01-01`)
        setDateTo(`${year}-${month}-${day}`)
        break
    }
  }

  const selectClasses = "w-full rounded-xl border border-white/[0.08] bg-[#13131a] px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  const inputClasses = "w-full rounded-xl border border-white/[0.08] bg-[#13131a] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
  const labelClasses = "block text-sm font-medium text-gray-400 mb-2"

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Main Category Filter */}
          <div>
            <label className={labelClasses}>
              Main Category
            </label>
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value)
                setSelectedSubCategory('') // Reset subcategory when main changes
              }}
              className={selectClasses}
            >
              <option value="">All categories</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <label className={labelClasses}>
              Subcategory
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedMainCategory || subcategories.length === 0}
              className={`${selectClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">All subcategories</option>
              {subcategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className={labelClasses}>
              Transaction Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={selectClasses}
            >
              <option value="all">All types</option>
              <option value="positive">Income (Positive)</option>
              <option value="negative">Expenses (Negative)</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div>
            <label className={labelClasses}>
              Category Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className={selectClasses}
            >
              <option value="all">All expenses</option>
              <option value="assigned">With category</option>
              <option value="unassigned">Without category</option>
            </select>
          </div>

          {/* Merchant Search Filter */}
          <div>
            <label className={labelClasses}>
              Merchant Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={merchantSearch}
                onChange={(e) => setMerchantSearch(e.target.value)}
                placeholder="e.g. Zabka"
                className={`${inputClasses} pl-9`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyFilters()
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Second Row - Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Date From */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>
              Date From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`${inputClasses} pl-9`}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="lg:col-span-2">
            <label className={labelClasses}>
              Date To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`${inputClasses} pl-9`}
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="lg:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={() => setDateRange('today')}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateRange('week')}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              Last 7d
            </button>
            <button
              type="button"
              onClick={() => setDateRange('month')}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateRange('year')}
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <p className="text-sm text-gray-500 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedMainCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                {mainCategories.find(c => c.id === selectedMainCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedMainCategory('')
                    setSelectedSubCategory('')
                  }}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                {subcategories.find(c => c.id === selectedSubCategory)?.name}
                <button
                  onClick={() => setSelectedSubCategory('')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                {selectedType === 'positive' ? 'Income' : 'Expenses'}
                <button
                  onClick={() => setSelectedType('all')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedAssignment !== 'unassigned' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                {selectedAssignment === 'assigned' ? 'With category' : 'All Expenses'}
                <button
                  onClick={() => setSelectedAssignment('unassigned')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {merchantSearch.trim() && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                Merchant: "{merchantSearch}"
                <button
                  onClick={() => setMerchantSearch('')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                From: {dateFrom}
                <button
                  onClick={() => setDateFrom('')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-sm text-emerald-400">
                To: {dateTo}
                <button
                  onClick={() => setDateTo('')}
                  className="hover:text-emerald-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}