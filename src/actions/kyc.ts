'use server'

import type { Profile } from '@/types/database'

// Mock profiles data store (shared with other actions in production via Supabase)
const mockProfiles: Map<string, Profile> = new Map([
  [
    'user-buyer-1',
    {
      id: 'user-buyer-1',
      display_name: 'John Buyer',
      phone: '+27 82 111 2222',
      avatar_url: null,
      is_verified: false,
      allow_whatsapp: true,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
    },
  ],
  [
    'user-seller-1',
    {
      id: 'user-seller-1',
      display_name: 'Sarah Seller',
      phone: '+27 82 333 4444',
      avatar_url: null,
      is_verified: true,
      allow_whatsapp: true,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
    },
  ],
  [
    'user-seller-2',
    {
      id: 'user-seller-2',
      display_name: 'Mike Mountain',
      phone: '+27 82 555 6666',
      avatar_url: null,
      is_verified: false,
      allow_whatsapp: false,
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
    },
  ],
])

export interface VerifyIdentityResult {
  data: { verified: boolean } | null
  error: string | null
}

export async function verifyIdentity(userId: string): Promise<VerifyIdentityResult> {
  // Mock Orca KYC verification - 2 second delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const profile = mockProfiles.get(userId)

  if (!profile) {
    return { data: null, error: 'Profile not found' }
  }

  // Update profile to verified
  profile.is_verified = true
  profile.updated_at = new Date().toISOString()
  mockProfiles.set(userId, profile)

  return { data: { verified: true }, error: null }
}

export interface GetProfileResult {
  data: Profile | null
  error: string | null
}

export async function getProfile(userId: string): Promise<GetProfileResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const profile = mockProfiles.get(userId)

  if (!profile) {
    return { data: null, error: 'Profile not found' }
  }

  return { data: profile, error: null }
}

export async function isUserVerified(userId: string): Promise<boolean> {
  const profile = mockProfiles.get(userId)
  return profile?.is_verified ?? false
}
