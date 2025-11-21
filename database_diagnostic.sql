-- ==========================================
-- DIAGNOSTIC SCRIPT
-- Run this to check your current database setup
-- ==========================================

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'categories', 'ads');

-- 2. Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename;

-- 3. Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as "Command",
  qual as "USING expression",
  with_check as "WITH CHECK expression"
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('products', 'categories', 'ads')
ORDER BY tablename, cmd;

-- 4. Check table structure for products
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'products'
ORDER BY ordinal_position;

-- 5. Check constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('products', 'categories', 'ads')
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Test insert as authenticated user (this should work if you're logged in)
-- Uncomment to test:
-- INSERT INTO products (name, price, category_id, condition, location, seller_name)
-- VALUES ('Test Product', 100, 1, 'Brand New', 'GRA', 'Test Seller')
-- RETURNING *;

-- 7. Check current user role
SELECT current_user, current_role;

-- 8. Check auth.users (if you have access)
-- This will show if there are any authenticated users
-- SELECT id, email, created_at FROM auth.users LIMIT 5;

