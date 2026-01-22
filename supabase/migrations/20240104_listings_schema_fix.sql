-- Fix listings table schema to match TypeScript types
-- Adds missing columns that are used in the application

-- Add missing columns to listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS sub_category TEXT,
  ADD COLUMN IF NOT EXISTS retail_price INTEGER, -- Retail price in ZAR cents
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  ADD COLUMN IF NOT EXISTS product_link TEXT,
  ADD COLUMN IF NOT EXISTS estimated_retail_price INTEGER; -- AI suggested retail price in ZAR cents

-- Note: condition column already exists as INTEGER (1-10)
-- The application uses string values like 'New', 'Slightly used', 'Very used'
-- You may want to either:
-- 1. Change condition to TEXT and use the string values
-- 2. Or map the integer values to strings in the application code

-- Option 1: Change condition to TEXT (uncomment if you want to use string values)
-- ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_condition_check;
-- ALTER TABLE listings ALTER COLUMN condition TYPE TEXT;
-- ALTER TABLE listings ADD CONSTRAINT listings_condition_check 
--   CHECK (condition IN ('New', 'Slightly used', 'Very used'));

-- Option 2: Keep as INTEGER and map in code (current setup)
-- 1 = New, 2-5 = Slightly used, 6-10 = Very used
