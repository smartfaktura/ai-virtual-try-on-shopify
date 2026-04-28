# Fix: Discover gallery stuck on skeletons on /compare

## What's actually happening

The gallery on `/compare` (and the four `/compare/vovv-vs-*` pages) shows only skeleton placeholders because the Supabase REST request the component makes is extremely slow / sometimes times out for anonymous visitors:

- Component query: `from('discover_presets').select('id,title,image_url,slug').order('sort_order').limit(12)`
- Browser network log: returned **HTTP 500** with Postgres error `57014 — canceling statement due to statement timeout`
- Reproduced from the sandbox: same anon request takes **7–22 seconds** to return when it doesn't time out
- Same query run server-side (no anon, no PostgREST) executes in **~140 ms**

Root causes:
1. `discover_presets` has **no index on `sort_order`** (and every row has `sort_order = 0`), so PostgREST does a sequential scan + sort on every anon request.
2. The table has **two overlapping SELECT RLS policies** (one for `anon`, one for `public` checking `auth.role() = 'authenticated'`). PostgREST evaluates both per row, amplifying latency on the anon path.
3. The component has no error fallback — when the request errors or stays pending, it just renders skeletons indefinitely.

## Plan

### 1. Database migration
- Add index: `CREATE INDEX IF NOT EXISTS idx_discover_presets_sort_created ON public.discover_presets (sort_order ASC, created_at DESC);`
- Drop the redundant `Authenticated users can view discover presets` SELECT policy. The existing `Anyone can view discover presets publicly` policy (anon, USING true) already covers all read access, including authenticated users (anon role is granted to everyone). This removes duplicate per-row evaluation.

### 2. Make `DiscoverGalleryStrip` resilient (`src/components/seo/compare/DiscoverGalleryStrip.tsx`)
- Order by `created_at DESC` instead of `sort_order` (more meaningful — newest first — and uses the new composite index).
- Read `error` and `isLoading` from `useQuery`; render skeletons only while `isLoading`, render the static fallback if `error` or empty data.
- Add a small **curated static fallback array** of 8–12 known-good Discover image URLs + slugs (taken from the live Discover feed) so the section always shows real visuals even if the API is unavailable. Each fallback tile still deep-links to `/discover/{slug}`.
- Tighten React Query options: `retry: 1`, `staleTime: 30 min`, `gcTime: 60 min`, `refetchOnWindowFocus: false`.

### 3. No changes to
- Homepage, `/app/*` routes, the Discover page itself, or the comparison page copy.
- Existing RLS for non-SELECT operations (admin insert/update/delete policies stay).

## Files touched
- New SQL migration (index + drop redundant policy)
- `src/components/seo/compare/DiscoverGalleryStrip.tsx`

## Outcome
- Anon REST request becomes consistently fast (single policy + indexed sort).
- Even if the API is temporarily slow, `/compare` and the four comparison pages immediately render real Discover imagery from the static fallback instead of empty skeletons.
