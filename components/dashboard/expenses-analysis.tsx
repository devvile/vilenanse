'use client'

import { useState, useEffect } from 'react'
import { ExpensesDonutChart } from './expenses-donut'
import { SubcategoryChart } from './subcategory-chart'
import { SpendingLineChart } from './spending-line-chart'
import { MinimalTransactionList } from './minimal-transaction-list'
import { DateRange, getExpensesBySubcategory, getCategoryTransactions } from '@/lib/actions/dashboard'

interface ExpensesAnalysisProps {
  initialDonutData: {
    id: string
    name: string
    value: number
    color: string
    parent_id: string | null
  }[]
  initialSpendingData: { date: string; amount: number }[]
  dateRange: DateRange
}

export function ExpensesAnalysis({ initialDonutData, initialSpendingData, dateRange }: ExpensesAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ id: string; name: string } | null>(null)
  const [subcategoryData, setSubcategoryData] = useState<{ id: string; name: string; value: number; color: string }[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Sync subcategories and transactions if range/selection changes
  useEffect(() => {
    const fetchSelectedData = async () => {
      const activeId = selectedSubcategory?.id || selectedCategory?.id
      if (!activeId) {
        setTransactions([])
        return
      }

      setLoadingTransactions(true)
      try {
        const txs = await getCategoryTransactions(activeId, dateRange)
        setTransactions(txs)
      } catch (error) {
        console.error('Failed to fetch category transactions', error)
      } finally {
        setLoadingTransactions(false)
      }
    }

    fetchSelectedData()
  }, [dateRange, selectedCategory?.id, selectedSubcategory?.id])

  // Separate effect for subcategories (only depends on category)
  useEffect(() => {
    if (selectedCategory) {
       setLoadingSubcategories(true)
       getExpensesBySubcategory(selectedCategory.id, dateRange)
         .then(setSubcategoryData)
         .catch(console.error)
         .finally(() => setLoadingSubcategories(false))
    } else {
      setSubcategoryData([])
    }
  }, [dateRange, selectedCategory?.id])

  const handleCategorySelect = async (category: { id: string; name: string }) => {
    if (selectedCategory?.id === category.id) {
        handleReset()
        return
    }

    setSelectedCategory(category)
    setSelectedSubcategory(null)
  }

  const handleSubcategorySelect = (subcategory: { id: string; name: string }) => {
    if (selectedSubcategory?.id === subcategory.id) {
      setSelectedSubcategory(null)
      return
    }
    setSelectedSubcategory(subcategory)
  }

  const handleReset = () => {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSubcategoryData([])
    setTransactions([])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-[500px]">
          <ExpensesDonutChart 
            initialData={initialDonutData} 
            onCategorySelect={handleCategorySelect}
            onReset={handleReset}
            selectedCategoryId={selectedCategory?.id}
          />
        </div>
        <div className="h-[500px]">
          <SubcategoryChart 
            data={subcategoryData} 
            loading={loadingSubcategories}
            categoryName={selectedCategory?.name || ''}
            onSubcategorySelect={handleSubcategorySelect}
            selectedSubcategoryId={selectedSubcategory?.id}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 h-[500px]">
           <SpendingLineChart 
              initialData={initialSpendingData} 
              categoryId={selectedSubcategory?.id || selectedCategory?.id}
              categoryName={selectedSubcategory?.name || selectedCategory?.name}
           />
        </div>
        <div className="lg:col-span-1 h-[500px]">
           <MinimalTransactionList 
              transactions={transactions}
              loading={loadingTransactions}
              categoryName={selectedSubcategory?.name || selectedCategory?.name || ''}
           />
        </div>
      </div>
    </div>
  )
}
