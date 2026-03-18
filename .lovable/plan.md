

## Problem: Backfill Junk Rows in Your Library

A previous edit ran a "safety reconciliation" that inserted **65 bogus rows** into `freestyle_generations` — all with the exact same timestamp (`2026-03-18 09:22:18.712017`). These include:

- **33 rows** with `data:` base64 URIs (massive blobs) — these render as **white/blank images**
- **4 rows** with `image_url = 'saved_to_storage'` — broken placeholders
- **28 rows** with real Supabase URLs — **duplicates** of images already stored in `generation_jobs`

Your actual legitimate data (846 freestyle rows before this, plus 160 generation_jobs) is fine.

## Fix

### 1. Delete the 65 backfilled junk rows (database cleanup)
```sql
DELETE FROM freestyle_generations
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'info@tsimkus.lt' LIMIT 1)
  AND created_at = '2026-03-18 09:22:18.712017+00';
```
This removes exactly the 65 rows inserted by the broken backfill. No legitimate data shares this exact timestamp.

### 2. Add defensive filtering in `useLibraryItems.ts`
Filter out `data:` URIs and broken URLs from freestyle results — same guard that already exists for generation_jobs (line 79):

```typescript
// In the freestyle loop, skip data: URIs and broken placeholders
if (!f.image_url || f.image_url.startsWith('data:') || f.image_url === 'saved_to_storage') continue;
```

This prevents any future bad rows from appearing in the library grid.

### Files
- **Database**: One-time cleanup query to delete 65 rows
- **`src/hooks/useLibraryItems.ts`**: Add `data:` / broken URL filter to the freestyle loop (~line 109)

No other changes needed. Your 846 real freestyle generations and 160 generation_jobs remain untouched.

