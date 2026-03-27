-- ================================================================
-- EDOFINDS DATABASE SCHEMA
-- Run this in the Supabase SQL Editor.
-- Safe to run on an existing database — uses IF NOT EXISTS and
-- ADD COLUMN IF NOT EXISTS throughout. All destructive changes
-- (DROP POLICY, DROP CONSTRAINT) target only items created by
-- previous versions of this script.
-- ================================================================


-- ================================================================
-- SECTION 1: PRODUCTS
-- ================================================================

-- Ensure every column the app writes or reads exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seller_name TEXT,
  ADD COLUMN IF NOT EXISTS img_path    TEXT,
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'item',
  ADD COLUMN IF NOT EXISTS metadata   JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT NOW();

-- Fix listing_type constraint to include 'service'
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_listing_type_check;
ALTER TABLE products
  ADD CONSTRAINT products_listing_type_check
  CHECK (listing_type IN ('item', 'house', 'job', 'event', 'service'));

-- Remove the old fragile constraints (condition/location are
-- validated at the application layer instead)
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_condition;
ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_location;

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_seller_id    ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_listing_type ON products (listing_type);
CREATE INDEX IF NOT EXISTS idx_products_category_id  ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_location     ON products (location);
CREATE INDEX IF NOT EXISTS idx_products_created_at   ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_metadata     ON products USING GIN (metadata);

