# 🔧 Fix RLS Error - Complete Instructions

## Problem
Getting error: **"new row violates row-level security policy"** when trying to upload products.

## Root Cause
Row Level Security (RLS) policies are either missing, incorrectly configured, or the authentication session is not being passed properly to Supabase.

---

## ✅ SOLUTION - Follow These Steps Exactly

### Step 1: Run the Complete Database Setup

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Copy and paste** the entire contents of `database_setup_complete.sql`
4. **Click "Run"**
5. **Verify** you see success messages and the verification queries at the end show:
   - 3 tables with RLS enabled
   - 12 total policies (4 for each table)

### Step 2: Restart Your Development Server

1. **Stop the dev server**: Press `Ctrl+C` in your terminal
2. **Clear browser cache**: 
   - Chrome/Edge: `Ctrl+Shift+Delete` → Clear cached images and files
   - Or just open an **Incognito/Private window**
3. **Restart dev server**: `npm run dev`

### Step 3: Log Out and Log Back In

1. **Go to**: http://localhost:3000/admin/login
2. **If already logged in**, click Logout first
3. **Log in again** with your admin credentials
4. **Check browser console** (F12) - you should see:
   ```
   ✅ Supabase client initialized
   📍 URL: https://ftrxctaliloloiherqom.supabase.co
   🔑 Key type: anon (correct)
   ✅ User authenticated: your-email@example.com
   🔑 Access token present: true
   ```

### Step 4: Test Product Upload

1. **Go to**: http://localhost:3000/admin/products/add
2. **Fill in the form**:
   - Product Name: Test Product
   - Price: 1000
   - Category: Select any
   - Condition: Brand New
   - Location: GRA
   - Seller Name: Test Seller
   - Description: (optional)
   - Image: (optional)
3. **Click "Add Product"**
4. **Watch the browser console** (F12) - you should see:
   ```
   🔐 Session check:
     - Session exists: true
     - User: your-email@example.com
     - Access token: Present
   📤 Inserting product with data: {...}
   🔑 Using session from user: your-email@example.com
   ✅ Product inserted successfully!
   ```

---

## 🔍 If Still Not Working - Diagnostics

### Run Diagnostic SQL

1. **Open Supabase Dashboard** → SQL Editor
2. **Run** `database_diagnostic.sql`
3. **Check the results**:
   - All 3 tables should have `RLS Enabled = true`
   - Should see 12 policies total
   - Products table should have `seller_name` column

### Check Browser Console

Open browser console (F12) and look for:
- ❌ Any red errors
- 🔑 Session information
- 📤 Insert attempt logs

### Common Issues

**Issue 1: "Session exists: false"**
- **Solution**: Log out and log back in
- Clear browser cache/localStorage
- Make sure you're using the correct login credentials

**Issue 2: "Key type: Check key type" (not showing "anon")**
- **Solution**: Your `.env` file still has the wrong key
- Go to Supabase Dashboard → Settings → API
- Copy the **anon/public** key (NOT service_role)
- Update `.env` file
- Restart dev server

**Issue 3: Policies not showing in diagnostic**
- **Solution**: Re-run `database_setup_complete.sql`
- Make sure you ran the ENTIRE script
- Check for any SQL errors in Supabase

**Issue 4: "column seller_name does not exist"**
- **Solution**: Your table structure is outdated
- Run `database_setup_complete.sql` which will recreate tables
- Note: This will delete existing data

---

## 📋 What Was Fixed

### Code Changes:
1. ✅ Updated `src/utils/supabaseClient.js` - Added proper auth configuration
2. ✅ Updated `src/pages/AdminDashboard/AddProduct.jsx` - Added session verification
3. ✅ Created `src/utils/locations.js` - Valid location list
4. ✅ Fixed condition dropdown values to match database constraints
5. ✅ Changed location from text input to dropdown
6. ✅ Added comprehensive error logging

### Database Changes:
1. ✅ Created proper RLS policies for all tables
2. ✅ Ensured `seller_name` column exists
3. ✅ Added proper constraints for condition and location
4. ✅ Configured policies to allow authenticated users to INSERT

---

## 🎯 Expected Behavior After Fix

- ✅ Admin can log in successfully
- ✅ Admin can view products list
- ✅ Admin can add new products with images
- ✅ Admin can edit existing products
- ✅ Admin can delete products
- ✅ Public users can view products (but not modify)
- ✅ Unauthenticated users cannot add/edit/delete products

---

## 🆘 Still Having Issues?

If you're still getting the RLS error after following all steps:

1. **Share the browser console output** (F12 → Console tab)
2. **Share the result** of running `database_diagnostic.sql`
3. **Verify** your `.env` file has the anon key (not service_role)
4. **Try** the test page: http://localhost:3000/admin/test-auth

The test page will show exactly what's wrong with your setup.

