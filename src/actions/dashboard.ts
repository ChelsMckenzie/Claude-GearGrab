'use server'

import type { Listing, ContactRequest, ContactRequestStatus, Profile } from '@/types/database'

// Re-use mock data references from other actions
// In production, these would all query Supabase

// Mock listings data (same as listings.ts)
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

// Mock profiles for buyer info
const mockProfiles: Record<string, Profile> = {
  'user-buyer-1': {
    id: 'user-buyer-1',
    display_name: 'John Buyer',
    phone: '+27 82 111 2222',
    avatar_url: null,
    is_verified: false,
    allow_whatsapp: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  'user-buyer-2': {
    id: 'user-buyer-2',
    display_name: 'Jane Interested',
    phone: '+27 82 333 4444',
    avatar_url: null,
    is_verified: true,
    allow_whatsapp: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
}

// Mock contact requests with pre-populated data for testing
const mockContactRequests: ContactRequest[] = [
  {
    id: 'request-1',
    buyer_id: 'user-buyer-1',
    seller_id: 'user-seller-1',
    listing_id: 'listing-1',
    status: 'pending',
    message: 'Hi, I am very interested in these shoes! Are they still available?',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
]

// ===========================================
// Dashboard Server Actions
// ===========================================

export interface GetUserListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getUserListings(userId: string): Promise<GetUserListingsResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const userListings = mockListings.filter((l) => l.user_id === userId)

  return { data: userListings, error: null }
}

export interface IncomingRequest {
  id: string
  buyerName: string
  buyerVerified: boolean
  message: string | null
  listingTitle: string
  listingId: string
  status: ContactRequestStatus
  createdAt: string
}

export interface GetIncomingRequestsResult {
  data: IncomingRequest[] | null
  error: string | null
}

export async function getIncomingRequests(sellerId: string): Promise<GetIncomingRequestsResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Get all requests for this seller
  const requests = mockContactRequests.filter((r) => r.seller_id === sellerId)

  // Enrich with buyer profile and listing data
  const enrichedRequests: IncomingRequest[] = requests.map((request) => {
    const buyer = mockProfiles[request.buyer_id]
    const listing = mockListings.find((l) => l.id === request.listing_id)

    return {
      id: request.id,
      buyerName: buyer?.display_name || 'Unknown Buyer',
      buyerVerified: buyer?.is_verified || false,
      message: request.message,
      listingTitle: listing?.title || 'Unknown Listing',
      listingId: request.listing_id,
      status: request.status,
      createdAt: request.created_at,
    }
  })

  return { data: enrichedRequests, error: null }
}

export interface UpdateRequestStatusResult {
  data: { id: string; status: ContactRequestStatus } | null
  error: string | null
}

export async function updateRequestStatus(
  requestId: string,
  status: ContactRequestStatus
): Promise<UpdateRequestStatusResult> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const request = mockContactRequests.find((r) => r.id === requestId)

  if (!request) {
    return { data: null, error: 'Request not found' }
  }

  request.status = status
  request.updated_at = new Date().toISOString()

  return { data: { id: request.id, status: request.status }, error: null }
}

export interface DeleteListingResult {
  data: { id: string } | null
  error: string | null
}

export async function deleteListing(listingId: string): Promise<DeleteListingResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const index = mockListings.findIndex((l) => l.id === listingId)

  if (index === -1) {
    return { data: null, error: 'Listing not found' }
  }

  // Mark as hidden instead of actually deleting (soft delete)
  mockListings[index].status = 'hidden'

  return { data: { id: listingId }, error: null }
}
