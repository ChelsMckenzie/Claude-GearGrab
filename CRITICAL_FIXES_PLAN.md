# Critical Fixes Implementation Plan

**Status:** Ready for Review  
**Estimated Time:** 2-3 weeks  
**Priority:** Must complete before deployment

---

## Overview

This plan addresses all 8 critical issues identified in the audit. Each fix includes:
- Specific file locations
- Code changes required
- Testing requirements
- Dependencies/order of implementation

---

## Fix 1: Remove TypeScript Build Errors Ignore

**File:** `next.config.ts`  
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 hours

### Current State
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // ❌ DANGEROUS
  },
}
```

### Action Plan

1. **Remove the ignoreBuildErrors setting**
   ```typescript
   const nextConfig: NextConfig = {
     // Remove typescript.ignoreBuildErrors
   }
   ```

2. **Run build to identify errors**
   ```bash
   npm run build
   ```

3. **Fix all TypeScript errors systematically**
   - Start with type errors in `src/types/`
   - Fix component prop types
   - Fix server action return types
   - Fix async/await type issues

4. **Verify build succeeds**
   ```bash
   npm run build
   ```

### Testing
- [ ] Build completes without errors
- [ ] No type errors in IDE
- [ ] All pages compile successfully

---

## Fix 2: Add Environment Variable Validation

**Files:**
- `src/utils/supabase/server.ts`
- `src/utils/supabase/client.ts`
- `src/utils/supabase/middleware.ts`
- `src/actions/analyze-gear.ts`

**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 hours

### Current State
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
```

### Action Plan

1. **Create environment validation utility**
   Create: `src/lib/env.ts`
   ```typescript
   function getRequiredEnv(key: string): string {
     const value = process.env[key]
     if (!value) {
       throw new Error(`Missing required environment variable: ${key}`)
     }
     return value
   }

   export const env = {
     supabaseUrl: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
     supabaseAnonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
     geminiApiKey: process.env.GEMINI_API_KEY, // Optional
   } as const
   ```

2. **Update server.ts**
   ```typescript
   import { env } from '@/lib/env'
   
   export async function createClient() {
     const cookieStore = await cookies()
     return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
       // ... rest of config
     })
   }
   ```

3. **Update client.ts**
   ```typescript
   import { env } from '@/lib/env'
   
   export function createClient() {
     return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey)
   }
   ```

4. **Update middleware.ts**
   ```typescript
   import { env } from '@/lib/env'
   
   export async function updateSession(request: NextRequest) {
     // Remove the isValidSupabaseUrl check - env.ts handles validation
     const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
       // ... rest of config
     })
     // ... rest of function
   }
   ```

5. **Create .env.example**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key-optional
   ```

### Testing
- [ ] App fails fast with clear error if env vars missing
- [ ] All Supabase clients initialize correctly
- [ ] Build succeeds with proper env vars
- [ ] `.env.example` documents all required variables

---

## Fix 3: Implement Authentication Checks in Server Actions

**Files:**
- `src/actions/listings.ts`
- `src/actions/escrow.ts`
- `src/actions/dashboard.ts`
- `src/actions/contact.ts`
- `src/actions/upload-image.ts`
- `src/actions/kyc.ts`
- `src/actions/analyze-gear.ts`

**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 days

### Current State
All server actions accept any userId without verification.

### Action Plan

1. **Create authentication helper**
   Create: `src/lib/auth.ts`
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   import { redirect } from 'next/navigation'

   export async function requireAuth() {
     const supabase = await createClient()
     const { data: { user }, error } = await supabase.auth.getUser()
     
     if (error || !user) {
       redirect('/login')
     }
     
     return { user, supabase }
   }

   export async function requireAuthWithId(userId: string) {
     const { user } = await requireAuth()
     
     if (user.id !== userId) {
       throw new Error('Unauthorized: User ID mismatch')
     }
     
     return { user }
   }
   ```

