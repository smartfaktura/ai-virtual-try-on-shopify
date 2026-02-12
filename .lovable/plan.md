

## Fix: Add Upload Policy for Landing Assets Bucket

### Problem
The migration is failing because the storage bucket only has a **read** policy. There's no **INSERT** policy allowing uploads.

### Solution
Add an RLS policy on `storage.objects` that allows authenticated users to upload to the `landing-assets` bucket. Since this is a one-time admin migration, we'll scope the INSERT policy to authenticated users only.

### Changes

**1. SQL Migration** — Add INSERT policy:
```sql
CREATE POLICY "Authenticated users can upload landing assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landing-assets');
```

That's it — one policy addition. After the migration completes successfully, we can optionally remove this INSERT policy since the bucket only needs public read access going forward.

