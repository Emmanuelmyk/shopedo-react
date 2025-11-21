# ⚡ Quick Setup - Multi-Seller System

## 🎯 What This Does

Converts your admin dashboard into a **multi-seller marketplace** where:
- ✅ Each seller has their own dashboard
- ✅ Sellers can only see/edit their own products
- ✅ Public marketplace shows all products
- ✅ Database-level security prevents unauthorized access

---

## 🚀 Setup (5 Minutes)

### Step 1: Run SQL Script (2 min)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Copy **entire contents** of `MULTI_SELLER_DATABASE_SETUP.sql`
4. Click **Run**
5. Wait for success message

**Expected Output:**
```
✅ seller_id column added
✅ 4 RLS policies created for products
✅ Storage policies updated
✅ Verification queries show correct setup
```

---

### Step 2: Handle Existing Products (1 min)

If you have existing products, assign them to a seller:

```sql
-- Get your seller UUID (from auth.users)
SELECT id, email FROM auth.users;

-- Assign all existing products to that seller
UPDATE products 
SET seller_id = 'YOUR_UUID_HERE'
WHERE seller_id IS NULL;
```

---

### Step 3: Restart Dev Server (1 min)

```bash
# Stop server
Ctrl+C

# Restart
npm run dev
```

---

### Step 4: Test (1 min)

1. **Log in** to admin dashboard
2. **Add a product** → Should work
3. **View products list** → Should see only your products
4. **Check console** → Should see:
   ```
   👤 Fetching products for seller: your@email.com
   🆔 Seller ID: abc-123-def
   ✅ Found X products for this seller
   ```

---

## ✅ Verification Checklist

Run this SQL to verify setup:

```sql
-- 1. Check seller_id column exists
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'seller_id';

-- 2. Check RLS policies (should see 4)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd;

-- 3. Check products have seller_id
SELECT id, name, seller_id 
FROM products 
LIMIT 5;
```

**Expected:**
- ✅ `seller_id` column exists (UUID type)
- ✅ 4 policies: SELECT, INSERT, UPDATE, DELETE
- ✅ Products have valid `seller_id` values

---

## 🧪 Test Scenarios

### Test 1: Create Multiple Sellers

```bash
# In Supabase Dashboard → Authentication → Users
1. Create Seller A (seller-a@test.com)
2. Create Seller B (seller-b@test.com)
```

### Test 2: Add Products as Different Sellers

```
1. Log in as Seller A
2. Add Product X
3. Log out
4. Log in as Seller B
5. Add Product Y
```

### Test 3: Verify Isolation

```
✅ Seller A dashboard shows only Product X
✅ Seller B dashboard shows only Product Y
✅ Public marketplace shows both X and Y
```

### Test 4: Try to Hack (Should Fail)

```
1. Log in as Seller A
2. Note Product Y's ID (from database or URL)
3. Try to navigate to /admin/products/edit/Y_ID
❌ Should be redirected to products list
❌ Console shows: "Unauthorized: Product belongs to another seller"
```

---

## 📊 What Changed

### Database

| Change | Description |
|--------|-------------|
| `products.seller_id` | New column linking to auth.users |
| RLS Policies | 4 policies enforcing seller isolation |
| Index | Fast queries on seller_id |

### Code

| File | Change |
|------|--------|
| `AddProduct.jsx` | Auto-sets `seller_id` to current user |
| `ProductsList.jsx` | Filters by `seller_id` |
| `Dashboard.jsx` | Shows seller-specific stats |
| `EditProduct.jsx` | Verifies ownership before edit |

---

## 🔐 Security Features

### Database Level (RLS)

```sql
-- Sellers can only insert their own products
CREATE POLICY "products_seller_insert_policy"
ON products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Sellers can only update their own products
CREATE POLICY "products_seller_update_policy"
ON products FOR UPDATE TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);
```

**Key Point:** Even if someone bypasses the frontend, the database will reject unauthorized operations.

### Application Level

```javascript
// AddProduct.jsx - Auto-set seller_id
seller_id: session.user.id

// ProductsList.jsx - Filter by seller
.eq("seller_id", session.user.id)

// EditProduct.jsx - Verify ownership
if (data.seller_id !== session.user.id) {
  navigate("/admin/products");
  return;
}
```

---

## 🎯 Key Concepts

### What is `auth.uid()`?

- Returns the UUID of the currently authenticated user
- Extracted from the JWT token sent with each request
- Used in RLS policies to enforce ownership

### What is `seller_id`?

- Foreign key to `auth.users(id)`
- Links each product to its owner
- Used to filter queries and enforce permissions

### How RLS Works

```
User Request → Supabase → Check JWT → Extract user ID → Apply RLS Policy → Return filtered data
```

Example:
```sql
-- User abc-123 requests products
SELECT * FROM products;

-- RLS automatically adds WHERE clause:
SELECT * FROM products WHERE seller_id = 'abc-123';
```

---

## 🆘 Common Issues

### Issue: "column seller_id does not exist"

**Solution:** Run the SQL script again

### Issue: "new row violates row-level security policy"

**Solution:** Check that `session.user.id` is being set in AddProduct.jsx

### Issue: Seller sees all products

**Solution:** Check ProductsList.jsx has `.eq("seller_id", session.user.id)`

### Issue: Can't edit any products

**Solution:** Check products have correct `seller_id`:
```sql
SELECT id, name, seller_id FROM products;
```

---

## 📈 Next Steps

After basic setup works:

1. **Add seller profiles** (business name, phone, etc.)
2. **Add verification system** (verify sellers before they can sell)
3. **Add admin role** (super-admin can see all products)
4. **Add analytics** (sales tracking, revenue reports)
5. **Add notifications** (email when product is sold)

---

## 📚 Files Created

| File | Purpose |
|------|---------|
| `MULTI_SELLER_DATABASE_SETUP.sql` | Complete database setup |
| `MULTI_SELLER_IMPLEMENTATION_GUIDE.md` | Detailed documentation |
| `QUICK_SETUP_MULTI_SELLER.md` | This file (quick reference) |

---

## ✅ Success Criteria

Your system is working correctly when:

- ✅ Each seller sees only their own products in dashboard
- ✅ Sellers can add products (auto-assigned to them)
- ✅ Sellers can edit only their own products
- ✅ Sellers can delete only their own products
- ✅ Public marketplace shows all products
- ✅ Console logs show seller ID and authorization checks
- ✅ Attempting to edit another seller's product fails gracefully

---

**Setup complete! You now have a secure multi-seller marketplace.** 🎉

**Questions? Check `MULTI_SELLER_IMPLEMENTATION_GUIDE.md` for detailed explanations.**