2. **Update listings.ts**
   ```typescript
   import { requireAuth, requireAuthWithId } from '@/lib/auth'
   import { createClient } from '@/utils/supabase/server'
   
   export async function getListings(filters?: ListingFilters) {
     const supabase = await createClient()
     // No auth required for public listings
     
     // Use Supabase query instead of mock data
     let query = supabase.from('listings').select('*')
     
     if (filters?.category) {
       query = query.eq('category', filters.category)
     }
     // ... rest of filters
     
     const { data, error } = await query
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data: data || [], error: null }
   }
   
   export async function getListingDetails(id: string, currentUserId?: string) {
     const supabase = await createClient()
     
     // Get listing
     const { data: listing, error: listingError } = await supabase
       .from('listings')
       .select('*')
       .eq('id', id)
       .single()
     
     if (listingError || !listing) {
       return { data: null, error: 'Listing not found' }
     }
     
     // Get seller profile
     const { data: profile } = await supabase
       .from('profiles')
       .select('display_name, is_verified, phone')
       .eq('id', listing.user_id)
       .single()
     
     const isOwner = currentUserId === listing.user_id
     
     return {
       data: {
         listing,
         isOwner,
         sellerPhone: isOwner ? profile?.phone || null : null,
         sellerName: profile?.display_name || 'Unknown Seller',
         sellerVerified: profile?.is_verified || false,
       },
       error: null,
     }
   }
   
   export async function getUserListings(userId: string) {
     // ✅ Add auth check
     await requireAuthWithId(userId)
     
     const supabase = await createClient()
     const { data, error } = await supabase
       .from('listings')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false })
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data: data || [], error: null }
   }
   ```

3. **Update escrow.ts**
   ```typescript
   import { requireAuth } from '@/lib/auth'
   import { createClient } from '@/utils/supabase/server'
   
   export async function createTransaction(
     buyerId: string,
     sellerId: string,
     listingId: string,
     amount: number
   ) {
     // ✅ Verify buyer is authenticated
     const { user } = await requireAuth()
     if (user.id !== buyerId) {
       return { data: null, error: 'Unauthorized' }
     }
     
     const supabase = await createClient()
     
     const { data, error } = await supabase
       .from('transactions')
       .insert({
         buyer_id: buyerId,
         seller_id: sellerId,
         listing_id: listingId,
         amount,
         status: 'escrow_pending',
       })
       .select()
       .single()
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data, error: null }
   }
   
   export async function getTransaction(transactionId: string) {
     const { user } = await requireAuth()
     const supabase = await createClient()
     
     const { data, error } = await supabase
       .from('transactions')
       .select('*')
       .eq('id', transactionId)
       .single()
     
     if (error || !data) {
       return { data: null, error: 'Transaction not found' }
     }
     
     // ✅ Verify user is buyer or seller
     if (data.buyer_id !== user.id && data.seller_id !== user.id) {
       return { data: null, error: 'Unauthorized' }
     }
     
     return { data, error: null }
   }
   
   export async function updateTransactionStatus(
     transactionId: string,
     status: TransactionStatus
   ) {
     const { user } = await requireAuth()
     const supabase = await createClient()
     
     // Get transaction first
     const { data: transaction } = await supabase
       .from('transactions')
       .select('*')
       .eq('id', transactionId)
       .single()
     
     if (!transaction) {
       return { data: null, error: 'Transaction not found' }
     }
     
     // ✅ Verify user is buyer or seller
     if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
       return { data: null, error: 'Unauthorized' }
     }
     
     // Update transaction
     const { data, error } = await supabase
       .from('transactions')
       .update({ status, updated_at: new Date().toISOString() })
       .eq('id', transactionId)
       .select()
       .single()
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data, error: null }
   }
   ```

