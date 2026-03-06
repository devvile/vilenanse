-- Fitness Tracking Migration
-- Table for storing user trainings

CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    calories INTEGER NOT NULL DEFAULT 0,
    training_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own trainings" ON public.trainings;
CREATE POLICY "Users can view their own trainings"
    ON public.trainings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trainings" ON public.trainings;
CREATE POLICY "Users can insert their own trainings"
    ON public.trainings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trainings" ON public.trainings;
CREATE POLICY "Users can update their own trainings"
    ON public.trainings FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trainings" ON public.trainings;
CREATE POLICY "Users can delete their own trainings"
    ON public.trainings FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trainings_user_date ON public.trainings(user_id, training_date);
