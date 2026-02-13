-- User Preferences Table Migration
-- Run this in Supabase SQL Editor after the main migration

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'dark',
  currency TEXT NOT NULL DEFAULT 'PLN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;
CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATE TRIGGER TO CREATE DEFAULT PREFERENCES
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
  
  -- Insert default user preferences
  INSERT INTO public.user_preferences (user_id, language, theme, currency)
  VALUES (NEW.id, 'en', 'dark', 'PLN');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEX FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
