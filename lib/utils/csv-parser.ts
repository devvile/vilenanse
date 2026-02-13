import Papa from 'papaparse'

export interface ParsedExpense {
  transaction_date: string
  booking_date: string | null
  amount: number
  currency: string
  merchant: string | null
  description: string | null
  transaction_type: string | null
  original_amount: number | null
  original_currency: string | null
}

export interface CSVParseResult {
  success: boolean
  data: ParsedExpense[]
  errors: string[]
  skipped: number
  bankType: string
}

function detectEncoding(content: string): string {
  // Simple heuristic: ING files usually have "Data transakcji" and are Windows-1250
  // Revolut files are usually UTF-8
  if (content.includes('Data transakcji') || content.includes('Kwota transakcji')) {
    return 'Windows-1250'
  }
  return 'UTF-8'
}

function getColumnValue(rowObj: any, possibleNames: string[]): string | undefined {
  const keys = Object.keys(rowObj)
  for (const name of possibleNames) {
    // Try exact match
    if (rowObj[name] !== undefined) return rowObj[name]
    
    // Try case-insensitive and trimmed match
    const foundKey = keys.find(k => 
      k.toLowerCase().trim() === name.toLowerCase().trim() ||
      k.toLowerCase().includes(name.toLowerCase().trim())
    )
    if (foundKey) return rowObj[foundKey]
  }
  return undefined
}

function parseINGRow(row: any): ParsedExpense | null {
  try {
    const transactionDate = getColumnValue(row, ['Data transakcji', 'Transaction date'])
    const bookingDate = getColumnValue(row, ['Data księgowania', 'Booking date'])
    const merchant = getColumnValue(row, ['Dane kontrahenta', 'Contractor details'])?.trim()
    const description = getColumnValue(row, ['Tytuł', 'Title'])?.trim()
    const amountStr = getColumnValue(row, ['Kwota transakcji', 'Transaction amount'])
    const currency = getColumnValue(row, ['Waluta', 'Currency'])
    const transactionType = getColumnValue(row, ['Szczegóły', 'Details'])?.trim()
    const originalAmountStr = getColumnValue(row, ['Kwota płatności w walucie', 'Payment amount in currency'])

    if (!transactionDate || !amountStr) {
      return null
    }

    // Parse amount (handle Polish number format: comma as decimal separator)
    const amount = parseFloat(amountStr.toString().replace(',', '.').replace(/\s/g, ''))
    if (isNaN(amount)) {
      return null
    }

    // Parse original amount if exists
    let originalAmount: number | null = null
    let originalCurrency: string | null = null
    if (originalAmountStr && originalAmountStr.toString().trim()) {
      const parsed = parseFloat(originalAmountStr.toString().replace(',', '.').replace(/\s/g, ''))
      if (!isNaN(parsed) && parsed !== 0) {
        originalAmount = parsed
        originalCurrency = 'EUR' 
      }
    }

    const parsedDate = parseINGDate(transactionDate)
    const parsedBookingDate = bookingDate ? parseINGDate(bookingDate) : null

    return {
      transaction_date: parsedDate,
      booking_date: parsedBookingDate,
      amount,
      currency: currency?.trim() || 'PLN',
      merchant: merchant || null,
      description: description || null,
      transaction_type: transactionType || null,
      original_amount: originalAmount,
      original_currency: originalCurrency,
    }
  } catch (error) {
    console.error('Error parsing ING row:', error, row)
    return null
  }
}

function parseINGDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  
  const str = dateStr.toString().trim()
  
  // Handle YYYY-MM-DD format (ING format)
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return str
  }
  
  // Fallback
  return new Date().toISOString().split('T')[0]
}

function parseRevolutRow(row: any): ParsedExpense | null {
  try {
    const transactionDate = getColumnValue(row, ['Data rozpoczęcia', 'Started Date', 'Started_Date', 'Date'])
    const bookingDate = getColumnValue(row, ['Data zrealizowania', 'Completed Date', 'Completed_Date'])
    const description = getColumnValue(row, ['Opis', 'Description'])
    const amountStr = getColumnValue(row, ['Kwota', 'Amount'])
    const currency = getColumnValue(row, ['Waluta', 'Currency'])
    const transactionType = getColumnValue(row, ['Rodzaj', 'Type'])

    if (!transactionDate || !amountStr) return null

    // Parse amount
    const amount = parseFloat(amountStr.toString().replace(',', '.').replace(/\s/g, ''))
    if (isNaN(amount)) return null

    // Date in Revolut is often YYYY-MM-DD HH:mm:ss
    const parsedDate = transactionDate.split(' ')[0]
    const parsedBookingDate = bookingDate ? bookingDate.split(' ')[0] : null

    return {
      transaction_date: parsedDate,
      booking_date: parsedBookingDate,
      amount: amount,
      currency: currency?.trim() || 'PLN',
      merchant: description || null,
      description: description || null,
      transaction_type: transactionType || null,
      original_amount: null,
      original_currency: null,
    }
  } catch (error) {
    console.error('Error parsing Revolut row:', error, row)
    return null
  }
}

