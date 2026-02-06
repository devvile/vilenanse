'use client'

import { useState } from 'react'
import { parseCSV, CSVParseResult, ParsedExpense } from '@/lib/utils/csv-parser'
import { bulkCreateExpenses, checkDuplicates } from '@/lib/actions/expenses'
import { useRouter } from 'next/navigation'
import { FileUp, CheckCircle2, AlertCircle, Eye, EyeOff, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UploadCloud, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Step 1: Upload Card */}
      <Card className="bg-[#1a1a24] border-white/[0.08] overflow-hidden relative group transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
               <UploadCloud className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Step 1: Upload CSV File</h2>
          </div>
          
          <div className="space-y-6">
            <div className="max-w-xl">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Select CSV file from your bank
              </label>
              
              <div className="relative group/input">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed transition-all duration-300",
                  file 
                    ? "border-emerald-500/50 bg-emerald-500/5" 
                    : "border-white/10 bg-[#0d0d12] group-hover/input:border-emerald-500/30 group-hover/input:bg-emerald-500/[0.02]"
                )}>
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    file ? "bg-emerald-500 text-black" : "bg-white/5 text-gray-400 group-hover/input:text-emerald-400"
                  )}>
                    <FileUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-bold truncate",
                      file ? "text-white" : "text-gray-500"
                    )}>
                      {file ? file.name : "Wybierz plik..."}
                    </p>
                    {file && (
                      <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-tight">
                        {(file.size / 1024).toFixed(1)} KB • Ready to parse
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Info className="h-3 w-3 text-emerald-500" />
                <span>Currently supported: <span className="text-gray-300 font-bold">ING Bank Poland</span></span>
              </div>
            </div>

            {file && (
              <div className="pt-2">
                <button
                  onClick={handleParse}
                  disabled={parsing}
                  className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-black text-black hover:bg-emerald-400 disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center gap-2"
                >
                  {parsing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    'Parse File'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Step 2: Parse Results */}
      {parseResult && (
        <Card className="bg-[#1a1a24] border-white/[0.08] overflow-hidden relative transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Step 2: Review Results</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                 {parseResult.bankType} Detected
              </div>
            </div>
            
            {parseResult.success ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 group hover:bg-emerald-500/[0.08] transition-colors">
                    <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-1">Parsed Success</p>
                    <p className="text-3xl font-black text-white">{parseResult.data.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 group hover:bg-white/[0.04] transition-colors">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Skipped Rows</p>
                    <p className="text-3xl font-black text-white">{parseResult.skipped}</p>
                  </div>
                  <div className={cn(
                    "rounded-2xl p-5 border transition-colors group",
                    duplicateIndices.length > 0 
                      ? "bg-yellow-500/5 border-yellow-500/10 hover:bg-yellow-500/[0.08]" 
                      : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-1",
                      duplicateIndices.length > 0 ? "text-yellow-500/70" : "text-gray-500"
                    )}>Potential Dups</p>
                    <p className="text-3xl font-black text-white">{duplicateIndices.length}</p>
                  </div>
                </div>

                {duplicateIndices.length > 0 && (
                  <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 flex gap-3 items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                    <p className="text-sm text-yellow-200/90 font-medium">
                      <span className="font-black text-yellow-500 uppercase tracking-tighter mr-1">Note:</span> 
                      {duplicateIndices.length} potential duplicate(s) found. They will be automatically skipped to keep your data clean.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPreview ? 'Hide' : 'Show'} Transaction Preview
                  </button>
                </div>

                {showPreview && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="rounded-2xl border border-white/[0.05] bg-[#0d0d12] overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                              <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">#</th>
                              <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</th>
                              <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Details</th>
                              <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                              <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.03]">
                            {currentPageData.map((expense, index) => {
                              const actualIndex = startIndex + index
                              const isDup = duplicateIndices.includes(actualIndex)
                              return (
                                <tr
                                  key={actualIndex}
                                  className={cn(
                                    "group transition-colors",
                                    isDup ? "bg-yellow-500/5" : "hover:bg-white/[0.02]"
                                  )}
                                >
                                  <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                                    {(actualIndex + 1).toString().padStart(2, '0')}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300 font-medium">
                                    {expense.transaction_date}
                                  </td>
                                  <td className="px-4 py-3 max-w-[200px]">
                                    <p className="text-xs text-white font-bold truncate">{expense.merchant || 'Unknown'}</p>
                                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{expense.description || 'No description'}</p>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right font-black text-xs text-white">
                                    {expense.amount.toFixed(2)} <span className="opacity-50 text-[10px]">{expense.currency}</span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {isDup ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-yellow-500/10 text-yellow-500 uppercase tracking-widest">Skip</span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">Ready</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                           Showing <span className="text-gray-400">{startIndex + 1}-{Math.min(endIndex, parseResult.data.length)}</span> of <span className="text-gray-400">{parseResult.data.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-all"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-all"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="px-3 text-[10px] font-black text-white uppercase tracking-widest">
                            {currentPage} <span className="text-gray-600 px-1">/</span> {totalPages}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-all"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/5 text-gray-400 disabled:opacity-30 transition-all"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={importing || parseResult.data.length === duplicateIndices.length}
                  className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-black hover:bg-emerald-400 disabled:opacity-50 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.1)] active:scale-[0.99]"
                >
                  {importing
                    ? 'Importing into Database...'
                    : `Complete Import (${parseResult.data.length - duplicateIndices.length} Expenses)`}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                   <AlertCircle className="h-5 w-5 text-red-500" />
                   <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Parse Failed</h3>
                </div>
                <ul className="space-y-2">
                  {parseResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-300/80 font-medium list-disc ml-4">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions Card */}
      <Card className="bg-[#1a1a24]/50 border-white/[0.05] p-8 border-dashed">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-500/50" />
          Import Guide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <div>
             <h4 className="text-sm font-bold text-white mb-4">How to export from ING Bank:</h4>
             <ol className="space-y-3">
               {[
                 "Log in to your ING online banking",
                 "Go to Lista transakcji (Transaction list)",
                 "Select your desired date range",
                 "Click Export and choose CSV format",
                 "Upload the downloaded file in Step 1 above"
               ].map((step, i) => (
                 <li key={i} className="flex gap-3 items-start group">
                   <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-colors">{i + 1}</span>
                   <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{step}</span>
                 </li>
               ))}
             </ol>
           </div>
           
           <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.05]">
              <h4 className="text-sm font-bold text-white mb-2 italic">Pro Tip</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our parser automatically detects the bank format and identifies duplicates. If you import the same file twice, we'll smartly skip already existing transactions.
              </p>
           </div>
        </div>
      </Card>
    </div>
  )
}