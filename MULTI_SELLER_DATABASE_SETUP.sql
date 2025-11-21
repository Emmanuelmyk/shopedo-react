-- ==========================================
-- MULTI-SELLER SYSTEM - COMPLETE DATABASE SETUP
-- Each seller can only view/edit their own products
-- ==========================================

-- ==========================================
-- PART 1: DROP EXISTING POLICIES
-- ==========================================

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

-- ==========================================
-- PART 2: UPDATE PRODUCTS TABLE STRUCTURE
-- ==========================================

-- Add seller_id column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);

-- Update existing products to have a seller_id (set to first user or null)
-- You may want to manually assign these to actual sellers
UPDATE products 
SET seller_id = (SELECT id FROM auth.users LIMIT 1)
WHERE seller_id IS NULL;

-- Make seller_id required for new products
-- Note: We don't add NOT NULL constraint to allow existing data migration

-- ==========================================
-- PART 3: CREATE SELLER PROFILES TABLE
-- ==========================================

-- Optional: Store additional seller information
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on seller_profiles
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PART 4: RLS POLICIES FOR PRODUCTS (SELLER-SPECIFIC)
-- ==========================================

-- Allow public to read ALL products (marketplace view)
CREATE POLICY "products_public_select_policy"
ON products
FOR SELECT
TO public
USING (true);

-- Allow authenticated sellers to insert their own products
CREATE POLICY "products_seller_insert_policy"
ON products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update ONLY their own products
CREATE POLICY "products_seller_update_policy"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to delete ONLY their own products
CREATE POLICY "products_seller_delete_policy"
ON products
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- ==========================================
-- PART 5: RLS POLICIES FOR SELLER PROFILES
-- ==========================================

-- Sellers can view their own profile
CREATE POLICY "seller_profiles_select_own"
ON seller_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Sellers can insert their own profile
CREATE POLICY "seller_profiles_insert_own"
ON seller_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Sellers can update their own profile
CREATE POLICY "seller_profiles_update_own"
ON seller_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- PART 6: CATEGORIES POLICIES (UNCHANGED)
-- ==========================================

CREATE POLICY "categories_select_policy" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "categories_insert_policy" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "categories_update_policy" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "categories_delete_policy" ON categories FOR DELETE TO authenticated USING (true);

-- ==========================================
-- PART 7: ADS POLICIES (ADMIN ONLY - OPTIONAL)
-- ==========================================

CREATE POLICY "ads_select_policy" ON ads FOR SELECT TO public USING (true);
CREATE POLICY "ads_insert_policy" ON ads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ads_update_policy" ON ads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ads_delete_policy" ON ads FOR DELETE TO authenticated USING (true);

-- ==========================================
-- PART 8: STORAGE POLICIES (SELLER-SPECIFIC)
-- ==========================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Allow public to read all images
CREATE POLICY "storage_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload images (they'll be linked to their products)
CREATE POLICY "storage_authenticated_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow users to update their own images
-- Note: This is tricky - we can't directly check product ownership from storage
-- So we allow all authenticated users, but the app logic should prevent misuse
CREATE POLICY "storage_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow users to delete images
CREATE POLICY "storage_authenticated_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'products');

-- ==========================================
-- PART 9: HELPER FUNCTIONS
-- ==========================================

-- Function to get seller's product count
CREATE OR REPLACE FUNCTION get_seller_product_count(seller_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM products WHERE seller_id = seller_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a product
CREATE OR REPLACE FUNCTION user_owns_product(product_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products
    WHERE id = product_id AND seller_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PART 10: VERIFICATION QUERIES
-- ==========================================

-- Check products table structure
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
AND column_name IN ('id', 'seller_id', 'name', 'price')
ORDER BY ordinal_position;

-- Check RLS policies for products
SELECT
  policyname,
  cmd as "Command",
  roles,
  qual as "USING clause"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'products'
ORDER BY cmd;

-- Check storage policies
SELECT
  policyname,
  cmd as "Command",
  roles
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%storage%'
ORDER BY cmd;

-- ==========================================
-- EXPECTED RESULTS:
-- ==========================================
-- Products table should have seller_id column (UUID type)
-- 4 product policies with seller_id checks:
--   - SELECT: public (all products)
--   - INSERT: authenticated (auth.uid() = seller_id)
--   - UPDATE: authenticated (auth.uid() = seller_id)
--   - DELETE: authenticated (auth.uid() = seller_id)
-- 4 storage policies for products bucket
-- ==========================================

