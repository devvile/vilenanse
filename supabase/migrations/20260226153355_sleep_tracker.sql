-- Sleep Tracker Migration
-- Stores sleep records and user preferences for sleep targets

-- 1. Create sleep_records table
CREATE TABLE IF NOT EXISTS public.sleep_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    logical_date DATE NOT NULL,
    woke_up_at TIMESTAMPTZ,
    started_day_at TIMESTAMPTZ,
    went_to_bed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure one record per user per logical date
    UNIQUE(user_id, logical_date)
);

-- Enable RLS for sleep_records
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sleep_records
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own sleep records' AND tablename = 'sleep_records') THEN
        CREATE POLICY "Users can view their own sleep records" ON public.sleep_records FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own sleep records' AND tablename = 'sleep_records') THEN
        CREATE POLICY "Users can insert their own sleep records" ON public.sleep_records FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own sleep records' AND tablename = 'sleep_records') THEN
        CREATE POLICY "Users can update their own sleep records" ON public.sleep_records FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own sleep records' AND tablename = 'sleep_records') THEN
        CREATE POLICY "Users can delete their own sleep records" ON public.sleep_records FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Add sleep preferences to profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'desired_woke_up_at') THEN
        ALTER TABLE public.profiles ADD COLUMN desired_woke_up_at TIME DEFAULT '07:00:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'desired_started_day_at') THEN
        ALTER TABLE public.profiles ADD COLUMN desired_started_day_at TIME DEFAULT '08:00:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'desired_went_to_bed_at') THEN
        ALTER TABLE public.profiles ADD COLUMN desired_went_to_bed_at TIME DEFAULT '23:00:00';
    END IF;
END $$;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_date ON public.sleep_records(user_id, logical_date);
