

# Add Date Prefix to Storage Filenames (Tryon + Freestyle)

## What Changes

Add a `YYYY-MM-DD_` prefix to generated image filenames in storage. Current format: `{userId}/{uuid}.png` → New format: `{userId}/2026-04-01_{uuid}.png`

This is a safe, non-breaking change — it only affects newly generated files. Existing images and their URLs remain untouched.

## Files to Update

### 1. `supabase/functions/generate-tryon/index.ts` (line 276)
Change the fileName construction to include today's date:
```
const fileName = `${userId}/${new Date().toISOString().slice(0,10)}_${crypto.randomUUID()}.${fmt.ext}`;
```

### 2. `supabase/functions/generate-freestyle/index.ts` (lines 613 and 660)
Same change in both upload helper functions — add the date prefix to the filename.

### 3. Redeploy edge functions
Deploy `generate-tryon` and `generate-freestyle` to apply the changes.

## Why It's Safe
- Only changes the filename pattern for **new** uploads
- Existing URLs/files are unchanged — nothing breaks
- Storage paths remain under the same `{userId}/` folder
- No database schema changes needed
- No client-side changes needed (URLs are returned dynamically)

