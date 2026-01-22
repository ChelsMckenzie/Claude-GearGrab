/**
 * Authentication helpers for server actions and components
 */

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Require authentication - throws/redirects if user is not authenticated
 * @returns Authenticated user and Supabase client
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return { user, supabase }
}

/**
 * Require authentication and verify user ID matches
 * @param userId The user ID to verify
 * @returns Authenticated user and Supabase client
 * @throws Error if user ID doesn't match
 */
export async function requireAuthWithId(userId: string) {
  const { user } = await requireAuth()

  if (user.id !== userId) {
    throw new Error('Unauthorized: User ID mismatch')
  }

  return { user }
}

/**
 * Get current user (returns null if not authenticated)
 * Useful for optional auth checks
 * @returns User object or null
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}
