# Supabase Connection Setup Guide

## Quick Setup Steps

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Create Environment File

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.local.example .env.local

# Then edit it with your actual credentials
```

Or create it manually with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-key-here  # Optional
```

### 3. Run Database Migrations

You need to apply these migrations to your Supabase database:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Run each migration file in order:

   **Migration 1: Transactions Table** (if not exists)
   - Open `supabase/migrations/20240103_transactions.sql`
   - Copy and paste into SQL Editor
   - Click "Run"

   **Migration 2: Listings Schema Fix** (if needed)
   - Open `supabase/migrations/20240104_listings_schema_fix.sql`
   - Copy and paste into SQL Editor
   - Click "Run"

#### Option B: Verify Existing Schema

Run the verification queries from `scripts/verify-db-schema.sql` in the SQL Editor to check what's already there.

### 4. Test the Connection

```bash
# Test with the simple script (no extra dependencies needed)
node scripts/test-connection-simple.js
```

This will:
- ✅ Check environment variables are set
- ✅ Test database connection
- ✅ Verify required tables exist
- ✅ Check RLS policies

### 5. Start the Development Server

```bash
npm run dev
```

The app will:
- ✅ Load environment variables from `.env.local`
- ✅ Connect to Supabase automatically
- ✅ Fail fast with clear errors if something is wrong

---

## Troubleshooting

### "Missing required environment variable"

**Solution**: Make sure `.env.local` exists and has the correct variable names:
- `NEXT_PUBLIC_SUPABASE_URL` (not `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)

### "Table does not exist"

**Solution**: Run the migrations in Supabase SQL Editor:
- `20240103_transactions.sql` - Creates transactions table
- `20240104_listings_schema_fix.sql` - Adds missing columns

### "Permission denied" or RLS errors

**This is expected!** RLS (Row Level Security) is working correctly. The test script will show this as a success if it can connect but can't read without auth.

### Connection timeout or network errors

**Solution**: 
- Verify your Supabase project is active
- Check your internet connection
- Verify the URL is correct (should end with `.supabase.co`)

---

## Verification Checklist

After setup, verify:

- [ ] `.env.local` file exists with correct credentials
- [ ] Connection test passes: `node scripts/test-connection-simple.js`
- [ ] All required tables exist (profiles, listings, contact_requests, transactions)
- [ ] Dev server starts without errors: `npm run dev`
- [ ] Can access the app in browser
- [ ] No console errors about Supabase connection

---

## Next Steps After Connection Works

1. ✅ Test authentication (signup/login)
2. ✅ Test creating a listing
3. ✅ Test browsing listings
4. ✅ Test contact requests
5. ✅ Test escrow transactions

---

*Once the connection is verified, you're ready to test all the features!*
