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

export async function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    // Parse with semicolon delimiter (ING uses ; not ,)
    Papa.parse(file, {
      header: false,
      delimiter: ';', // ✅ ING uses semicolons!
      encoding: 'Windows-1250', // ✅ Set encoding for Polish characters
      skipEmptyLines: true,
      complete: (firstPass: any) => {
        const allRows = firstPass.data as any[]
        
        // Find header row (should be around line 22)
        let headerRowIndex = -1
        for (let i = 0; i < Math.min(allRows.length, 30); i++) {
          const row = allRows[i]
          if (Array.isArray(row)) {
            // Check if this row contains ING headers
            const rowStr = row.join('|').toLowerCase()
            if (rowStr.includes('data transakcji') && rowStr.includes('kwota transakcji')) {
              headerRowIndex = i
              break
            }
          }
        }

        if (headerRowIndex === -1) {
          resolve({
            success: false,
            data: [],
            errors: [
              'Unable to detect ING Bank format.',
              'Could not find header row with "Data transakcji" and "Kwota transakcji".',
              'Please make sure you uploaded the correct ING CSV file.'
            ],
            skipped: 0,
            bankType: 'Unknown',
          })
          return
        }

        console.log('Found header row at index:', headerRowIndex)

        // Get headers from the detected row
        const headers = allRows[headerRowIndex].map((h: any) => 
          h?.toString().trim().replace(/^"/, '').replace(/"$/, '')
        )

        console.log('Headers found:', headers)

        // Parse data rows (everything after header row)
        const dataRows = allRows.slice(headerRowIndex + 1)
        
        const errors: string[] = []
        const parsedData: ParsedExpense[] = []
        let skipped = 0

        // Parse each data row
        dataRows.forEach((row: any[]) => {
          if (!Array.isArray(row) || row.length < 10) {
            skipped++
            return
          }

          // Create object from row using headers
          const rowObj: any = {}
          headers.forEach((header: string, index: number) => {
            if (header) {
              rowObj[header] = row[index]?.toString().trim().replace(/^"/, '').replace(/"$/, '').replace(/^'/, '').replace(/'$/, '')
            }
          })

          const parsed = parseINGRow(rowObj)
          if (parsed) {
            parsedData.push(parsed)
          } else {
            skipped++
          }
        })

        console.log(`Parsed ${parsedData.length} expenses, skipped ${skipped}`)

        if (parsedData.length === 0) {
          errors.push('No valid transactions found in CSV file')
        }

        resolve({
          success: errors.length === 0 && parsedData.length > 0,
          data: parsedData,
          errors,
          skipped,
          bankType: 'ING',
        })
      },
      error: (error: any) => {
        console.error('PapaParse error:', error)
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse CSV: ${error.message}`],
          skipped: 0,
          bankType: 'Unknown',
        })
      },
    })
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
      existing.merchant === newExp.merchant
    )
    
    if (isDuplicate) {
      duplicateIndices.add(index)
    }
  })
  
  return duplicateIndices
}