export async function parseCSV(file: File, requestedBankType: 'Auto' | 'ING' | 'Revolut' = 'Auto'): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      // 1. Detect encoding
      const encoding = detectEncoding(content)
      
      // If we need to re-read with correct encoding
      if (encoding === 'Windows-1250' && !content.includes('Data transakcji') && content.includes('Data transakcji'.substring(0, 4))) {
        // Redo with Windows-1250 if we suspect it's wrong (already handled by reader.readAsText below, but being safe)
      }

      // 2. Guess Delimiter
      let delimiter = content.includes(';') ? ';' : ','
      const firstLine = content.split('\n')[0]
      if (firstLine.includes(';')) delimiter = ';'
      else if (firstLine.includes(',')) delimiter = ','

      Papa.parse(file, {
        header: false,
        delimiter: delimiter,
        encoding: encoding,
        skipEmptyLines: 'greedy',
        complete: (firstPass: any) => {
          const allRows = firstPass.data as any[]
          let bankType: 'ING' | 'Revolut' | 'Unknown' = 'Unknown'
          let headerRowIndex = -1

          // 3. Detect Bank Type and Header Row
          for (let i = 0; i < Math.min(allRows.length, 50); i++) {
            const row = allRows[i]
            if (!Array.isArray(row) || row.length < 3) continue
            
            const rowStr = row.join('|').toLowerCase()
            
            // ING Detection
            if (rowStr.includes('data transakcji') || (rowStr.includes('transaction') && rowStr.includes('amount') && rowStr.includes('account'))) {
              bankType = 'ING'
              headerRowIndex = i
              break
            }
            // Revolut Detection
            if (rowStr.includes('rodzaj') || rowStr.includes('product') || (rowStr.includes('started') && rowStr.includes('completed') && rowStr.includes('amount'))) {
              bankType = 'Revolut'
              headerRowIndex = i
              break
            }
          }

          if (bankType === 'Unknown' || headerRowIndex === -1) {
            resolve({
              success: false,
              data: [],
              errors: ['Unsupported format. Please use original CSV from ING or Revolut.'],
              skipped: 0,
              bankType: 'Unknown',
            })
            return
          }

          // 4. Extract Headers
          const headers = allRows[headerRowIndex].map((h: any) => 
            h?.toString().trim().replace(/^"/, '').replace(/"$/, '')
          )

          // 5. Parse Rows
          const dataRows = allRows.slice(headerRowIndex + 1)
          const parsedData: ParsedExpense[] = []
          let skipped = 0

          dataRows.forEach((row: any[]) => {
            if (!Array.isArray(row) || row.length < 3) {
              skipped++
              return
            }

            const rowObj: any = {}
            headers.forEach((header: string, index: number) => {
              if (header) {
                rowObj[header] = row[index]?.toString().trim().replace(/^"/, '').replace(/"$/, '')
              }
            })

            const parsed = bankType === 'ING' ? parseINGRow(rowObj) : parseRevolutRow(rowObj)
            if (parsed) {
              parsedData.push(parsed)
            } else {
              skipped++
            }
          })

          resolve({
            success: parsedData.length > 0,
            data: parsedData,
            errors: parsedData.length === 0 ? ['No transactions found in file. Check headers.'] : [],
            skipped,
            bankType,
          })
        },
        error: (error) => {
          resolve({ success: false, data: [], errors: [error.message], skipped: 0, bankType: 'Unknown' })
        }
      })
    }
    
    // We start by reading as UTF-8 to detect type, then PapaParse handles the rest
    reader.readAsText(file, 'UTF-8')
  })
}

// Helper to detect duplicates
export function findDuplicates(
  newExpenses: ParsedExpense[],
  existingExpenses: { transaction_date: string; amount: number; merchant: string | null }[]
): Set<number> {
  const duplicateIndices = new Set<number>()
  
  newExpenses.forEach((newExp, index) => {
    const isDuplicate = existingExpenses.some(existing => 
      existing.transaction_date === newExp.transaction_date &&
      Math.abs(existing.amount - newExp.amount) < 0.01 && 
      (existing.merchant === newExp.merchant || 
       existing.merchant?.toLowerCase().includes(newExp.merchant?.toLowerCase() || '___') || 
       newExp.merchant?.toLowerCase().includes(existing.merchant?.toLowerCase() || '___'))
    )
    
    if (isDuplicate) {
      duplicateIndices.add(index)
    }
  })
  
  return duplicateIndices
}

