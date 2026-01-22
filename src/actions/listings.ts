'use server'

import type { Listing, ListingFilters } from '@/types/database'
import { createClient } from '@/utils/supabase/server'

// Helper function to escape LIKE patterns
function escapeLikePattern(input: string): string {
  return input.replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export interface GetListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getListings(filters?: ListingFilters): Promise<GetListingsResult> {
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', filters?.status || 'active') // Default to active listings

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
      // ✅ Escape special characters to prevent SQL injection
      const escapedSearch = escapeLikePattern(filters.search)
      query = query.or(
        `title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,brand.ilike.%${escapedSearch}%`
      )
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data || [], error: null }
}

export interface GetListingDetailsResult {
  data: {
    listing: Listing
    isOwner: boolean
    sellerPhone: string | null
    sellerName: string
    sellerVerified: boolean
  } | null
  error: string | null
}

export async function getListingDetails(
  id: string,
  currentUserId?: string
): Promise<GetListingDetailsResult> {
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

  const isOwner = currentUserId === listing.user_id

  // Get seller profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_verified, phone')
    .eq('id', listing.user_id)
    .single()

  // Only reveal phone if user is the owner
  const sellerPhone = isOwner ? profile?.phone || null : null

  return {
    data: {
      listing,
      isOwner,
      sellerPhone,
      sellerName: profile?.display_name || 'Unknown Seller',
      sellerVerified: profile?.is_verified || false,
    },
    error: null,
  }
}

// Get available categories
export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'active')

  if (error || !data) {
    return []
  }

  const categories = [...new Set(data.map((l) => l.category).filter(Boolean))]
  return categories.sort()
}

// Get featured listings (most recent active listings)
export interface GetFeaturedListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getFeaturedListings(limit: number = 4): Promise<GetFeaturedListingsResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data || [], error: null }
}
