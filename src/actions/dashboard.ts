'use server'

import type { Listing, ContactRequest, ContactRequestStatus, Profile } from '@/types/database'
import { requireAuthWithId, requireAuth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

// ===========================================
// Dashboard Server Actions
// ===========================================

export interface GetUserListingsResult {
  data: Listing[] | null
  error: string | null
}

export async function getUserListings(userId: string): Promise<GetUserListingsResult> {
  // ✅ Verify user is authenticated and matches userId
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
  // ✅ Verify user is authenticated and matches sellerId
  await requireAuthWithId(sellerId)

  const supabase = await createClient()

  // Get contact requests with buyer and listing info
  const { data: requests, error: requestsError } = await supabase
    .from('contact_requests')
    .select(`
      *,
      buyer:profiles!contact_requests_buyer_id_fkey(display_name, is_verified),
      listing:listings!contact_requests_listing_id_fkey(title)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (requestsError) {
    return { data: null, error: requestsError.message }
  }

  // Transform to IncomingRequest format
  const enrichedRequests: IncomingRequest[] = (requests || []).map((request: any) => ({
    id: request.id,
    buyerName: request.buyer?.display_name || 'Unknown Buyer',
    buyerVerified: request.buyer?.is_verified || false,
    message: request.message,
    listingTitle: request.listing?.title || 'Unknown Listing',
    listingId: request.listing_id,
    status: request.status,
    createdAt: request.created_at,
  }))

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
  const { user } = await requireAuth()
  const supabase = await createClient()

  // ✅ Verify user is the seller of this request
  const { data: request } = await supabase
    .from('contact_requests')
    .select('seller_id')
    .eq('id', requestId)
    .single()

  if (!request) {
    return { data: null, error: 'Request not found' }
  }

  if (request.seller_id !== user.id) {
    return { data: null, error: 'Unauthorized' }
  }

  // Update request status
  const { data: updatedRequest, error } = await supabase
    .from('contact_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: { id: updatedRequest.id, status: updatedRequest.status }, error: null }
}

export interface DeleteListingResult {
  data: { id: string } | null
  error: string | null
}

export async function deleteListing(listingId: string): Promise<DeleteListingResult> {
  const { user } = await requireAuth()
  const supabase = await createClient()

  // ✅ Verify user owns the listing
  const { data: listing } = await supabase
    .from('listings')
    .select('user_id')
    .eq('id', listingId)
    .single()

  if (!listing) {
    return { data: null, error: 'Listing not found' }
  }

  if (listing.user_id !== user.id) {
    return { data: null, error: 'Unauthorized' }
  }

  // Soft delete - mark as hidden
  const { error } = await supabase
    .from('listings')
    .update({ status: 'hidden', updated_at: new Date().toISOString() })
    .eq('id', listingId)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: { id: listingId }, error: null }
}
