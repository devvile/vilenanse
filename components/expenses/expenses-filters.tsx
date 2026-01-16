// components/expenses/expenses-filters.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const currentAssignment = searchParams.get('assignment') || 'all'
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

    if (selectedAssignment !== 'all') {
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
    setSelectedAssignment('all')
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Category
            </label>
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value)
                setSelectedSubCategory('') // Reset subcategory when main changes
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedMainCategory || subcategories.length === 0}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All types</option>
              <option value="positive">Income (Positive)</option>
              <option value="negative">Expenses (Negative)</option>
            </select>
          </div>

          {/* Assignment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All expenses</option>
              <option value="assigned">With category</option>
              <option value="unassigned">Without category</option>
            </select>
          </div>

          {/* Merchant Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant Search
            </label>
            <input
              type="text"
              value={merchantSearch}
              onChange={(e) => setMerchantSearch(e.target.value)}
              placeholder="e.g. Zabka"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters()
                }
              }}
            />
          </div>
        </div>

        {/* Second Row - Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Date From */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="lg:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={() => setDateRange('today')}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateRange('week')}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Last 7d
            </button>
            <button
              type="button"
              onClick={() => setDateRange('month')}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateRange('year')}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
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
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedMainCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {mainCategories.find(c => c.id === selectedMainCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedMainCategory('')
                    setSelectedSubCategory('')
                  }}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {subcategories.find(c => c.id === selectedSubCategory)?.name}
                <button
                  onClick={() => setSelectedSubCategory('')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {selectedType === 'positive' ? 'Income' : 'Expenses'}
                <button
                  onClick={() => setSelectedType('all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedAssignment !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {selectedAssignment === 'assigned' ? 'With category' : 'Without category'}
                <button
                  onClick={() => setSelectedAssignment('all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {merchantSearch.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Merchant: "{merchantSearch}"
                <button
                  onClick={() => setMerchantSearch('')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {dateFrom && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                From: {dateFrom}
                <button
                  onClick={() => setDateFrom('')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {dateTo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                To: {dateTo}
                <button
                  onClick={() => setDateTo('')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}