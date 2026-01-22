'use server'

import type { Profile } from '@/types/database'
import { requireAuthWithId } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

export interface VerifyIdentityResult {
  data: { verified: boolean } | null
  error: string | null
}

export async function verifyIdentity(userId: string): Promise<VerifyIdentityResult> {
  // ✅ Verify user is authenticated and matches userId
  await requireAuthWithId(userId)

  const supabase = await createClient()

  // TODO: Integrate with Orca KYC API here
  // For now, just mark as verified in database
  const { error } = await supabase
    .from('profiles')
    .update({
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: { verified: true }, error: null }
}

export interface GetProfileResult {
  data: Profile | null
  error: string | null
}

export async function getProfile(userId: string): Promise<GetProfileResult> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return { data: null, error: 'Profile not found' }
  }

  return { data: profile, error: null }
}

export async function isUserVerified(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', userId)
    .single()

  return profile?.is_verified ?? false
}
