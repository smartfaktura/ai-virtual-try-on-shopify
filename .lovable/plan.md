

# Trend Watch UI Improvements

## Changes

### 1. Remove profile image avatar from WatchAccountCard
- **File**: `src/components/app/trend-watch/WatchAccountCard.tsx`
- Remove the avatar `div` (lines 41-49), keep only name/username/badges

### 2. Add "Refresh All" button to toolbar
- **File**: `src/pages/AdminTrendWatch.tsx`
- Add a "Refresh All" button next to "Add Account" that loops through all active accounts and calls `handleSync` for each sequentially

### 3. Bigger thumbnails, 6 per row, grid layout
- **File**: `src/components/app/trend-watch/PostThumbnailRow.tsx`
- Change from horizontal scroll `flex` to a CSS grid: `grid grid-cols-6 gap-2`
- Increase thumbnail size from `w-[72px] h-[72px]` to `w-full aspect-square` (fills grid cell)

### 4. Show 12 latest posts instead of 9
- **File**: `src/hooks/useWatchAccounts.ts`
- Change `.limit(9)` to `.limit(12)` in `useWatchPosts`
- Change `grouped[key].length < 9` to `< 12` in `useAllWatchPosts`
- **File**: `supabase/functions/fetch-instagram-feed/index.ts`
- Change `posts.slice(0, 9)` to `posts.slice(0, 12)`

### 5. Fix post detail drawer image aspect ratio
- **File**: `src/components/app/trend-watch/PostDetailDrawer.tsx`
- Change `max-h-80` to `aspect-square` with `object-contain` on a neutral background so the image displays in its natural proportions without cropping

### 6. Skip video content from feed
- **File**: `supabase/functions/fetch-instagram-feed/index.ts`
- After parsing posts array, filter out videos before slicing: `posts = posts.filter(p => !p.is_video && !p.video_versions?.length && p.__typename !== 'GraphVideo')`
- This ensures only image posts are stored

## Files Modified
- `src/components/app/trend-watch/WatchAccountCard.tsx` -- remove avatar
- `src/pages/AdminTrendWatch.tsx` -- add Refresh All button
- `src/components/app/trend-watch/PostThumbnailRow.tsx` -- grid layout, bigger images
- `src/hooks/useWatchAccounts.ts` -- limit 12
- `supabase/functions/fetch-instagram-feed/index.ts` -- 12 posts, skip videos
- `src/components/app/trend-watch/PostDetailDrawer.tsx` -- fix image display

