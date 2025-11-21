-- ==========================================
-- EDOFINDS COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- Step 1: Drop existing tables and policies (clean slate)
-- ==========================================
DROP POLICY IF EXISTS "Allow public to read products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Allow public to read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
DROP POLICY IF EXISTS "Allow public to read ads" ON ads;
DROP POLICY IF EXISTS "Allow authenticated users to manage ads" ON ads;

DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ads CASCADE;

-- Step 2: Create tables
-- ==========================================

-- Categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  img_path TEXT,
  condition TEXT NOT NULL DEFAULT 'Brand New',
  location TEXT NOT NULL DEFAULT 'GRA',
  seller_name TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE ads (
  id BIGSERIAL PRIMARY KEY,
  image_path TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add constraints
-- ==========================================

ALTER TABLE products ADD CONSTRAINT valid_condition 
CHECK (condition IN (
  'Brand New', 
  'Used - Excellent', 
  'Used - Good', 
  'Used - Fair', 
  'Refurbished'
));

ALTER TABLE products ADD CONSTRAINT valid_location 
CHECK (location IN (
  'GRA', 'Ugbowo', 'Uselu', 'Siluko Road', 'Akpakpava', 'Ring Road',
  'Sapele Road', 'Airport Road', 'Ikpoba Hill', 'New Benin', 'Ogida',
  'Ogbe', 'Ekenwan Road', 'Adesuwa', 'Okhoro', 'Etete', 'Oliha',
  'Upper Sokponba', 'Lower Sokponba', 'Textile Mill Road', 'Iwogban',
  'Uwelu', 'Evbuotubu', 'Ogbelaka', 'Igun', 'Iweka', 'Ihogbe',
  'Isekhere', 'Urubi'
));

-- Step 4: Insert sample data
-- ==========================================

INSERT INTO categories (name) 
VALUES 
  ('kitchen'), 
  ('furniture'), 
  ('decor'), 
  ('watches'), 
  ('clothes'), 
  ('fans'),
  ('electronics'),
  ('phones'),
  ('laptops'),
  ('accessories')
ON CONFLICT (name) DO NOTHING;

-- Step 5: Enable Row Level Security
-- ==========================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies for CATEGORIES
-- ==========================================

-- Allow everyone to read categories
CREATE POLICY "categories_select_policy"
ON categories
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage categories
CREATE POLICY "categories_insert_policy"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "categories_update_policy"
ON categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "categories_delete_policy"
ON categories
FOR DELETE
TO authenticated
USING (true);

-- Step 7: Create RLS Policies for PRODUCTS
-- ==========================================

-- Allow everyone to read products (public marketplace)
CREATE POLICY "products_select_policy"
ON products
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "products_insert_policy"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY "products_update_policy"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete products
CREATE POLICY "products_delete_policy"
ON products
FOR DELETE
TO authenticated
USING (true);

-- Step 8: Create RLS Policies for ADS
-- ==========================================

-- Allow everyone to read ads
CREATE POLICY "ads_select_policy"
ON ads
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage ads
CREATE POLICY "ads_insert_policy"
ON ads
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "ads_update_policy"
ON ads
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "ads_delete_policy"
ON ads
FOR DELETE
TO authenticated
USING (true);

-- Step 9: Verify setup
-- ==========================================

-- Check that RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename;

-- Check all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename, cmd;

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- You should see:
-- - 3 tables with RLS enabled
-- - 4 policies for products (SELECT, INSERT, UPDATE, DELETE)
-- - 4 policies for categories (SELECT, INSERT, UPDATE, DELETE)
-- - 4 policies for ads (SELECT, INSERT, UPDATE, DELETE)
-- ==========================================

