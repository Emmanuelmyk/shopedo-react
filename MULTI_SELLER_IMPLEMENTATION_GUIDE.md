# 🏪 Multi-Seller System Implementation Guide

## Overview

This system allows multiple sellers to have individual dashboards where they can only view and manage their own products. Each seller is isolated from other sellers' data through Row Level Security (RLS) policies.

---

## 🔐 Security Architecture

### Database Level Security

**Row Level Security (RLS)** ensures that:
- ✅ Sellers can only INSERT products with their own `seller_id`
- ✅ Sellers can only UPDATE their own products
- ✅ Sellers can only DELETE their own products
- ✅ Sellers can only SELECT their own products in the dashboard
- ✅ Public users can view ALL products (marketplace)

### Application Level Security

**Frontend checks** ensure that:
- ✅ Product forms automatically set `seller_id` to current user
- ✅ Edit page verifies ownership before loading
- ✅ Dashboard only fetches current seller's products
- ✅ Product list only shows current seller's products

---

## 📊 Database Schema Changes

### Products Table

```sql
ALTER TABLE products 
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Key Points:**
- `seller_id` links to Supabase Auth users
- Foreign key ensures referential integrity
- `ON DELETE CASCADE` removes products if seller account is deleted
- Indexed for fast queries

### Seller Profiles Table (Optional)

```sql
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  business_name TEXT,
  phone TEXT,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 RLS Policies

### Products Policies

| Policy | Role | Action | Condition |
|--------|------|--------|-----------|
| `products_public_select_policy` | public | SELECT | All products (marketplace) |
| `products_seller_insert_policy` | authenticated | INSERT | `auth.uid() = seller_id` |
| `products_seller_update_policy` | authenticated | UPDATE | `auth.uid() = seller_id` |
| `products_seller_delete_policy` | authenticated | DELETE | `auth.uid() = seller_id` |

### How It Works

```sql
-- Example: Seller can only update their own products
CREATE POLICY "products_seller_update_policy"
ON products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)      -- Can only update if they own it
WITH CHECK (auth.uid() = seller_id); -- Can't change seller_id to someone else
```

**`auth.uid()`** returns the UUID of the currently authenticated user from the JWT token.

---

## 💻 Code Changes

### 1. AddProduct.jsx

**Automatically sets seller_id:**

```javascript
const productData = {
  name: formData.name.trim(),
  price: parseFloat(formData.price),
  seller_id: session.user.id, // 🔐 Links product to current seller
  // ... other fields
};
```

### 2. ProductsList.jsx

**Only fetches seller's products:**

```javascript
const { data, error } = await supabase
  .from("products")
  .select("*")
  .eq("seller_id", session.user.id) // 🔐 Filter by seller
  .order("created_at", { ascending: false });
```

### 3. Dashboard.jsx

**Shows seller-specific stats:**

```javascript
const { count: productCount } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true })
  .eq("seller_id", session.user.id); // 🔐 Count only seller's products
```

### 4. EditProduct.jsx

**Verifies ownership before allowing edit:**

```javascript
if (data.seller_id !== session.user.id) {
  console.error("❌ Unauthorized: Product belongs to another seller");
  navigate("/admin/products");
  return;
}
```

---

## 🚀 Setup Instructions

### Step 1: Run the SQL Script

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste **`MULTI_SELLER_DATABASE_SETUP.sql`**
3. Click **Run**
4. Verify the output shows:
   - `seller_id` column added to products
   - 4 RLS policies for products
   - Storage policies updated

### Step 2: Migrate Existing Data (If Needed)

If you have existing products without `seller_id`:

```sql
-- Option 1: Assign all to a specific seller
UPDATE products 
SET seller_id = 'YOUR_SELLER_UUID_HERE'
WHERE seller_id IS NULL;

-- Option 2: Delete products without seller
DELETE FROM products WHERE seller_id IS NULL;
```

### Step 3: Restart Development Server

```bash
Ctrl+C
npm run dev
```

### Step 4: Test the System

