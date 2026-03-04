import Papa from 'papaparse'

export interface ParsedMeal {
    name: string
    calories: number
    eaten_at: string
    is_munchies: boolean
    caused_hurt: boolean
}

export interface MealCSVParseResult {
    success: boolean
    data: ParsedMeal[]
    errors: string[]
    skipped: number
}

export async function parseMealCSV(file: File): Promise<MealCSVParseResult> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: (result) => {
                const parsedData: ParsedMeal[] = []
                const errors: string[] = []
                let skipped = 0

                result.data.forEach((row: any, index: number) => {
                    try {
                        const name = row.name?.trim()
                        const calories = parseInt(row.calories)
                        const eaten_at = row.eaten_at?.trim()
                        const is_munchies = row.is_munchies?.toLowerCase() === 'true'
                        const caused_hurt = row.caused_hurt?.toLowerCase() === 'true'

                        if (!name || isNaN(calories) || !eaten_at) {
                            skipped++
                            return
                        }

                        // Basic date validation (YYYY-MM-DD)
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(eaten_at)) {
                            skipped++
                            return
                        }

                        parsedData.push({
                            name,
                            calories,
                            eaten_at,
                            is_munchies,
                            caused_hurt
                        })
                    } catch (e) {
                        skipped++
                        errors.push(`Row ${index + 1}: Failed to parse`)
                    }
                })

                resolve({
                    success: parsedData.length > 0,
                    data: parsedData,
                    errors,
                    skipped
                })
            },
            error: (error) => {
                resolve({
                    success: false,
                    data: [],
                    errors: [error.message],
                    skipped: 0
                })
            }
        })
    })
}
