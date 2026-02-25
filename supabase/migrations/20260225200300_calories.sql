-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_limit integer DEFAULT 2000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Table: meals
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calories integer NOT NULL CHECK (calories > 0),
  eaten_at date NOT NULL DEFAULT CURRENT_DATE,
  caused_hurt boolean NOT NULL DEFAULT false,
  is_munchies boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only select their own meals' AND tablename = 'meals') THEN
        CREATE POLICY "Users can only select their own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only insert their own meals' AND tablename = 'meals') THEN
        CREATE POLICY "Users can only insert their own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only update their own meals' AND tablename = 'meals') THEN
        CREATE POLICY "Users can only update their own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only delete their own meals' AND tablename = 'meals') THEN
        CREATE POLICY "Users can only delete their own meals" ON meals FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure calorie limit column exists in profiles (redundant but safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'daily_calorie_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN daily_calorie_limit integer DEFAULT 2000;
  END IF;
END $$;
