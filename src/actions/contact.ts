'use server'

import type { ContactRequest, ContactRequestStatus } from '@/types/database'

// Mock data store for contact requests (in production, this would use Supabase)
const mockContactRequests: ContactRequest[] = []

// Mock seller phone numbers
const mockSellerPhones: Record<string, string> = {
  'user-seller-1': '+27 82 123 4567',
  'user-seller-2': '+27 83 987 6543',
}

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
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Check if request already exists
  const existingRequest = mockContactRequests.find(
    (r) => r.listing_id === listingId && r.buyer_id === buyerId
  )

  if (existingRequest) {
    return { data: existingRequest, error: null }
  }

  // Create new request
  const newRequest: ContactRequest = {
    id: `request-${Date.now()}`,
    buyer_id: buyerId,
    seller_id: sellerId,
    listing_id: listingId,
    status: 'pending',
    message: message || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockContactRequests.push(newRequest)

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
  await new Promise((resolve) => setTimeout(resolve, 50))

  const request = mockContactRequests.find(
    (r) => r.listing_id === listingId && r.buyer_id === buyerId
  )

  if (!request) {
    return {
      data: { status: null, requestId: null, sellerPhone: null },
      error: null,
    }
  }

  // Only reveal phone if request is accepted
  const sellerPhone =
    request.status === 'accepted' ? mockSellerPhones[request.seller_id] || null : null

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
  await new Promise((resolve) => setTimeout(resolve, 100))

  const request = mockContactRequests.find((r) => r.id === requestId)

  if (!request) {
    return { data: null, error: 'Request not found' }
  }

  request.status = status
  request.updated_at = new Date().toISOString()

  return { data: request, error: null }
}

// Get all contact requests for a seller
export async function getSellerContactRequests(
  sellerId: string
): Promise<{ data: ContactRequest[]; error: string | null }> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const requests = mockContactRequests.filter((r) => r.seller_id === sellerId)

  return { data: requests, error: null }
}
