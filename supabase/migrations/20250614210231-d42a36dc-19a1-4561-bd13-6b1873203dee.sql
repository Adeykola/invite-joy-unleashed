
-- Create storage buckets for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-logos', 'event-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('event-banners', 'event-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for event image uploads
CREATE POLICY "Authenticated users can upload event logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-logos');

CREATE POLICY "Authenticated users can update their event logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-logos' AND owner = auth.uid());

CREATE POLICY "Anyone can view event logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-logos');

CREATE POLICY "Authenticated users can delete their event logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-logos' AND owner = auth.uid());

CREATE POLICY "Authenticated users can upload event banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Authenticated users can update their event banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-banners' AND owner = auth.uid());

CREATE POLICY "Anyone can view event banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-banners');

CREATE POLICY "Authenticated users can delete their event banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-banners' AND owner = auth.uid());
