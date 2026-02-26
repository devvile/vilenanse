-- Registration Fix Migration
-- This script creates missing tables and fixes the handle_new_user function to prevent 500 errors during signup.

-- 1. Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'dark',
  currency TEXT NOT NULL DEFAULT 'PLN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own preferences' AND tablename = 'user_preferences') THEN
        CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own preferences' AND tablename = 'user_preferences') THEN
        CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own preferences' AND tablename = 'user_preferences') THEN
        CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Create profiles table if it doesn't exist (needed for Health/Calories)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_limit INTEGER DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 3. Robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for the new user (using ON CONFLICT DO NOTHING for safety)
  INSERT INTO public.categories (user_id, parent_id, name, color, icon, is_system, display_order)
  VALUES
    (NEW.id, NULL, 'Food & Dining', '#ef4444', '🍔', TRUE, 1),
    (NEW.id, NULL, 'Transportation', '#3b82f6', '🚗', TRUE, 2),
    (NEW.id, NULL, 'Shopping', '#8b5cf6', '🛍️', TRUE, 3),
    (NEW.id, NULL, 'Entertainment', '#ec4899', '🎬', TRUE, 4),
    (NEW.id, NULL, 'Bills & Utilities', '#f59e0b', '💡', TRUE, 5),
    (NEW.id, NULL, 'Health & Fitness', '#10b981', '💊', TRUE, 6),
    (NEW.id, NULL, 'Travel', '#06b6d4', '✈️', TRUE, 7),
    (NEW.id, NULL, 'Other', '#6b7280', '📦', TRUE, 8)
  ON CONFLICT DO NOTHING;
  
  -- Insert default user preferences
  INSERT INTO public.user_preferences (user_id, language, theme, currency)
  VALUES (NEW.id, 'en', 'dark', 'PLN')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default profile
  INSERT INTO public.profiles (id, daily_calorie_limit)
  VALUES (NEW.id, 2000)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