-- Full-text search index on name + description
CREATE INDEX IF NOT EXISTS idx_products_search
  ON products USING GIN (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,''))
  );

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read products
DROP POLICY IF EXISTS "products_read_policy" ON products;
CREATE POLICY "products_read_policy"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated sellers can insert their own products
DROP POLICY IF EXISTS "products_insert_policy" ON products;
CREATE POLICY "products_insert_policy"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can only update their own products
DROP POLICY IF EXISTS "products_update_policy"   ON products;
DROP POLICY IF EXISTS "products_seller_update"   ON products;
CREATE POLICY "products_seller_update"
  ON products FOR UPDATE
  TO authenticated
  USING     (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can only delete their own products
DROP POLICY IF EXISTS "products_delete_policy"  ON products;
DROP POLICY IF EXISTS "products_seller_delete"  ON products;
CREATE POLICY "products_seller_delete"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- ── Migrate legacy description-embedded listings ─────────────
-- Converts the old "Listing Type: X" text hack into the proper
-- listing_type column. Safe to re-run (WHERE listing_type='item'
-- prevents double-updates).
UPDATE products SET listing_type = 'house'
  WHERE description ILIKE '%Listing Type: House%'   AND listing_type = 'item';

UPDATE products SET listing_type = 'job'
  WHERE description ILIKE '%Listing Type: Job%'     AND listing_type = 'item';

UPDATE products SET listing_type = 'event'
  WHERE description ILIKE '%Listing Type: Event%'   AND listing_type = 'item';

UPDATE products SET listing_type = 'service'
  WHERE description ILIKE '%Listing Type: Service%' AND listing_type = 'item';


-- ================================================================
-- SECTION 2: USER_SUBSCRIPTIONS
-- ================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan         TEXT        NOT NULL DEFAULT 'free',
  status       TEXT        NOT NULL DEFAULT 'active',
  posts_used   INTEGER     NOT NULL DEFAULT 0,
  posts_limit  INTEGER     NOT NULL DEFAULT 3,  -- -1 = unlimited (Premium)
  paystack_ref TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- If the table already existed, add any missing columns
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS plan         TEXT        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS status       TEXT        NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS posts_used   INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts_limit  INTEGER     NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS paystack_ref TEXT,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW();

-- Value constraints
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_plan_check;
ALTER TABLE user_subscriptions
  ADD CONSTRAINT user_subscriptions_plan_check
  CHECK (plan IN ('free', 'basic', 'pro', 'premium'));

ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_status_check;
ALTER TABLE user_subscriptions
  ADD CONSTRAINT user_subscriptions_status_check
  CHECK (status IN ('active', 'expired', 'cancelled'));

-- One active subscription per user (allows historical cancelled rows)
ALTER TABLE user_subscriptions
  DROP CONSTRAINT IF EXISTS unique_active_subscription;
DROP INDEX IF EXISTS unique_active_user_subscription;
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_subscription
  ON user_subscriptions (user_id)
  WHERE status = 'active';

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON user_subscriptions (user_id);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_subscriptions_policy" ON user_subscriptions;
CREATE POLICY "user_subscriptions_policy"
  ON user_subscriptions FOR ALL
  TO authenticated
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ================================================================
-- SECTION 3: POST_PAYMENTS
-- ================================================================

CREATE TABLE IF NOT EXISTS post_payments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_type TEXT        NOT NULL,
  amount       INTEGER     NOT NULL,          -- in kobo  (₦1 = 100 kobo)
  status       TEXT        NOT NULL DEFAULT 'pending',
  paystack_ref TEXT        UNIQUE,
  product_id   BIGINT      REFERENCES products(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_payments DROP CONSTRAINT IF EXISTS post_payments_listing_type_check;
ALTER TABLE post_payments
  ADD CONSTRAINT post_payments_listing_type_check
  CHECK (listing_type IN ('service', 'event', 'job'));

ALTER TABLE post_payments DROP CONSTRAINT IF EXISTS post_payments_status_check;
ALTER TABLE post_payments
  ADD CONSTRAINT post_payments_status_check
  CHECK (status IN ('pending', 'paid', 'failed'));

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_payments_user_id
  ON post_payments (user_id);
CREATE INDEX IF NOT EXISTS idx_post_payments_paystack_ref
  ON post_payments (paystack_ref);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE post_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_payments_policy" ON post_payments;
CREATE POLICY "post_payments_policy"
  ON post_payments FOR ALL
  TO authenticated
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ================================================================
-- SECTION 4: ADS
-- ================================================================

CREATE TABLE IF NOT EXISTS ads (
  id          SERIAL      PRIMARY KEY,
  image_path  TEXT        NOT NULL,
  link        TEXT,
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Public read (only active ads)
DROP POLICY IF EXISTS "ads_read_policy" ON ads;
CREATE POLICY "ads_read_policy"
  ON ads FOR SELECT
  TO anon, authenticated
  USING (is_active = true);


-- ================================================================
-- SECTION 5: STORAGE BUCKETS
-- ================================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('products', 'products', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('ads', 'ads', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('profiles', 'profiles', true)
  ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS ──────────────────────────────────────────────

-- Public read for product, ad, and profile images
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('products', 'ads', 'profiles'));

-- Authenticated sellers can upload product images
DROP POLICY IF EXISTS "products_storage_upload" ON storage.objects;
CREATE POLICY "products_storage_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Authenticated users can delete from the products bucket
-- (app-level ownership check handles who can delete which file)
DROP POLICY IF EXISTS "products_storage_delete" ON storage.objects;
CREATE POLICY "products_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');


-- ================================================================
-- SECTION 6: FUNCTIONS & TRIGGERS
-- ================================================================

-- ── updated_at auto-stamp ─────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── Auto-create free subscription on signup ───────────────────
-- Every new seller gets a free plan row immediately on signup,
-- so the billing page and post-limit checks never start from null.
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_subscriptions
    (user_id, plan, status, posts_used, posts_limit)
  VALUES
    (NEW.id, 'free', 'active', 0, 3)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_subscription();


-- ── can_add_product(user_id, listing_type) → boolean ─────────
-- Returns TRUE if the user is allowed to post.
-- Used by both the frontend and as a server-side helper.
-- Pay-per-post types (service/event/job) always return TRUE
-- because they are gated by payment, not by subscription limit.
CREATE OR REPLACE FUNCTION can_add_product(
  p_user_id      UUID,
  p_listing_type TEXT
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_sub RECORD;
BEGIN
  -- Pay-per-post listing types bypass the subscription limit
  IF p_listing_type IN ('service', 'event', 'job') THEN
    RETURN TRUE;
  END IF;

  -- Fetch the user's active subscription
  SELECT * INTO v_sub
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status  = 'active';

  -- No row yet → treat as free plan (limit: 3)
  IF NOT FOUND THEN
    RETURN (
      SELECT COUNT(*) < 3
      FROM products
      WHERE seller_id = p_user_id
    );
  END IF;

  -- Premium: posts_limit = -1 means unlimited
  IF v_sub.posts_limit = -1 THEN
    RETURN TRUE;
  END IF;

  RETURN v_sub.posts_used < v_sub.posts_limit;
END;
$$;


-- ================================================================
-- SECTION 7: BACKFILL EXISTING DATA
-- ================================================================

-- Give every existing seller a free subscription row if they
-- don't have one yet.  posts_used is seeded from their actual
-- product count so the limit is accurate from day 1.
INSERT INTO user_subscriptions (user_id, plan, status, posts_used, posts_limit)
SELECT
  p.seller_id,
  'free',
  'active',
  COUNT(p.id)::INTEGER,
  3
FROM products p
WHERE p.seller_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM user_subscriptions us
    WHERE us.user_id = p.seller_id
      AND us.status  = 'active'
  )
GROUP BY p.seller_id
ON CONFLICT DO NOTHING;


-- ================================================================
-- SECTION 8: VERIFY (read-only checks, safe to run any time)
-- ================================================================

-- Listing type breakdown
SELECT listing_type, COUNT(*) AS total
FROM products
GROUP BY listing_type
ORDER BY listing_type;

-- Subscription plan breakdown
SELECT plan, status, COUNT(*) AS total
FROM user_subscriptions
GROUP BY plan, status
ORDER BY plan;

-- Products columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- user_subscriptions columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;
