-- Create public bucket for brand-scene reference uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-scene-references', 'brand-scene-references', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (preview images are referenced via direct URL across the app)
CREATE POLICY "brand_scene_refs_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-scene-references');

-- Owner can insert into their own folder: {auth.uid()}/...
CREATE POLICY "brand_scene_refs_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-scene-references'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner can update their own folder
CREATE POLICY "brand_scene_refs_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-scene-references'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Owner can delete their own folder
CREATE POLICY "brand_scene_refs_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-scene-references'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin override: manage any file in this bucket
CREATE POLICY "brand_scene_refs_admin_all"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'brand-scene-references'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'brand-scene-references'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);