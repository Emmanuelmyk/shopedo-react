-- ==========================================
-- SUPABASE STORAGE SETUP FOR PRODUCTS BUCKET
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Create storage bucket (if not exists)
-- Note: You may need to create this in the Supabase Dashboard UI first
-- Go to Storage → Create bucket → Name: "products" → Public bucket: YES

-- Step 2: Drop existing storage policies
-- ==========================================
DROP POLICY IF EXISTS "Allow public to read product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;

-- Step 3: Create storage policies for products bucket
-- ==========================================

-- Allow public to read/download images from products bucket
CREATE POLICY "Allow public to read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload images to products bucket
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update images in products bucket
CREATE POLICY "Allow authenticated users to update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to delete images from products bucket
CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Step 4: Verify storage policies
-- ==========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%product%'
ORDER BY cmd;

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- You should see 4 policies for storage.objects:
-- - Allow public to read product images (SELECT)
-- - Allow authenticated users to upload product images (INSERT)
-- - Allow authenticated users to update product images (UPDATE)
-- - Allow authenticated users to delete product images (DELETE)
-- ==========================================

