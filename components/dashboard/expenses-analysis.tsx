'use client'

import { useState } from 'react'
import { ExpensesDonutChart } from './expenses-donut'
import { SubcategoryChart } from './subcategory-chart'
import { SpendingLineChart } from './spending-line-chart'
import { DateRange, getExpensesBySubcategory } from '@/lib/actions/dashboard'

interface ExpensesAnalysisProps {
  initialDonutData: {
    id: string
    name: string
    value: number
    color: string
    parent_id: string | null
  }[]
  initialSpendingData: { date: string; amount: number }[]
}

export function ExpensesAnalysis({ initialDonutData, initialSpendingData }: ExpensesAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [subcategoryData, setSubcategoryData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>('last_month')

  const handleCategorySelect = async (category: { id: string; name: string }) => {
    if (selectedCategory?.id === category.id) {
       // Deselect if clicking same
       setSelectedCategory(null)
       setSubcategoryData([])
       return
    }

    setSelectedCategory(category)
    setLoadingSubcategories(true)
    try {
      const data = await getExpensesBySubcategory(category.id, currentDateRange)
      setSubcategoryData(data)
    } catch (error) {
      console.error('Failed to fetch subcategories', error)
    } finally {
      setLoadingSubcategories(false)
    }
  }

  const handleDateRangeChange = (range: DateRange) => {
    setCurrentDateRange(range)
    // If a category is selected, we should re-fetch its subcategories for the new range
    // NOTE: In a real app we might want to trigger this update. 
    // For simplicity, let's just clear selection or re-fetch if selected.
    if (selectedCategory) {
       // Re-fetch
       setLoadingSubcategories(true)
       getExpensesBySubcategory(selectedCategory.id, range)
         .then(setSubcategoryData)
         .catch(console.error)
         .finally(() => setLoadingSubcategories(false))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="h-[400px]">
        <ExpensesDonutChart 
          initialData={initialDonutData} 
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategory?.id}
          onDateRangeChangeProp={handleDateRangeChange}
        />
      </div>
      <div className="h-[400px]">
        <SubcategoryChart 
          data={subcategoryData} 
          loading={loadingSubcategories}
          categoryName={selectedCategory?.name || ''}
        />
      </div>
      <div className="lg:col-span-2 h-[400px]">
         <SpendingLineChart 
            initialData={initialSpendingData} 
            categoryId={selectedCategory?.id}
            categoryName={selectedCategory?.name}
         />
      </div>
    </div>
  )
}
