-- Habits Tracker Schema

-- 1. HABITS TABLE
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- 2. HABIT COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)
);

-- Enable RLS
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_completions
CREATE POLICY "Users can view their own habit completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habit completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_at);
