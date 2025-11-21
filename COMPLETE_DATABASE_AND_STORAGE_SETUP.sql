-- ==========================================
-- EDOFINDS COMPLETE SETUP - DATABASE + STORAGE
-- Run this ENTIRE script in Supabase SQL Editor
-- ==========================================

-- ==========================================
-- PART 1: DATABASE SETUP
-- ==========================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Allow public to read products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
DROP POLICY IF EXISTS "Allow public to read categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
DROP POLICY IF EXISTS "Allow public to read ads" ON ads;
DROP POLICY IF EXISTS "Allow authenticated users to manage ads" ON ads;

DROP POLICY IF EXISTS "products_select_policy" ON products;
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "products_delete_policy" ON products;
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;
DROP POLICY IF EXISTS "ads_select_policy" ON ads;
DROP POLICY IF EXISTS "ads_insert_policy" ON ads;
DROP POLICY IF EXISTS "ads_update_policy" ON ads;
DROP POLICY IF EXISTS "ads_delete_policy" ON ads;

-- Step 2: Drop and recreate tables
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS ads CASCADE;

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
INSERT INTO categories (name) 
VALUES 
  ('kitchen'), ('furniture'), ('decor'), ('watches'), ('clothes'), ('fans'),
  ('electronics'), ('phones'), ('laptops'), ('accessories')
ON CONFLICT (name) DO NOTHING;

-- Step 5: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Step 6: Create database policies
CREATE POLICY "products_select_policy" ON products FOR SELECT TO public USING (true);
CREATE POLICY "products_insert_policy" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_update_policy" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products_delete_policy" ON products FOR DELETE TO authenticated USING (true);

CREATE POLICY "categories_select_policy" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "categories_insert_policy" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories_update_policy" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categories_delete_policy" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "ads_select_policy" ON ads FOR SELECT TO public USING (true);
CREATE POLICY "ads_insert_policy" ON ads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ads_update_policy" ON ads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ads_delete_policy" ON ads FOR DELETE TO authenticated USING (true);

-- ==========================================
-- PART 2: STORAGE SETUP
-- ==========================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public to read product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Create storage policies for products bucket
CREATE POLICY "Public can read product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'products');

-- ==========================================
-- PART 3: VERIFICATION
-- ==========================================

-- Check database tables and RLS
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename;

-- Check database policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "Command",
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename, cmd;

-- Check storage policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "Command",
  roles
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%product%'
ORDER BY cmd;

-- ==========================================
-- EXPECTED RESULTS:
-- ==========================================
-- Database:
--   - 3 tables with RLS enabled
--   - 12 policies (4 per table)
--
-- Storage:
--   - 4 policies for products bucket
--   - SELECT (public), INSERT/UPDATE/DELETE (authenticated)
--
-- If you see all these, setup is complete!
-- ==========================================