4. **Update dashboard.ts**
   ```typescript
   import { requireAuthWithId } from '@/lib/auth'
   
   export async function getUserListings(userId: string) {
     await requireAuthWithId(userId)
     // ... rest of implementation using Supabase
   }
   
   export async function getIncomingRequests(sellerId: string) {
     await requireAuthWithId(sellerId)
     // ... rest of implementation using Supabase
   }
   
   export async function deleteListing(listingId: string) {
     const { user } = await requireAuth()
     const supabase = await createClient()
     
     // ✅ Verify user owns the listing
     const { data: listing } = await supabase
       .from('listings')
       .select('user_id')
       .eq('id', listingId)
       .single()
     
     if (!listing || listing.user_id !== user.id) {
       return { data: null, error: 'Unauthorized' }
     }
     
     // Soft delete
     const { error } = await supabase
       .from('listings')
       .update({ status: 'hidden' })
       .eq('id', listingId)
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data: { id: listingId }, error: null }
   }
   ```

5. **Update contact.ts**
   ```typescript
   import { requireAuth } from '@/lib/auth'
   
   export async function requestContact(
     listingId: string,
     sellerId: string,
     buyerId: string,
     message?: string
   ) {
     const { user } = await requireAuth()
     if (user.id !== buyerId) {
       return { data: null, error: 'Unauthorized' }
     }
     
     // ... rest using Supabase
   }
   
   export async function updateContactStatus(
     requestId: string,
     status: ContactRequestStatus
   ) {
     const { user } = await requireAuth()
     const supabase = await createClient()
     
     // ✅ Verify user is the seller
     const { data: request } = await supabase
       .from('contact_requests')
       .select('seller_id')
       .eq('id', requestId)
       .single()
     
     if (!request || request.seller_id !== user.id) {
       return { data: null, error: 'Unauthorized' }
     }
     
     // ... update request
   }
   ```

6. **Update upload-image.ts**
   ```typescript
   import { requireAuth } from '@/lib/auth'
   
   export async function uploadListingImage(
     formData: FormData,
     userId: string
   ) {
     const { user } = await requireAuth()
     if (user.id !== userId) {
       return { data: null, error: 'Unauthorized' }
     }
     
     // ... rest of implementation
   }
   ```

### Testing
- [ ] Unauthenticated users redirected to login
- [ ] Users cannot access other users' data
- [ ] Users cannot modify other users' resources
- [ ] All server actions verify authentication
- [ ] Error messages are clear and secure

---

## Fix 4: Add Input Validation to Server Actions

**Files:**
- `src/app/(auth)/actions.ts`
- `src/actions/escrow.ts`
- `src/actions/contact.ts`
- `src/actions/upload-image.ts`
- `src/actions/analyze-gear.ts`

**Priority:** 🔴 Critical  
**Estimated Time:** 1 day

### Action Plan

1. **Create validation schemas**
   Create: `src/lib/validations.ts`
   ```typescript
   import { z } from 'zod'

   export const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(1, 'Password is required'),
   })

   export const signupSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string()
       .min(8, 'Password must be at least 8 characters')
       .regex(/[A-Z]/, 'Password must contain uppercase letter')
       .regex(/[a-z]/, 'Password must contain lowercase letter')
       .regex(/[0-9]/, 'Password must contain number'),
     phone: z.string().regex(
       /^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/,
       'Invalid South African phone number format'
     ),
   })

   export const createTransactionSchema = z.object({
     buyerId: z.string().uuid('Invalid buyer ID'),
     sellerId: z.string().uuid('Invalid seller ID'),
     listingId: z.string().uuid('Invalid listing ID'),
     amount: z.number().positive('Amount must be positive').int('Amount must be an integer'),
   })

   export const contactRequestSchema = z.object({
     listingId: z.string().uuid('Invalid listing ID'),
     sellerId: z.string().uuid('Invalid seller ID'),
     buyerId: z.string().uuid('Invalid buyer ID'),
     message: z.string().max(500, 'Message too long').optional(),
   })

   export const imageUploadSchema = z.object({
     userId: z.string().uuid('Invalid user ID'),
   })
   ```

