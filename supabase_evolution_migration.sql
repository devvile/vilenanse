-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can create their own proposals" 
    ON public.proposals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all proposals" 
    ON public.proposals FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own proposals" 
    ON public.proposals FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
    ON public.proposals FOR DELETE 
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
