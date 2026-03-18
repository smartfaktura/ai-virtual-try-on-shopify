

## Clean Up Broken Backfill Rows

The persistence fix for new generations is already in place — both primary and 429-fallback paths now insert into `freestyle_generations`, and the safety reconciliation in `completeQueueJob` catches any stragglers. New generations will work correctly.

The only action needed is to delete the broken rows created by the previous backfill migration (base64 data URLs and `"saved_to_storage"` placeholder strings).

### Changes

**1. Database data cleanup (using insert/data tool)**

Delete invalid `freestyle_generations` rows:
```sql
DELETE FROM public.freestyle_generations
WHERE image_url LIKE 'data:%'
   OR image_url = 'saved_to_storage';
```

This removes the ~37 broken cards showing as empty/broken images. No schema changes needed — just a data delete.

**2. Add URL validation guard in edge function**

File: `supabase/functions/generate-freestyle/index.ts`

In the safety reconciliation section (~line 791), add a guard to skip non-HTTPS URLs:
```typescript
if (!existing && imgUrl.startsWith('https://')) {
```

This prevents any future scenario where a non-URL string leaks into the library table.

No visual/UI changes needed. No backfill — the broken rows just get removed.