2. **Update auth actions**
   ```typescript
   import { loginSchema, signupSchema } from '@/lib/validations'
   
   export async function login(formData: FormData) {
     const rawData = {
       email: formData.get('email'),
       password: formData.get('password'),
     }
     
     // ✅ Validate input
     const result = loginSchema.safeParse(rawData)
     if (!result.success) {
       return { error: result.error.errors[0].message }
     }
     
     const supabase = await createClient()
     const { error } = await supabase.auth.signInWithPassword(result.data)
     
     if (error) {
       return { error: error.message }
     }
     
     revalidatePath('/', 'layout')
     redirect('/dashboard')
   }
   
   export async function signup(formData: FormData) {
     const rawData = {
       email: formData.get('email'),
       password: formData.get('password'),
       phone: formData.get('phone'),
     }
     
     // ✅ Validate input
     const result = signupSchema.safeParse(rawData)
     if (!result.success) {
       return { error: result.error.errors[0].message }
     }
     
     const supabase = await createClient()
     const { error } = await supabase.auth.signUp({
       email: result.data.email,
       password: result.data.password,
       options: {
         data: {
           phone: result.data.phone,
         },
       },
     })
     
     if (error) {
       return { error: error.message }
     }
     
     revalidatePath('/', 'layout')
     redirect('/dashboard')
   }
   ```

3. **Update escrow actions**
   ```typescript
   import { createTransactionSchema } from '@/lib/validations'
   
   export async function createTransaction(
     buyerId: string,
     sellerId: string,
     listingId: string,
     amount: number
   ) {
     // ✅ Validate input
     const result = createTransactionSchema.safeParse({
       buyerId,
       sellerId,
       listingId,
       amount,
     })
     
     if (!result.success) {
       return { data: null, error: result.error.errors[0].message }
     }
     
     // ... rest of implementation
   }
   ```

4. **Update contact actions**
   ```typescript
   import { contactRequestSchema } from '@/lib/validations'
   
   export async function requestContact(
     listingId: string,
     sellerId: string,
     buyerId: string,
     message?: string
   ) {
     // ✅ Validate input
     const result = contactRequestSchema.safeParse({
       listingId,
       sellerId,
       buyerId,
       message,
     })
     
     if (!result.success) {
       return { data: null, error: result.error.errors[0].message }
     }
     
     // ... rest of implementation
   }
   ```

### Testing
- [ ] Invalid email addresses rejected
- [ ] Weak passwords rejected
- [ ] Invalid phone numbers rejected
- [ ] Invalid UUIDs rejected
- [ ] Negative amounts rejected
- [ ] Error messages are user-friendly

---

## Fix 5: Fix SQL Injection in Search Query

**File:** `src/services/listings.ts:67-69`  
**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour

### Current State
```typescript
if (filters.search) {
  query = query.or(
    `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
  )
}
```

### Action Plan

1. **Escape special characters**
   ```typescript
   function escapeLikePattern(input: string): string {
     // Escape % and _ which are special in LIKE patterns
     return input.replace(/%/g, '\\%').replace(/_/g, '\\_')
   }
   
   if (filters.search) {
     const escapedSearch = escapeLikePattern(filters.search)
     query = query.or(
       `title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,brand.ilike.%${escapedSearch}%`
     )
   }
   ```

2. **Alternative: Use Supabase text search (better)**
   ```typescript
   if (filters.search) {
     // Use full-text search which is safer
     query = query.or(
       `title.ilike.%${escapeLikePattern(filters.search)}%,description.ilike.%${escapeLikePattern(filters.search)}%,brand.ilike.%${escapeLikePattern(filters.search)}%`
     )
   }
   ```

### Testing
- [ ] Special characters (% and _) don't break queries
- [ ] Search still works correctly
- [ ] No SQL injection possible
- [ ] Test with malicious input: `%'; DROP TABLE listings; --`

---

## Fix 6: Replace Mock Data with Supabase

