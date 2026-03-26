-- Add is_period and is_pms to meals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'is_period'
  ) THEN
    ALTER TABLE public.meals ADD COLUMN is_period boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meals' AND column_name = 'is_pms'
  ) THEN
    ALTER TABLE public.meals ADD COLUMN is_pms boolean NOT NULL DEFAULT false;
  END IF;
END $$;
