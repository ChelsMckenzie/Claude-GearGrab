-- GearGrab Storage Configuration
-- Creates storage bucket for listing images with RLS policies

-- ===========================================
-- CREATE STORAGE BUCKET
-- ===========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,  -- Public bucket for easy image display
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- ===========================================
-- STORAGE POLICIES
-- ===========================================

-- Anyone can view images (public bucket)
CREATE POLICY "Public read access for listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.role() = 'authenticated'
  );

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
