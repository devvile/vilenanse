'use client'

import { useState } from 'react'
import { parseCSV, CSVParseResult, ParsedExpense } from '@/lib/utils/csv-parser'
import { bulkCreateExpenses, checkDuplicates } from '@/lib/actions/expenses'
import { useRouter } from 'next/navigation'

export function CSVUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [duplicateIndices, setDuplicateIndices] = useState<number[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setParseResult(null)
      setShowPreview(false)
      setCurrentPage(1)
    }
  }

  const handleParse = async () => {
    if (!file) return

    setParsing(true)
    try {
      const result = await parseCSV(file)
      setParseResult(result)
      
      if (result.success && result.data.length > 0) {
        // Check for duplicates
        const duplicates = await checkDuplicates(result.data)
        setDuplicateIndices(duplicates)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Parse error:', error)
      setParseResult({
        success: false,
        data: [],
        errors: ['Failed to parse CSV file'],
        skipped: 0,
        bankType: 'Unknown',
      })
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!parseResult?.data) return

    setImporting(true)
    try {
      // Filter out duplicates if user wants
      const expensesToImport = parseResult.data.filter(
        (_, index) => !duplicateIndices.includes(index)
      )

      if (expensesToImport.length === 0) {
        alert('No expenses to import after removing duplicates')
        return
      }

      await bulkCreateExpenses(expensesToImport)
      
      // Success! Redirect to expenses page
      router.push('/expenses?imported=true')
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import expenses. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  // Pagination calculations
  const totalPages = parseResult ? Math.ceil(parseResult.data.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = parseResult?.data.slice(startIndex, endIndex) || []

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload CSV File</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV file from your bank
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              Currently supported: ING Bank Poland
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-4">
              <div className="flex-1 rounded-md bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">{file.name}</p>
                <p className="text-xs text-blue-700">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleParse}
                disabled={parsing}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {parsing ? 'Parsing...' : 'Parse File'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Parse Results */}
      {parseResult && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Review Results</h2>
          
          {parseResult.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-600">Parsed Successfully</p>
                  <p className="text-2xl font-bold text-green-900">
                    {parseResult.data.length}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-600">Skipped Rows</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {parseResult.skipped}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-600">Potential Duplicates</p>
                  <p className="text-2xl font-bold text-red-900">
                    {duplicateIndices.length}
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Bank detected:</span> {parseResult.bankType}
                </p>
              </div>

              {duplicateIndices.length > 0 && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-900">
                    ⚠️ {duplicateIndices.length} potential duplicate(s) found. They will be skipped during import.
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {showPreview ? 'Hide' : 'Show'} preview
              </button>

              {showPreview && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Merchant</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Currency</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {currentPageData.map((expense, index) => {
                          const actualIndex = startIndex + index
                          return (
                            <tr
                              key={actualIndex}
                              className={duplicateIndices.includes(actualIndex) ? 'bg-yellow-50' : ''}
                            >
                              <td className="px-3 py-2 text-xs text-gray-500">
                                {actualIndex + 1}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {expense.transaction_date}
                              </td>
                              <td className="px-3 py-2 max-w-xs truncate text-xs">
                                {expense.merchant || '-'}
                              </td>
                              <td className="px-3 py-2 max-w-xs truncate text-xs">
                                {expense.description || '-'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right font-medium text-xs">
                                {expense.amount.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs">
                                {expense.currency}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                {duplicateIndices.includes(actualIndex) ? (
                                  <span className="text-xs text-yellow-600">Duplicate</span>
                                ) : (
                                  <span className="text-xs text-green-600">Ready</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(endIndex, parseResult.data.length)}
                          </span>{' '}
                          of <span className="font-medium">{parseResult.data.length}</span> transactions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          First
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-700">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={importing || parseResult.data.length === duplicateIndices.length}
                className="w-full rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
              >
                {importing
                  ? 'Importing...'
                  : `Import ${parseResult.data.length - duplicateIndices.length} Expenses`}
              </button>
            </div>
          ) : (
            <div className="rounded-md bg-red-50 p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Errors:</h3>
              <ul className="list-disc list-inside space-y-1">
                {parseResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">How to export CSV from ING Bank:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Log in to your ING online banking</li>
          <li>Go to Lista transakcji (Transaction list)</li>
          <li>Select date range</li>
          <li>Click Export and choose CSV format</li>
          <li>Upload the downloaded file here</li>
        </ol>
      </div>
    </div>
  )
}