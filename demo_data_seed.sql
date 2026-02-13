-- Demo Data Seed Script
-- This script populates a demo account with realistic sample data
-- Run this in Supabase SQL Editor after creating a demo user account

-- ============================================================================
-- CONFIGURATION: Set your demo user email here
-- ============================================================================
-- First, create a demo user via the Supabase Auth UI or Google Sign-in
-- Then replace 'demo@vilenanse.com' with the actual email
DO $$
DECLARE
  demo_user_id UUID;
  food_cat_id UUID;
  transport_cat_id UUID;
  shopping_cat_id UUID;
  entertainment_cat_id UUID;
  bills_cat_id UUID;
  health_cat_id UUID;
  travel_cat_id UUID;
  other_cat_id UUID;
BEGIN
  -- Get the demo user ID
  SELECT id INTO demo_user_id 
  FROM auth.users 
  WHERE email = 'demo@vilenanse.com'; -- CHANGE THIS TO YOUR DEMO USER EMAIL

  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please create a user with email demo@vilenanse.com first.';
  END IF;

  -- Get category IDs (they should already exist from the trigger)
  SELECT id INTO food_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Food & Dining';
  SELECT id INTO transport_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Transportation';
  SELECT id INTO shopping_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Shopping';
  SELECT id INTO entertainment_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Entertainment';
  SELECT id INTO bills_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Bills & Utilities';
  SELECT id INTO health_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Health & Fitness';
  SELECT id INTO travel_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Travel';
  SELECT id INTO other_cat_id FROM categories WHERE user_id = demo_user_id AND name = 'Other';

  -- Clear existing demo data (optional - comment out if you want to keep existing data)
  DELETE FROM expenses WHERE user_id = demo_user_id;
  DELETE FROM recurring_expenses WHERE user_id = demo_user_id;
  DELETE FROM monthly_budgets WHERE user_id = demo_user_id;

  -- ============================================================================
  -- EXPENSES - Last 5 months of realistic transactions
  -- ============================================================================
  
  -- November 2025
  INSERT INTO expenses (user_id, category_id, transaction_date, amount, currency, merchant, description, is_confirmed) VALUES
  (demo_user_id, food_cat_id, '2025-11-01 10:30:00', 58.00, 'PLN', 'Biedronka', 'Weekly groceries', true),
  (demo_user_id, bills_cat_id, '2025-11-01 00:00:00', 420.00, 'PLN', 'PGE', 'Electricity bill', true),
  (demo_user_id, transport_cat_id, '2025-11-02 08:00:00', 200.00, 'PLN', 'ZTM', 'Monthly transit pass', true),
  (demo_user_id, food_cat_id, '2025-11-03 12:45:00', 42.00, 'PLN', 'Subway', 'Lunch', true),
  (demo_user_id, shopping_cat_id, '2025-11-05 16:00:00', 320.00, 'PLN', 'Reserved', 'Autumn jacket', true),
  (demo_user_id, entertainment_cat_id, '2025-11-07 20:30:00', 85.00, 'PLN', 'Cinema City', 'Movie night', true),
  (demo_user_id, food_cat_id, '2025-11-08 18:00:00', 125.00, 'PLN', 'Pizzeria', 'Dinner with family', true),
  (demo_user_id, food_cat_id, '2025-11-10 11:00:00', 48.00, 'PLN', 'Lidl', 'Groceries', true),
  (demo_user_id, health_cat_id, '2025-11-12 09:00:00', 250.00, 'PLN', 'Fitness Club', 'Gym membership', true),
  (demo_user_id, transport_cat_id, '2025-11-14 07:30:00', 35.00, 'PLN', 'Bolt', 'Ride to airport', true),
  (demo_user_id, bills_cat_id, '2025-11-15 10:00:00', 350.00, 'PLN', 'Orange', 'Internet & Phone', true),
  (demo_user_id, food_cat_id, '2025-11-16 13:00:00', 28.00, 'PLN', 'KFC', 'Quick lunch', true),
  (demo_user_id, shopping_cat_id, '2025-11-18 15:30:00', 165.00, 'PLN', 'Rossmann', 'Personal care items', true),
  (demo_user_id, food_cat_id, '2025-11-20 19:30:00', 95.00, 'PLN', 'Asian Restaurant', 'Dinner', true),
  (demo_user_id, entertainment_cat_id, '2025-11-22 21:00:00', 60.00, 'PLN', 'Spotify', 'Premium subscription', true),
  (demo_user_id, food_cat_id, '2025-11-24 12:00:00', 72.00, 'PLN', 'Carrefour', 'Weekend groceries', true),
  (demo_user_id, transport_cat_id, '2025-11-26 08:45:00', 22.00, 'PLN', 'Uber', 'Morning commute', true),
  (demo_user_id, entertainment_cat_id, '2025-11-27 20:00:00', 45.00, 'PLN', 'Netflix', 'Subscription', true),
  (demo_user_id, food_cat_id, '2025-11-29 14:00:00', 38.00, 'PLN', 'McDonald''s', 'Lunch', true),
  (demo_user_id, other_cat_id, '2025-11-30 16:00:00', 150.00, 'PLN', 'Empik', 'Books', true),

  -- December 2025
  (demo_user_id, food_cat_id, '2025-12-01 11:30:00', 62.00, 'PLN', 'Biedronka', 'Groceries', true),
  (demo_user_id, bills_cat_id, '2025-12-01 00:00:00', 480.00, 'PLN', 'PGE', 'Electricity (winter)', true),
  (demo_user_id, transport_cat_id, '2025-12-03 08:00:00', 200.00, 'PLN', 'ZTM', 'Monthly transit pass', true),
  (demo_user_id, shopping_cat_id, '2025-12-05 14:00:00', 450.00, 'PLN', 'Media Markt', 'Christmas gifts', true),
  (demo_user_id, food_cat_id, '2025-12-06 19:00:00', 140.00, 'PLN', 'Restauracja', 'Christmas dinner', true),
  (demo_user_id, entertainment_cat_id, '2025-12-08 18:00:00', 120.00, 'PLN', 'Teatr', 'Christmas show', true),
  (demo_user_id, food_cat_id, '2025-12-10 12:30:00', 55.00, 'PLN', 'Lidl', 'Weekly shopping', true),
  (demo_user_id, health_cat_id, '2025-12-12 10:00:00', 250.00, 'PLN', 'Fitness Club', 'Gym membership', true),
  (demo_user_id, shopping_cat_id, '2025-12-14 15:00:00', 380.00, 'PLN', 'H&M', 'Winter clothes', true),
  (demo_user_id, bills_cat_id, '2025-12-15 10:00:00', 350.00, 'PLN', 'Orange', 'Internet & Phone', true),
  (demo_user_id, food_cat_id, '2025-12-16 13:15:00', 45.00, 'PLN', 'Burger King', 'Lunch', true),
  (demo_user_id, transport_cat_id, '2025-12-18 09:00:00', 180.00, 'PLN', 'PKP', 'Train to family', true),
  (demo_user_id, shopping_cat_id, '2025-12-20 16:30:00', 520.00, 'PLN', 'Allegro', 'Christmas gifts online', true),
  (demo_user_id, food_cat_id, '2025-12-22 18:00:00', 280.00, 'PLN', 'Delikatesy', 'Christmas Eve shopping', true),
  (demo_user_id, entertainment_cat_id, '2025-12-24 20:00:00', 200.00, 'PLN', 'Cinema City', 'Family movie', true),
  (demo_user_id, food_cat_id, '2025-12-26 14:00:00', 95.00, 'PLN', 'Pizza Hut', 'Post-Christmas meal', true),
  (demo_user_id, entertainment_cat_id, '2025-12-27 21:00:00', 60.00, 'PLN', 'Spotify', 'Premium subscription', true),
  (demo_user_id, food_cat_id, '2025-12-29 12:00:00', 68.00, 'PLN', 'Carrefour', 'New Year groceries', true),
  (demo_user_id, other_cat_id, '2025-12-31 22:00:00', 350.00, 'PLN', 'Club', 'New Year''s Eve party', true),

  -- January 2026
  INSERT INTO expenses (user_id, category_id, transaction_date, amount, currency, merchant, description, is_confirmed) VALUES
  (demo_user_id, food_cat_id, '2026-01-02 12:30:00', 45.50, 'PLN', 'Biedronka', 'Grocery shopping', true),
  (demo_user_id, food_cat_id, '2026-01-03 19:15:00', 85.00, 'PLN', 'Pizza Hut', 'Dinner with friends', true),
  (demo_user_id, transport_cat_id, '2026-01-05 08:00:00', 120.00, 'PLN', 'PKP', 'Train ticket to Warsaw', true),
  (demo_user_id, shopping_cat_id, '2026-01-07 14:20:00', 250.00, 'PLN', 'H&M', 'Winter clothes', true),
  (demo_user_id, food_cat_id, '2026-01-08 13:00:00', 32.00, 'PLN', 'McDonald''s', 'Lunch', true),
  (demo_user_id, entertainment_cat_id, '2026-01-10 20:00:00', 45.00, 'PLN', 'Cinema City', 'Movie tickets', true),
  (demo_user_id, food_cat_id, '2026-01-12 18:30:00', 150.00, 'PLN', 'Restauracja Polska', 'Dinner', true),
  (demo_user_id, bills_cat_id, '2026-01-15 10:00:00', 350.00, 'PLN', 'Orange', 'Internet & Phone', true),
  (demo_user_id, transport_cat_id, '2026-01-16 09:00:00', 25.00, 'PLN', 'Uber', 'Ride to work', true),
  (demo_user_id, food_cat_id, '2026-01-18 12:00:00', 55.00, 'PLN', 'Lidl', 'Groceries', true),
  (demo_user_id, health_cat_id, '2026-01-20 15:00:00', 180.00, 'PLN', 'Apteka', 'Medications', true),
  (demo_user_id, shopping_cat_id, '2026-01-22 16:00:00', 420.00, 'PLN', 'Media Markt', 'Headphones', true),
  (demo_user_id, food_cat_id, '2026-01-25 19:00:00', 95.00, 'PLN', 'Sushi Bar', 'Dinner', true),
  (demo_user_id, entertainment_cat_id, '2026-01-27 21:00:00', 60.00, 'PLN', 'Spotify', 'Premium subscription', true),
  (demo_user_id, food_cat_id, '2026-01-30 12:30:00', 48.00, 'PLN', 'Carrefour', 'Groceries', true),

  -- February 2026
  (demo_user_id, food_cat_id, '2026-02-01 11:00:00', 52.00, 'PLN', 'Żabka', 'Snacks and drinks', true),
  (demo_user_id, bills_cat_id, '2026-02-01 00:00:00', 450.00, 'PLN', 'PGE', 'Electricity bill', true),
  (demo_user_id, transport_cat_id, '2026-02-03 08:30:00', 200.00, 'PLN', 'ZTM', 'Monthly transit pass', true),
  (demo_user_id, food_cat_id, '2026-02-04 13:15:00', 38.00, 'PLN', 'KFC', 'Lunch', true),
  (demo_user_id, shopping_cat_id, '2026-02-05 15:00:00', 180.00, 'PLN', 'Rossmann', 'Cosmetics & toiletries', true),
  (demo_user_id, entertainment_cat_id, '2026-02-07 19:30:00', 120.00, 'PLN', 'Teatr Wielki', 'Theater tickets', true),
  (demo_user_id, food_cat_id, '2026-02-08 12:00:00', 65.00, 'PLN', 'Biedronka', 'Weekly groceries', true),
  (demo_user_id, health_cat_id, '2026-02-09 10:00:00', 250.00, 'PLN', 'Fitness Club', 'Gym membership', true),
  (demo_user_id, food_cat_id, '2026-02-09 20:00:00', 110.00, 'PLN', 'Burger King', 'Dinner', true);

  -- ============================================================================
  -- RECURRING EXPENSES
  -- ============================================================================
  INSERT INTO recurring_expenses (user_id, name, amount, category_id, payment_day) VALUES
  (demo_user_id, 'Rent', 2500.00, bills_cat_id, 1),
  (demo_user_id, 'Internet & Phone', 350.00, bills_cat_id, 15),
  (demo_user_id, 'Gym Membership', 250.00, health_cat_id, 9),
  (demo_user_id, 'Spotify Premium', 60.00, entertainment_cat_id, 27),
  (demo_user_id, 'Netflix', 45.00, entertainment_cat_id, 12),
  (demo_user_id, 'Transit Pass', 200.00, transport_cat_id, 3);

  -- ============================================================================
  -- MONTHLY BUDGETS
  -- ============================================================================
  INSERT INTO monthly_budgets (user_id, month, limit_amount) VALUES
  (demo_user_id, '2025-11', 7000.00),
  (demo_user_id, '2025-12', 8500.00),
  (demo_user_id, '2026-01', 7500.00),
  (demo_user_id, '2026-02', 7500.00),
  (demo_user_id, '2026-03', 8000.00);

  -- ============================================================================
  -- USER PREFERENCES (if not already set)
  -- ============================================================================
  INSERT INTO user_preferences (user_id, language, theme, currency)
  VALUES (demo_user_id, 'en', 'dark', 'PLN')
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Demo data successfully created for user: %', demo_user_id;
END $$;