**Files:**
- `src/actions/listings.ts`
- `src/actions/escrow.ts`
- `src/actions/dashboard.ts`
- `src/actions/contact.ts`
- `src/actions/kyc.ts`

**Priority:** 🔴 Critical  
**Estimated Time:** 2-3 days

### Action Plan

1. **Remove all mock data arrays/Maps**
   - Delete `mockListings` array
   - Delete `mockTransactions` Map
   - Delete `mockContactRequests` array
   - Delete `mockProfiles` Map

2. **Replace with Supabase queries**
   Use the existing `src/services/listings.ts` as a reference pattern.

3. **Update listings.ts**
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   
   export async function getListings(filters?: ListingFilters) {
     const supabase = await createClient()
     
     let query = supabase
       .from('listings')
       .select('*')
       .eq('status', 'active') // Only active listings by default
     
     if (filters) {
       if (filters.category) {
         query = query.eq('category', filters.category)
       }
       if (filters.minPrice !== undefined) {
         query = query.gte('price', filters.minPrice)
       }
       if (filters.maxPrice !== undefined) {
         query = query.lte('price', filters.maxPrice)
       }
       if (filters.search) {
         const escaped = escapeLikePattern(filters.search)
         query = query.or(
           `title.ilike.%${escaped}%,description.ilike.%${escaped}%,brand.ilike.%${escaped}%`
         )
       }
     }
     
     const { data, error } = await query.order('created_at', { ascending: false })
     
     if (error) {
       return { data: null, error: error.message }
     }
     
     return { data: data || [], error: null }
   }
   ```

4. **Update escrow.ts**
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   
   export async function createTransaction(...) {
     const supabase = await createClient()
     const { data, error } = await supabase
       .from('transactions')
       .insert({ ... })
       .select()
       .single()
     // ... handle response
   }
   
   export async function getTransaction(transactionId: string) {
     const supabase = await createClient()
     const { data, error } = await supabase
       .from('transactions')
       .select('*')
       .eq('id', transactionId)
       .single()
     // ... handle response
   }
   ```

5. **Update dashboard.ts**
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   
   export async function getUserListings(userId: string) {
     const supabase = await createClient()
     const { data, error } = await supabase
       .from('listings')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false })
     // ... handle response
   }
   
   export async function getIncomingRequests(sellerId: string) {
     const supabase = await createClient()
     const { data: requests, error } = await supabase
       .from('contact_requests')
       .select(`
         *,
         buyer:profiles!contact_requests_buyer_id_fkey(display_name, is_verified),
         listing:listings!contact_requests_listing_id_fkey(title)
       `)
       .eq('seller_id', sellerId)
       .order('created_at', { ascending: false })
     // ... handle response
   }
   ```

6. **Update contact.ts**
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   
   export async function requestContact(...) {
     const supabase = await createClient()
     
     // Check for existing request
     const { data: existing } = await supabase
       .from('contact_requests')
       .select('*')
       .eq('listing_id', listingId)
       .eq('buyer_id', buyerId)
       .single()
     
     if (existing) {
       return { data: existing, error: null }
     }
     
     // Create new request
     const { data, error } = await supabase
       .from('contact_requests')
       .insert({
         buyer_id: buyerId,
         seller_id: sellerId,
         listing_id: listingId,
         message: message || null,
         status: 'pending',
       })
       .select()
       .single()
     
     // ... handle response
   }
   ```

7. **Update kyc.ts**
   ```typescript
   import { createClient } from '@/utils/supabase/server'
   
   export async function getProfile(userId: string) {
     const supabase = await createClient()
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .eq('id', userId)
       .single()
     
     if (error || !data) {
       return { data: null, error: 'Profile not found' }
     }
     
     return { data, error: null }
   }
   ```

### Testing
- [ ] All data persists to database
- [ ] Data survives server restarts
- [ ] Multiple users see different data
- [ ] Queries are performant
- [ ] Error handling works correctly

---

## Fix 7: Remove Hardcoded User IDs

