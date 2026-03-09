

## Scratch-Uploads Bucket Assessment

**Finding: The bucket is unused.** There are zero references to `scratch-uploads` in any frontend or edge function code. It was created but never wired into any feature.

**Is it a real issue?** Yes, but a minor one. The policies allow any anonymous user to upload up to 10 MB files, read anything, and delete anything — no authentication required. In theory, someone could abuse it to store arbitrary files at your expense. But since nothing in the app uses it, the simplest fix is to just delete it entirely.

### Recommended Action

**Delete the bucket** via a single migration:

| Change | Detail |
|--------|--------|
| Database migration | Drop the 3 RLS policies, then delete the `scratch-uploads` bucket |

```sql
DROP POLICY "Anyone can upload scratch images" ON storage.objects;
DROP POLICY "Anyone can view scratch images" ON storage.objects;
DROP POLICY "Anyone can delete scratch images" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'scratch-uploads';
```

No code changes needed since nothing references it.

