## Why you only see 8 videos

`src/pages/VideoHub.tsx` line 356 hard-caps the Recent Videos section:
```ts
const recentVideos = completedVideos.slice(0, 8);
```
The underlying history hook already loads all your completed videos — they're just hidden by this slice. There is no "Load more" control.

## Fix

Make the visible count stateful and add a "Load more" button.

### Changes in `src/pages/VideoHub.tsx`

1. Add state for visible count:
   ```ts
   const [visibleCount, setVisibleCount] = useState(8);
   ```
2. Replace the hard slice with:
   ```ts
   const recentVideos = completedVideos.slice(0, visibleCount);
   const hasMore = completedVideos.length > visibleCount;
   ```
3. Update the section subtitle so it no longer says "Your latest 8 generations" — switch to a dynamic count like `Showing {recentVideos.length} of {completedVideos.length}`.
4. Below the grid (inside the Recent Videos section), render a centered "Load more" button when `hasMore`, incrementing `visibleCount` by 8 per click:
   ```tsx
   {hasMore && (
     <div className="flex justify-center pt-2">
       <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + 8)}>
         Load more
       </Button>
     </div>
   )}
   ```
5. Reset `visibleCount` back to 8 if the user toggles out of select mode after a bulk delete (optional polish — only if `completedVideos.length < visibleCount`, clamp).

### Out of scope
- No backend / pagination changes — history is already fetched in full by the existing hook.
- No design system changes; uses existing `Button` variants and current grid.
