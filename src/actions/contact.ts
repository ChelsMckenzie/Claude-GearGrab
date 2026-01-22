'use server'

import type { ContactRequest, ContactRequestStatus } from '@/types/database'
import { requireAuth, requireAuthWithId } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { contactRequestSchema, updateContactStatusSchema } from '@/lib/validations'

export interface RequestContactResult {
  data: ContactRequest | null
  error: string | null
}

export async function requestContact(
  listingId: string,
  sellerId: string,
  buyerId: string,
  message?: string
): Promise<RequestContactResult> {
  // ✅ Validate input
  const validationResult = contactRequestSchema.safeParse({
    listingId,
    sellerId,
    buyerId,
    message,
  })

  if (!validationResult.success) {
    return { data: null, error: validationResult.error.issues[0].message }
  }

  // ✅ Verify buyer is authenticated and matches buyerId
  const { user } = await requireAuth()
  if (user.id !== buyerId) {
    return { data: null, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Check if request already exists
  const { data: existingRequest } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .single()

  if (existingRequest) {
    return { data: existingRequest, error: null }
  }

  // Create new request
  const { data: newRequest, error } = await supabase
    .from('contact_requests')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id: listingId,
      status: 'pending',
      message: message || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: newRequest, error: null }
}

export interface GetContactStatusResult {
  data: {
    status: ContactRequestStatus | null
    requestId: string | null
    sellerPhone: string | null
  }
  error: string | null
}

export async function getContactStatus(
  listingId: string,
  buyerId: string
): Promise<GetContactStatusResult> {
  // ✅ Verify buyer is authenticated
  const { user } = await requireAuth()
  if (user.id !== buyerId) {
    return {
      data: { status: null, requestId: null, sellerPhone: null },
      error: 'Unauthorized',
    }
  }

  const supabase = await createClient()

  const { data: request } = await supabase
    .from('contact_requests')
    .select('*, seller:profiles!contact_requests_seller_id_fkey(phone)')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .single()

  if (!request) {
    return {
      data: { status: null, requestId: null, sellerPhone: null },
      error: null,
    }
  }

  // Only reveal phone if request is accepted
  const sellerPhone =
    request.status === 'accepted' ? (request.seller as any)?.phone || null : null

  return {
    data: {
      status: request.status,
      requestId: request.id,
      sellerPhone,
    },
    error: null,
  }
}

export interface UpdateContactStatusResult {
  data: ContactRequest | null
  error: string | null
}

export async function updateContactStatus(
  requestId: string,
  status: ContactRequestStatus
): Promise<UpdateContactStatusResult> {
  // ✅ Validate input
  const validationResult = updateContactStatusSchema.safeParse({
    requestId,
    status,
  })

  if (!validationResult.success) {
    return { data: null, error: validationResult.error.issues[0].message }
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  // ✅ Verify user is the seller
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

  // Update request
  const { data: updatedRequest, error } = await supabase
    .from('contact_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: updatedRequest, error: null }
}

// Get all contact requests for a seller
export async function getSellerContactRequests(
  sellerId: string
): Promise<{ data: ContactRequest[]; error: string | null }> {
  // ✅ Verify user is authenticated and matches sellerId
  await requireAuthWithId(sellerId)

  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: requests || [], error: null }
}
