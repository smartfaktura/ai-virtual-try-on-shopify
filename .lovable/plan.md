

# Fix: Remove Public SELECT Policy on `generation-inputs` Bucket

## Analysis

The `generation-inputs` storage bucket is correctly marked private, and the client code already uses signed URLs (via `createSignedUrl` in `Freestyle.tsx` and the `signedUrl.ts` helper). However, a storage policy named **"Generation inputs are publicly readable"** grants `SELECT` to the `public` role with no ownership check, effectively making every user's uploaded inputs readable by anyone.

A separate policy **"Users can view own generation inputs"** already exists and correctly scopes reads by folder ownership (`auth.uid()` prefix matching).

## Change (1 item)

### Drop the permissive public SELECT storage policy

```sql
DROP POLICY "Generation inputs are publicly readable" ON storage.objects;
```

The ownership-scoped policy remains in place. Signed URLs (already used by all client code) will continue to work since they are generated server-side.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop the `"Generation inputs are publicly readable"` policy on `storage.objects` |

No code changes needed.

