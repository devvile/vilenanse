export type Category = {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  description: string | null
  color: string
  icon: string | null
  is_system: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type Expense = {
  id: string
  user_id: string
  category_id: string | null
  transaction_date: string
  booking_date: string | null
  amount: number
  currency: string
  merchant: string | null
  description: string | null
  transaction_type: string | null
  original_amount: number | null
  original_currency: string | null
  comment: string | null
  is_confirmed: boolean
  original_csv_data: any | null
  created_at: string
  updated_at: string
}

export type ExpenseWithCategory = Expense & {
  category: Category | null
  parent_category: Category | null
}

export type CreateExpenseInput = {
  transaction_date: string
  amount: number
  currency?: string
  merchant?: string
  description?: string
  category_id?: string
  comment?: string
  transaction_type?: string
}

export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  id: string
}