**Files:**
- `src/app/dashboard/page.tsx`
- `src/app/listings/[id]/page.tsx`
- `src/app/escrow/[id]/page.tsx`
- `src/app/listings/[id]/contact-actions.tsx`
- `src/components/layout/navbar.tsx`

**Priority:** 🔴 Critical  
**Estimated Time:** 1 day

### Action Plan

1. **Create getCurrentUser helper**
   Update: `src/lib/auth.ts`
   ```typescript
   export async function getCurrentUser() {
     const supabase = await createClient()
     const { data: { user }, error } = await supabase.auth.getUser()
     
     if (error || !user) {
       return null
     }
     
     return user
   }
   ```

2. **Update dashboard/page.tsx**
   ```typescript
   import { getCurrentUser } from '@/lib/auth'
   import { redirect } from 'next/navigation'
   
   export default async function DashboardPage() {
     const user = await getCurrentUser()
     
     if (!user) {
       redirect('/login')
     }
     
     const [listingsResult, requestsResult] = await Promise.all([
       getUserListings(user.id),
       getIncomingRequests(user.id),
     ])
     // ... rest of component
   }
   ```

3. **Update listings/[id]/page.tsx**
   ```typescript
   import { getCurrentUser } from '@/lib/auth'
   
   export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
     const { id } = await params
     const user = await getCurrentUser()
     const currentUserId = user?.id
     
     const { data, error } = await getListingDetails(id, currentUserId)
     // ... rest of component
   }
   ```

4. **Update escrow/[id]/page.tsx**
   ```typescript
   import { getCurrentUser } from '@/lib/auth'
   import { redirect } from 'next/navigation'
   
   export default async function EscrowPage({ params }: EscrowPageProps) {
     const { id } = await params
     const user = await getCurrentUser()
     
     if (!user) {
       redirect('/login')
     }
     
     const { data: transaction, error } = await getTransaction(id)
     // ... rest of component
   }
   ```

5. **Update contact-actions.tsx (client component)**
   ```typescript
   'use client'
   
   import { useEffect, useState } from 'react'
   import { createClient } from '@/utils/supabase/client'
   
   export function ContactActions({ listingId, sellerId, isOwner }: ContactActionsProps) {
     const [currentUserId, setCurrentUserId] = useState<string | null>(null)
     
     useEffect(() => {
       async function getUser() {
         const supabase = createClient()
         const { data: { user } } = await supabase.auth.getUser()
         setCurrentUserId(user?.id || null)
       }
       getUser()
     }, [])
     
     // Use currentUserId instead of hardcoded value
     // ... rest of component
   }
   ```

6. **Update navbar.tsx**
   ```typescript
   import { getCurrentUser } from '@/lib/auth'
   
   async function getCurrentUser() {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     
     if (!user) return null
     
     // Get profile
     const { data: profile } = await supabase
       .from('profiles')
       .select('display_name, is_verified')
       .eq('id', user.id)
       .single()
     
     return {
       id: user.id,
       email: user.email || '',
       displayName: profile?.display_name || 'User',
       isVerified: profile?.is_verified || false,
     }
   }
   
   export async function Navbar() {
     const user = await getCurrentUser()
     // ... rest of component
   }
   ```

### Testing
- [ ] Authenticated users see their own data
- [ ] Unauthenticated users redirected to login
- [ ] User context is correct throughout app
- [ ] No hardcoded IDs remain

---

## Fix 8: Add Proper Error Handling

**Files:** All server actions and components  
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 days

### Action Plan

