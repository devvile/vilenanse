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

function parseINGRow(row: any): ParsedExpense | null {
  try {
    const transactionDate = row['Data transakcji']
    const bookingDate = row['Data księgowania']
    const merchant = row['Dane kontrahenta']?.trim()
    const description = row['Tytuł']?.trim()
    const amountStr = row['Kwota transakcji (waluta rachunku)']
    const currency = row['Waluta']
    const transactionType = row['Szczegóły']?.trim()
    const originalAmountStr = row['Kwota płatności w walucie']

    // Skip if no transaction date or amount
    if (!transactionDate || !amountStr) {
      return null
    }

    // Parse amount (handle Polish number format: comma as decimal separator)
    const amount = parseFloat(amountStr.toString().replace(',', '.').replace(/\s/g, ''))
    if (isNaN(amount)) {
      return null
    }

    // Parse original amount if exists (for foreign currency transactions)
    let originalAmount: number | null = null
    let originalCurrency: string | null = null
    if (originalAmountStr && originalAmountStr.toString().trim()) {
      const parsed = parseFloat(originalAmountStr.toString().replace(',', '.').replace(/\s/g, ''))
      if (!isNaN(parsed) && parsed !== 0) {
        originalAmount = parsed
        // Original currency is in the column after "Kwota płatności w walucie"
        originalCurrency = 'EUR' // Most common, could be refined
      }
    }

    // Convert date format (already in YYYY-MM-DD from ING)
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
    const transactionDate = row['Data rozpoczęcia'] || row['Started Date']
    const bookingDate = row['Data zrealizowania'] || row['Completed Date']
    const description = row['Opis'] || row['Description']
    const amountStr = row['Kwota'] || row['Amount']
    const currency = row['Waluta'] || row['Currency']
    const transactionType = row['Rodzaj'] || row['Type']

    if (!transactionDate || !amountStr) return null

    // Parse amount (Revolut uses dot as decimal separator)
    const amount = parseFloat(amountStr.toString().replace(',', '.').replace(/\s/g, ''))
    if (isNaN(amount)) return null

    // Date in Revolut is YYYY-MM-DD HH:mm:ss
    const parsedDate = transactionDate.split(' ')[0]
    const parsedBookingDate = bookingDate ? bookingDate.split(' ')[0] : null

    return {
      transaction_date: parsedDate,
      booking_date: parsedBookingDate,
      amount: amount,
      currency: currency?.trim() || 'PLN',
      merchant: description || null, // Revolut usually puts merchant in description
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
    // Determine possible delimiters to try
    const delimiters = requestedBankType === 'ING' ? [';'] : (requestedBankType === 'Revolut' ? [','] : [';', ','])
    
    // For auto-detection, we'll read the first few lines to guess the delimiter and format
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const firstLine = content.split('\n')[0]
      
      // Default to semicolon if it looks like ING, otherwise comma
      let delimiter = ','
      if (content.includes('Data transakcji') || content.includes('Kwota transakcji')) {
        delimiter = ';'
      } else if (firstLine.includes(';')) {
        delimiter = ';'
      }

      Papa.parse(file, {
        header: false,
        delimiter: delimiter,
        encoding: 'Windows-1250',
        skipEmptyLines: true,
        complete: (firstPass: any) => {
          const allRows = firstPass.data as any[]
          let bankType: 'ING' | 'Revolut' | 'Unknown' = 'Unknown'
          let headerRowIndex = -1
          let headers: string[] = []

          // 1. Detect Bank and Header Row
          for (let i = 0; i < Math.min(allRows.length, 35); i++) {
            const row = allRows[i]
            if (!Array.isArray(row)) continue
            
            const rowStr = row.join('|').toLowerCase()
            
            // Check for ING
            if (rowStr.includes('data transakcji') && rowStr.includes('kwota transakcji')) {
              bankType = 'ING'
              headerRowIndex = i
              break
            }
            // Check for Revolut
            if ((rowStr.includes('rodzaj') && rowStr.includes('kwota')) || 
                (rowStr.includes('type') && rowStr.includes('amount') && rowStr.includes('product'))) {
              bankType = 'Revolut'
              headerRowIndex = i
              break
            }
          }

          if (bankType === 'Unknown' || headerRowIndex === -1) {
            resolve({
              success: false,
              data: [],
              errors: [
                'Unable to detect bank format automatically.',
                'Supported banks: ING Bank Poland, Revolut.',
                'Please ensure you are uploading the original CSV file export.'
              ],
              skipped: 0,
              bankType: 'Unknown',
            })
            return
          }

          // 2. Prepare Headers
          headers = allRows[headerRowIndex].map((h: any) => 
            h?.toString().trim().replace(/^"/, '').replace(/"$/, '')
          )

          // 3. Parse Data Rows
          const dataRows = allRows.slice(headerRowIndex + 1)
          const parsedData: ParsedExpense[] = []
          let skipped = 0

          dataRows.forEach((row: any[]) => {
            if (!Array.isArray(row) || row.length < 5) {
              skipped++
              return
            }

            const rowObj: any = {}
            headers.forEach((header: string, index: number) => {
              if (header) {
                rowObj[header] = row[index]?.toString().trim().replace(/^"/, '').replace(/"$/, '').replace(/^'/, '').replace(/'$/, '')
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
            errors: parsedData.length === 0 ? ['No valid transactions found'] : [],
            skipped,
            bankType: bankType,
          })
        },
        error: (error: any) => {
          resolve({
            success: false,
            data: [],
            errors: [`Failed to parse CSV: ${error.message}`],
            skipped: 0,
            bankType: 'Unknown',
          })
        }
      })
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Failed to read file content'],
        skipped: 0,
        bankType: 'Unknown',
      })
    }
    
    reader.readAsText(file, 'Windows-1250')
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
      Math.abs(existing.amount - newExp.amount) < 0.01 && // Float comparison
      (existing.merchant === newExp.merchant || existing.merchant?.includes(newExp.merchant || '___') || newExp.merchant?.includes(existing.merchant || '___'))
    )
    
    if (isDuplicate) {
      duplicateIndices.add(index)
    }
  })
  
  return duplicateIndices
}
