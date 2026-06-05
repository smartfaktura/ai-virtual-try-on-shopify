## Fix: Lock down `catalog-previews` bucket INSERT policy

The current INSERT policy on `storage.objects` for the `catalog-previews` bucket targets the `public` role with only a `bucket_id` check — meaning anyone (even unauthenticated) can upload arbitrary files. Restrict it to `service_role` only.

### Why safe
- Edge function `generate-catalog-preview` uses the service role key → bypasses RLS → uploads keep working.
- No client code uploads to this bucket directly.
- SELECT policy is untouched → all existing cached previews keep rendering.
- Brand scenes (`brand-scene-references` bucket) are unaffected.

### Migration

```sql
DROP POLICY IF EXISTS "Service role insert catalog-previews" ON storage.objects;

CREATE POLICY "Service role insert catalog-previews"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'catalog-previews');
```

### After migration
- Mark `catalog_previews_unrestricted_insert` finding as fixed.
- No code or UI changes needed.