1. **Create error handling utilities**
   Create: `src/lib/errors.ts`
   ```typescript
   export class AppError extends Error {
     constructor(
       message: string,
       public code: string,
       public statusCode: number = 500
     ) {
       super(message)
       this.name = 'AppError'
     }
   }

   export class ValidationError extends AppError {
     constructor(message: string) {
       super(message, 'VALIDATION_ERROR', 400)
     }
   }

   export class UnauthorizedError extends AppError {
     constructor(message: string = 'Unauthorized') {
       super(message, 'UNAUTHORIZED', 401)
     }
   }

   export class NotFoundError extends AppError {
     constructor(message: string = 'Resource not found') {
       super(message, 'NOT_FOUND', 404)
     }
   }

   export function handleServerError(error: unknown): { error: string } {
     if (error instanceof AppError) {
       return { error: error.message }
     }
     
     // Log unexpected errors
     console.error('Unexpected error:', error)
     
     // Don't expose internal errors to users
     return { error: 'An unexpected error occurred. Please try again.' }
   }
   ```

2. **Update all server actions to use error handling**
   ```typescript
   import { handleServerError, UnauthorizedError, NotFoundError } from '@/lib/errors'
   
   export async function getUserListings(userId: string) {
     try {
       const { user } = await requireAuthWithId(userId)
       // ... rest of implementation
     } catch (error) {
       return handleServerError(error)
     }
   }
   ```

3. **Create error boundary**
   Create: `src/app/error.tsx`
   ```typescript
   'use client'
   
   import { useEffect } from 'react'
   import { Button } from '@/components/ui/button'
   
   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     useEffect(() => {
       // Log error to error reporting service
       console.error('Application error:', error)
     }, [error])
   
     return (
       <div className="flex min-h-screen flex-col items-center justify-center">
         <h2 className="text-2xl font-bold">Something went wrong!</h2>
         <p className="mt-2 text-muted-foreground">
           {error.message || 'An unexpected error occurred'}
         </p>
         <Button onClick={reset} className="mt-4">
           Try again
         </Button>
       </div>
     )
   }
   ```

4. **Create global error handler**
   Create: `src/app/global-error.tsx`
   ```typescript
   'use client'
   
   export default function GlobalError({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     return (
       <html>
         <body>
           <h2>Something went wrong!</h2>
           <button onClick={reset}>Try again</button>
         </body>
       </html>
     )
   }
   ```

5. **Update client components**
   ```typescript
   try {
     const result = await someAction()
     if (result.error) {
       toast.error(result.error)
       return
     }
     // Handle success
   } catch (error) {
     toast.error('An unexpected error occurred')
     console.error(error)
   }
   ```

### Testing
- [ ] Errors are caught and handled gracefully
- [ ] User-friendly error messages displayed
- [ ] Internal errors not exposed to users
- [ ] Errors are logged for debugging
- [ ] Error boundaries catch component errors
- [ ] App doesn't crash on errors

---

## Implementation Order

1. **Week 1: Foundation**
   - Fix 1: Remove TypeScript ignore (Day 1)
   - Fix 2: Environment validation (Day 1)
   - Fix 7: Remove hardcoded user IDs (Day 2-3)
   - Fix 3: Add authentication (Day 3-5)

2. **Week 2: Security & Data**
   - Fix 4: Input validation (Day 1)
   - Fix 5: SQL injection fix (Day 1)
   - Fix 6: Replace mock data (Day 2-4)
   - Fix 8: Error handling (Day 4-5)

3. **Week 3: Testing & Polish**
   - Comprehensive testing
   - Fix any issues found
   - Performance optimization
   - Final security review

---

## Testing Checklist

After each fix:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No new TypeScript errors
- [ ] No console errors
- [ ] Build succeeds

Final testing:
- [ ] All critical user flows work
- [ ] Authentication works end-to-end
- [ ] Authorization prevents unauthorized access
- [ ] Data persists correctly
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Security audit passes

---

## Dependencies

- Supabase database must be set up and migrations run
- Environment variables must be configured
- All database tables must exist
- RLS policies must be configured correctly

---

## Notes

- Some fixes depend on others (e.g., authentication needed before authorization)
- Mock data removal should happen after Supabase is fully integrated
- Test each fix independently before moving to next
- Keep backups of working code at each stage

---

*This plan should be reviewed and approved before implementation begins.*
