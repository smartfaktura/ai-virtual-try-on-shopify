

# Admin-Only AI Model Badge on Library/Freestyle Cards

## What It Does
Shows a small badge (e.g., "Pro", "Flash", "Seedream") on image cards visible only to admin users, indicating which AI model generated each image. Useful for quality checking.

## Difficulty
Low — 3 small changes across 3 areas.

## Steps

### 1. Add `provider_used` Column to `freestyle_generations`
New database migration to add a nullable text column:
```sql
ALTER TABLE public.freestyle_generations ADD COLUMN provider_used text;
```
No RLS changes needed (same row-level access applies).

### 2. Save Provider During Generation
In `supabase/functions/generate-freestyle/index.ts`, update the `saveFreestyleGeneration` function (~line 790) to include the provider info in `insertData`:
```typescript
insertData.provider_used = body.providerUsed || null;
```
Then pass the resolved provider name (e.g., `"nanobanana-pro"`, `"nanobanana-flash"`, `"seedream-4.5"`) from the main handler into the body when calling `saveFreestyleGeneration`. This is derived from existing variables `useSeedream`, `aiModel`, etc.

### 3. Read Provider in Library Hook
In `src/hooks/useLibraryItems.ts`, add `provider_used` to the freestyle query select string and map it onto the `LibraryItem`.

### 4. Add `providerUsed` to LibraryItem Type
In `src/components/app/LibraryImageCard.tsx`, add optional `providerUsed?: string` to the `LibraryItem` interface.

### 5. Show Admin Badge on Cards
In `LibraryImageCard`, conditionally render a small badge when the user is admin:
```tsx
{isAdmin && item.providerUsed && (
  <Badge className="absolute top-3 left-3 z-10 text-[9px] bg-black/60 text-white">
    {item.providerUsed === 'seedream-4.5' ? 'SDR' : item.providerUsed.includes('pro') ? 'PRO' : 'FLASH'}
  </Badge>
)}
```
Pass `isAdmin` as a prop from the parent or use the `useIsAdmin` hook at the card level.

### 6. Same Badge on RecentCreationsGallery (Dashboard)
Add provider info to the dashboard recent creations query and show the badge there too for admins.

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — save provider
- `src/hooks/useLibraryItems.ts` — fetch provider
- `src/components/app/LibraryImageCard.tsx` — type + badge
- `src/components/app/RecentCreationsGallery.tsx` — fetch + badge
- New migration for `provider_used` column

## Notes
- Existing images won't have the badge (column will be null) — only new generations going forward
- Badge is admin-only, invisible to regular users

