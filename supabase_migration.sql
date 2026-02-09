-- Vinance Database Schema Migration
-- Run this in your Supabase SQL Editor to set up the production database

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  transaction_date TIMESTAMPTZ NOT NULL,
  booking_date TIMESTAMPTZ,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PLN',
  merchant TEXT,
  description TEXT,
  transaction_type TEXT,
  original_amount DECIMAL(10,2),
  original_currency TEXT,
  comment TEXT,
  is_confirmed BOOLEAN DEFAULT TRUE,
  original_csv_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. RECURRING EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_expenses
DROP POLICY IF EXISTS "Users can view their own recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can view their own recurring expenses"
  ON recurring_expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can insert their own recurring expenses"
  ON recurring_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can update their own recurring expenses"
  ON recurring_expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can delete their own recurring expenses"
  ON recurring_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. MONTHLY BUDGETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  limit_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_budgets
DROP POLICY IF EXISTS "Users can view their own budgets" ON monthly_budgets;
CREATE POLICY "Users can view their own budgets"
  ON monthly_budgets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own budgets" ON monthly_budgets;
CREATE POLICY "Users can insert their own budgets"
  ON monthly_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own budgets" ON monthly_budgets;
CREATE POLICY "Users can update their own budgets"
  ON monthly_budgets FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own budgets" ON monthly_budgets;
CREATE POLICY "Users can delete their own budgets"
  ON monthly_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. FUNCTION TO CREATE DEFAULT CATEGORIES FOR NEW USERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for the new user
  INSERT INTO public.categories (user_id, parent_id, name, color, icon, is_system, display_order)
  VALUES
    (NEW.id, NULL, 'Food & Dining', '#ef4444', '🍔', TRUE, 1),
    (NEW.id, NULL, 'Transportation', '#3b82f6', '🚗', TRUE, 2),
    (NEW.id, NULL, 'Shopping', '#8b5cf6', '🛍️', TRUE, 3),
    (NEW.id, NULL, 'Entertainment', '#ec4899', '🎬', TRUE, 4),
    (NEW.id, NULL, 'Bills & Utilities', '#f59e0b', '💡', TRUE, 5),
    (NEW.id, NULL, 'Health & Fitness', '#10b981', '💊', TRUE, 6),
    (NEW.id, NULL, 'Travel', '#06b6d4', '✈️', TRUE, 7),
    (NEW.id, NULL, 'Other', '#6b7280', '📦', TRUE, 8);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGER TO AUTO-CREATE CATEGORIES ON USER SIGNUP
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_transaction_date ON expenses(transaction_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_id ON monthly_budgets(user_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
