'use server'

import { createClient } from '@/utils/supabase/server'

export interface UploadImageResult {
  data: {
    url: string
    path: string
  } | null
  error: string | null
}

export async function uploadListingImage(
  formData: FormData,
  userId: string
): Promise<UploadImageResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { data: null, error: 'No file provided' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' }
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { data: null, error: 'File too large. Maximum size is 5MB.' }
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const supabase = await createClient()

  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !supabaseUrl.includes('supabase')) {
    // Mock upload for development without Supabase
    const mockUrl = `/mock-images/${fileName}`
    return {
      data: { url: mockUrl, path: fileName },
      error: null,
    }
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return { data: null, error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path)

  return {
    data: {
      url: urlData.publicUrl,
      path: data.path,
    },
    error: null,
  }
}

export async function deleteListingImage(path: string): Promise<{ error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !supabaseUrl.includes('supabase')) {
    // Mock delete for development
    return { error: null }
  }

  const supabase = await createClient()

  const { error } = await supabase.storage.from('listing-images').remove([path])

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
