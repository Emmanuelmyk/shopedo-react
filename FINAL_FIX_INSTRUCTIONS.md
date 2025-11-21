# 🔥 FINAL FIX - Storage RLS Error

## The Real Problem

The error is happening during **IMAGE UPLOAD to Supabase Storage**, not the database!

```
❌ Image upload failed: new row violates row-level security policy
```

This means your **storage bucket** doesn't have the correct RLS policies.

---

## ✅ COMPLETE SOLUTION (3 Steps)

### Step 1: Create Storage Bucket (If Not Exists)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/ftrxctaliloloiherqom
2. **Click**: Storage (left sidebar)
3. **Check if "products" bucket exists**
4. **If NOT**, click "New bucket":
   - Name: `products`
   - Public bucket: **YES** ✅ (Important!)
   - Click "Create bucket"

### Step 2: Run Complete SQL Setup

1. **Go to**: SQL Editor in Supabase Dashboard
2. **Copy the ENTIRE contents** of `COMPLETE_DATABASE_AND_STORAGE_SETUP.sql`
3. **Paste and Run**
4. **Check the verification results** at the bottom:
   - Should show 3 tables with RLS enabled
   - Should show 12 database policies
   - Should show 4 storage policies

### Step 3: Restart and Test

```bash
# Stop dev server
Ctrl+C

# Clear browser cache or use Incognito window

# Restart dev server
npm run dev

# Log out and log back in to admin panel

# Try uploading a product with an image
```

---

## 🔍 What the SQL Does

### Database Policies (12 total):
- ✅ Products: SELECT (public), INSERT/UPDATE/DELETE (authenticated)
- ✅ Categories: SELECT (public), INSERT/UPDATE/DELETE (authenticated)
- ✅ Ads: SELECT (public), INSERT/UPDATE/DELETE (authenticated)

### Storage Policies (4 total):
- ✅ **SELECT** - Allow public to read/download images
- ✅ **INSERT** - Allow authenticated users to upload images
- ✅ **UPDATE** - Allow authenticated users to update images
- ✅ **DELETE** - Allow authenticated users to delete images

---

## 📊 Expected Console Output After Fix

When you upload a product with an image, you should see:

```
🔐 Session check:
  - Session exists: true
  - User: your-email@example.com
  - Access token: Present
📸 Uploading image...
✅ Image uploaded: products/abc123.jpg
📤 Inserting product with data: {...}
🔑 Using session from user: your-email@example.com
✅ Product inserted successfully!
```

---

## 🚨 Common Issues

### Issue 1: "products bucket does not exist"
**Solution**: Create the bucket in Supabase Dashboard → Storage → New bucket

### Issue 2: Still getting RLS error on storage
**Solution**: 
1. Make sure bucket is **PUBLIC** (not private)
2. Re-run the SQL script
3. Check storage policies exist:
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE schemaname = 'storage' 
   AND tablename = 'objects';
   ```

### Issue 3: Image uploads but database insert fails
**Solution**: Run the database part of the SQL script again

### Issue 4: "Session exists: false"
**Solution**: 
1. Log out completely
2. Clear browser localStorage
3. Log back in
4. Try again

---

## 🎯 Why This Happens

Supabase has **TWO separate RLS systems**:

1. **Database RLS** - Controls access to tables (products, categories, ads)
2. **Storage RLS** - Controls access to file storage (images)

You need policies for **BOTH**!

Your previous setup only had database policies, so:
- ✅ Test page worked (no image upload)
- ❌ Add product form failed (tries to upload image first)

---

## 📝 Quick Checklist

Before testing, verify:

- [ ] Storage bucket "products" exists and is PUBLIC
- [ ] Ran `COMPLETE_DATABASE_AND_STORAGE_SETUP.sql`
- [ ] Saw 12 database policies in verification
- [ ] Saw 4 storage policies in verification
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Logged out and back in
- [ ] Using anon key (not service_role) in `.env`

---

## 🧪 Test Without Image First

If you want to isolate the issue:

1. **Try adding a product WITHOUT an image**
2. If that works → Storage RLS is the issue
3. If that fails → Database RLS is the issue

---

## 🆘 Still Not Working?

Run this diagnostic SQL:

```sql
-- Check storage policies
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- Check if products bucket exists
SELECT * FROM storage.buckets WHERE name = 'products';
```

Share the results and I'll help further!

---

## ✅ Success Criteria

After the fix, you should be able to:
- ✅ Upload products with images
- ✅ Upload products without images
- ✅ Edit products and change images
- ✅ Delete products (and their images)
- ✅ See images on the public marketplace

**Run the SQL now and test!** 🚀

