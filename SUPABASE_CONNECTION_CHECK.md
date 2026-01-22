# Supabase Database Connection Check

## Current Status

✅ **Code is ready** - All fixes have been applied  
⚠️ **Environment variables needed** - Credentials must be set  
⚠️ **Missing migration** - Transactions table migration created

---

## Required Environment Variables

You need to set these environment variables for the app to work:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-key-here  # Optional
```

### Where to Set Them:

1. **Local Development**: Create a `.env.local` file in the project root
2. **Vercel**: Set in Vercel dashboard under Project Settings → Environment Variables
3. **System Environment**: Export in your shell profile

---

## Database Schema Verification

### Required Tables

The following tables must exist in your Supabase database:

1. ✅ `profiles` - User profiles
2. ✅ `listings` - Product listings
3. ✅ `contact_requests` - Buyer-seller contact requests
4. ✅ `conversations` - Chat conversations
5. ✅ `messages` - Chat messages
6. ✅ `reviews` - User reviews
7. ⚠️ `transactions` - **NEW** - Escrow transactions (migration created)

### Missing Migration Created

I've created a new migration file for the `transactions` table:
- **File**: `supabase/migrations/20240103_transactions.sql`

**You need to run this migration** on your Supabase database.

---

## How to Verify Connection

### Option 1: Run the Test Script

```bash
# Make sure environment variables are set
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"

# Install tsx if needed
npm install -D tsx

# Run the test
npx tsx scripts/test-supabase-connection.ts
```

### Option 2: Use Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the queries from `scripts/verify-db-schema.sql`

### Option 3: Quick Manual Check

1. Set your environment variables
2. Try to start the dev server:
   ```bash
   npm run dev
   ```
3. The app will fail fast with a clear error if env vars are missing
4. If env vars are set, check the browser console for connection errors

---

## Running the Transactions Migration

Since the `transactions` table was missing, you need to apply the new migration:

### Via Supabase Dashboard:

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/20240103_transactions.sql`
3. Paste and run it

### Via Supabase CLI (if you have it):

```bash
supabase db push
```

---

## Expected Behavior

Once environment variables are set and migrations are run:

✅ App starts without errors  
✅ Can connect to Supabase  
✅ All tables are accessible  
✅ RLS policies are active  
✅ Authentication works  
✅ Data persists correctly  

---

## Troubleshooting

### Error: "Missing required environment variable"

**Solution**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "Table does not exist"

**Solution**: Run the migrations, especially the new `20240103_transactions.sql`

### Error: "Permission denied" or RLS errors

**Solution**: This is expected for unauthenticated requests. RLS is working correctly.

### Error: "Connection failed"

**Solution**: 
- Verify your Supabase URL is correct
- Check your anon key is valid
- Ensure your Supabase project is active
- Check network connectivity

---

## Next Steps

1. ✅ Set environment variables
2. ✅ Run the transactions migration (`20240103_transactions.sql`)
3. ✅ Verify connection using test script
4. ✅ Test authentication flow
5. ✅ Test data operations

---

*All code changes are complete. The app is ready once environment variables are configured and migrations are applied.*
