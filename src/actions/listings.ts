'use server'

import type { Listing, ListingFilters } from '@/types/database'

// Mock data store for listings (in production, this would use Supabase)
const mockListings: Listing[] = [
  {
    id: 'listing-1',
    user_id: 'user-seller-1',
    title: 'Trail Running Shoes',
    description: 'Lightweight trail runners perfect for mountain terrain.',
    price: 1200,
    images: ['/images/hiking-shoes.jpg'],
    category: 'Hiking',
    sub_category: 'Footwear',
    brand: 'Salomon',
    model: 'Speedcross 5',
    condition: 'Slightly used',
    retail_price: 2400,
    discount_percent: 50,
    product_link: 'https://salomon.com/speedcross5',
    estimated_retail_price: 2400,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'listing-2',
    user_id: 'user-seller-2',
    title: 'Mountain Bike',
    description: 'Full suspension mountain bike, great for trails.',
    price: 15000,
    images: ['/images/mtb.jpg'],
    category: 'Cycling',
    sub_category: 'Mountain Bikes',
    brand: 'Giant',
    model: 'Trance X',
    condition: 'Slightly used',
    retail_price: 30000,
    discount_percent: 50,
    product_link: 'https://giant.com/trancex',
    estimated_retail_price: 30000,
    status: 'active',
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
  },
  {
    id: 'listing-3',
    user_id: 'user-seller-1',
    title: 'Hiking Backpack 65L',
    description: 'Large capacity backpack for multi-day hikes.',
    price: 800,
    images: ['/images/backpack.jpg'],
    category: 'Hiking',
    sub_category: 'Backpacks',
    brand: 'Osprey',
    model: 'Atmos AG 65',
    condition: 'New',
    retail_price: 1600,
    discount_percent: 50,
    product_link: 'https://osprey.com/atmos',
    estimated_retail_price: 1600,
    status: 'active',
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z',
  },
]

export interface GetListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getListings(filters?: ListingFilters): Promise<GetListingsResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  let results = [...mockListings]

  if (filters) {
    if (filters.category) {
      results = results.filter((l) => l.category === filters.category)
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((l) => l.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((l) => l.price <= filters.maxPrice!)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description?.toLowerCase().includes(searchLower) ||
          l.brand?.toLowerCase().includes(searchLower)
      )
    }
    if (filters.status) {
      results = results.filter((l) => l.status === filters.status)
    }
  }

  // Sort by created_at descending
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return { data: results, error: null }
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
  await new Promise((resolve) => setTimeout(resolve, 100))

  const listing = mockListings.find((l) => l.id === id)

  if (!listing) {
    return { data: null, error: 'Listing not found' }
  }

  const isOwner = currentUserId === listing.user_id

  // In production, seller phone would come from profiles table
  // and only be revealed if contact request is accepted
  const sellerPhone = isOwner ? '+27 82 123 4567' : null

  // Mock seller info - in production would come from profiles table
  const sellerInfo: Record<string, { name: string; verified: boolean }> = {
    'user-seller-1': { name: 'Sarah Seller', verified: true },
    'user-seller-2': { name: 'Mike Mountain', verified: false },
  }

  const seller = sellerInfo[listing.user_id] || { name: 'Unknown Seller', verified: false }

  return {
    data: {
      listing,
      isOwner,
      sellerPhone,
      sellerName: seller.name,
      sellerVerified: seller.verified,
    },
    error: null,
  }
}

// Get available categories
export async function getCategories(): Promise<string[]> {
  const categories = [...new Set(mockListings.map((l) => l.category))]
  return categories.sort()
}

// Get featured listings (most recent active listings)
export interface GetFeaturedListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getFeaturedListings(limit: number = 4): Promise<GetFeaturedListingsResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const featured = mockListings
    .filter((l) => l.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)

  return { data: featured, error: null }
}