1. **Log in as Seller A**
2. **Add a product** → Should succeed
3. **View products list** → Should only see Seller A's products
4. **Log out and log in as Seller B**
5. **View products list** → Should only see Seller B's products
6. **Try to edit Seller A's product** (by URL manipulation) → Should be blocked

---

## 🧪 Testing Scenarios

### Test 1: Product Isolation

```
✅ Seller A adds Product X
✅ Seller B adds Product Y
✅ Seller A sees only Product X in dashboard
✅ Seller B sees only Product Y in dashboard
✅ Public marketplace shows both Product X and Y
```

### Test 2: Edit Protection

```
✅ Seller A tries to edit Product X → Success
❌ Seller A tries to edit Product Y (Seller B's) → Blocked by RLS
❌ Seller A manually navigates to /admin/products/edit/Y_ID → Redirected
```

### Test 3: Delete Protection

```
✅ Seller A deletes Product X → Success
❌ Seller A tries to delete Product Y → Blocked by RLS
```

---

## 🔍 How to Verify It's Working

### Check Console Logs

When adding a product:
```
👤 Seller ID: abc-123-def-456
📤 Inserting product with data: { seller_id: "abc-123-def-456", ... }
✅ Product inserted successfully!
```

When viewing products:
```
👤 Fetching products for seller: seller@example.com
🆔 Seller ID: abc-123-def-456
✅ Found 5 products for this seller
```

When editing a product:
```
✅ Authorized to edit product: Product Name
```

Or if unauthorized:
```
❌ Unauthorized: Product belongs to another seller
```

### Check Database

```sql
-- View products with their sellers
SELECT id, name, seller_id, seller_name 
FROM products 
ORDER BY created_at DESC;

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';
```

---

## 🛡️ Security Benefits

1. **Database-Level Protection**: Even if frontend is bypassed, RLS prevents unauthorized access
2. **Automatic Enforcement**: No need to remember to add filters in every query
3. **JWT-Based**: Uses Supabase's built-in authentication
4. **Audit Trail**: `seller_id` provides clear ownership tracking
5. **Scalable**: Works for 10 sellers or 10,000 sellers

---

## 📈 Future Enhancements

### 1. Admin Role

Create a super-admin who can see all products:

```sql
CREATE POLICY "admin_can_see_all_products"
ON products FOR SELECT TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.uid() = seller_id
);
```

### 2. Seller Verification

Add verification status:

```sql
ALTER TABLE seller_profiles 
ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Only verified sellers can add products
CREATE POLICY "only_verified_sellers_can_add"
ON products FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seller_profiles 
    WHERE id = auth.uid() AND is_verified = true
  )
);
```

### 3. Product Approval Workflow

Add approval status:

```sql
ALTER TABLE products 
ADD COLUMN status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Only show approved products to public
CREATE POLICY "public_sees_approved_only"
ON products FOR SELECT TO public
USING (status = 'approved');
```

---

## ✅ Checklist

Before going live:

- [ ] Run `MULTI_SELLER_DATABASE_SETUP.sql`
- [ ] Verify RLS policies exist (4 for products)
- [ ] Test with multiple seller accounts
- [ ] Verify sellers can't see each other's products
- [ ] Verify sellers can't edit each other's products
- [ ] Verify public marketplace shows all products
- [ ] Check console logs for authorization messages
- [ ] Test edge cases (URL manipulation, API calls)

---

## 🆘 Troubleshooting

### Issue: "new row violates row-level security policy"

**Cause**: `seller_id` doesn't match authenticated user

**Solution**: Check that `session.user.id` is being set correctly in AddProduct.jsx

### Issue: Seller sees no products

**Cause**: Products have wrong `seller_id` or no `seller_id`

**Solution**: 
```sql
-- Check products
SELECT id, name, seller_id FROM products;

-- Update if needed
UPDATE products SET seller_id = 'correct-uuid' WHERE seller_id IS NULL;
```

### Issue: Seller can edit other sellers' products

**Cause**: RLS policies not applied

**Solution**: Re-run the SQL script and verify policies exist

---

## 📚 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Your multi-seller system is now secure and scalable!** 🎉

