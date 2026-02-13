-- Quick diagnostic query to check if trigger and function exist
-- Run this in Supabase SQL Editor to verify the migration worked

-- 1. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- 3. Check if categories table exists and has the right structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- 4. Test the function manually (replace YOUR_USER_ID with an actual user ID from auth.users)
-- DO NOT RUN THIS if you don't want to create duplicate categories
-- SELECT public.handle_new_user() FROM auth.users WHERE id = 'YOUR_USER_ID' LIMIT 1;
