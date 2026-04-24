

## QA + Performance audit: Library / Freestyle / Discover image opening

### What I checked
- `LibraryDetailModal.tsx` (Library + Freestyle saved tab + Workflow recent + Recent Creations)
- `DiscoverDetailModal.tsx` + `PublicDiscoverDetailModal.tsx` (Discover, PublicDiscover, PublicFreestyle)
- `ImageLightbox.tsx` (Generate, ProductImages results, JobDetailModal, TextToProduct, CatalogHub)
- `FreestyleGallery.tsx` (`ImageCard` for the generation grid)
- `ShimmerImage.tsx` (shared placeholder)
- Discover/PublicDiscover click → modal handlers, view-count writes, react-query hooks

### What is working well
- All three modals already mount via `createPortal` → no AppShell layout interference
- `ShimmerImage` already detects cached images via `imgRef` and skips shimmer when `img.complete`
- Discover uses stable column assignment + react-query `staleTime: 10min` cache, so tab switches stay instant
- Lightbox keyboard navigation (← → Esc) and body-scroll lock all wired correctly
- Click handlers on all card variants stop propagation correctly, so action buttons inside cards don't accidentally open the modal

### Issues found and root causes

**1. `LibraryDetailModal` resets index on every parent re-render**
`useEffect(() => setCurrentIndex(initialIndex), [initialIndex, open])` runs every time `open` flips OR `initialIndex` changes. When the parent's `items` array refetches (react-query background refresh while modal is open), the index can snap back to `initialIndex` and show the wrong image briefly. **Fix:** drop `open` from deps; only sync when `open` transitions false→true or `initialIndex` changes while closed.

**2. Lightbox-image has no reserved aspect → visible jump on open**
In both `LibraryDetailModal` and `DiscoverDetailModal`, the left pane renders `<ShimmerImage src=... className="max-h-[...] object-contain">` with no aspect. Until the image loads, the wrapper collapses to the shimmer's intrinsic 0×0 inside a flex container, then jumps to full size on load. **Fix:** read `aspectRatio` from `LibraryItem` (already on the type) / `DiscoverItem` (use `getDiscoverItemAspectRatio`) and pass `aspectRatio` to `ShimmerImage`. Falls back to `4/5` when unknown.

**3. `ImageLightbox` main image: same jump, plus blocks render before load**
`<img key={currentIndex} src={currentImage}>` has no width/height/aspect reservation. When the user clicks Next, the previous image disappears and the next one pops in only after decode → visible flash. **Fix:** wrap in a container with a min-aspect (use `4/5` default), keep the previous `<img>` mounted underneath via `key` swap with `opacity` crossfade, and add `decoding="async" fetchPriority="high"` on the active image.

**4. `DiscoverDetailModal` always-mounted heavy admin queries**
`useDiscoverPickerOptions(!!isAdmin && open)` is fine, but `useQuery(['workflows-list'])` and `useQuery(['my-products'], { enabled: !!isAdmin })` fire on every modal open even when the user is not admin (`workflows-list` has no `enabled` guard) and the data is never used by non-admins. Adds a network round-trip to every Discover modal open. **Fix:** add `enabled: !!isAdmin` to the workflows query, and gate the entire admin metadata block behind `isAdmin` as it already is.

**5. Discover view-count: insert + read = two requests per open**
On every selection, code inserts a row into `discover_item_views` AND fires a `useQuery` `count: 'exact'` against the same table. The count query has no `staleTime`, so switching between items refetches every time. **Fix:** add `staleTime: 60_000`, and skip the view insert + count query for unauthenticated users (already guarded for insert, not for count's `enabled`). Also debounce the insert by 250 ms so rapid arrow-key navigation doesn't hammer the table.

**6. `ImageLightbox` re-creates handler closures every render**
`onClick={() => onSelect(currentIndex)}` etc. create new functions on every keystroke / hover. Minor, but with 6 buttons × 2 device modes that's 12 fresh closures per parent re-render. **Fix:** wrap the per-action handlers in `useCallback` keyed on `currentIndex`.

**7. `FreestyleGallery.ImageCard` always uses `loading="eager"` + `decoding="async"`**
Every tile in the freestyle grid is force-eager, so a session with 40 generations fetches all 40 immediately, fighting bandwidth with the lightbox image when the user clicks one. **Fix:** mark only the first 8 (above fold) as eager; rest `loading="lazy"`. Pure perf, no visual change.

**8. Console warning: "Function components cannot be given refs" — `OptionCard`**
`PromptBuilderQuiz`'s `OptionCard` is rendered inside Radix Sheet/Dialog primitives that pass refs to the root child. `OptionCard` is a plain function component → React warns. **Fix:** wrap with `React.forwardRef` and forward to the inner `<button>`.

**9. `LibraryDetailModal` invalidates 3 query keys on delete**
`['library']`, `['recent-creations']`, `['generation_jobs']` — fine, but `['recent-creations']` triggers a refetch of every workflow recent row mounted in the dashboard even when the deleted item lives in Freestyle. **Fix:** scope to the source: only invalidate `['library']` + the matching one (`['freestyle-images']` for freestyle deletes, `['generation_jobs']` for jobs).

**10. Mobile lightbox arrow buttons are tiny + close to edges on iOS safe area**
Already fixed with `w-10 h-10` mobile branch in `ImageLightbox`, but `LibraryDetailModal` left/right buttons sit inside the image padding; on iPhone landscape they overlap the image corners. **Fix:** raise z-index to `z-30` and add `safe-area-inset-x` padding on the parent pane.

### Plan — files to change (no behavior or layout regressions)

```text
src/components/app/LibraryDetailModal.tsx
  • aspect-aware ShimmerImage wrapper (reserve box → no jump)
  • drop `open` from initialIndex sync effect
  • scope query invalidation by source
  • z-index + safe-area for mobile arrows

src/components/app/DiscoverDetailModal.tsx
  • aspect-aware ShimmerImage wrapper (use getDiscoverItemAspectRatio)
  • add enabled:!!isAdmin to workflows-list query
  • add staleTime:60_000 + 250ms debounced insert for view tracking

src/components/app/ImageLightbox.tsx
  • reserve aspect on the displayed image, crossfade between slides
  • decoding="async" + fetchPriority="high" on active image
  • useCallback for per-action handlers

src/components/app/freestyle/FreestyleGallery.tsx
  • eager only for first 8 ImageCards; rest lazy
  • (no other changes; click handlers already correct)

src/components/app/freestyle/PromptBuilderQuiz.tsx
  • forwardRef on OptionCard → kills console warning
```

### Out of scope
- No data hook / RLS / DB changes
- No taxonomy or category logic changes
- No modal redesign or layout restructuring
- No Discover masonry changes (recently completed)
- No Generate / TextToProduct / Catalog page edits beyond what `ImageLightbox` already provides

### Expected result
- Opening any image from Library, Freestyle, or Discover lands in a pre-sized container — no flash, no jump.
- Lightbox prev/next crossfades instead of blanking.
- Discover modal opens with one fewer network call for non-admins; rapid arrow navigation no longer spams the views table.
- Freestyle grid stops eagerly fetching 40+ images at once → faster lightbox open.
- Console "Function components cannot be given refs" warning gone.
- Zero risk to action buttons, recreate flow, save, admin tools, routing, or any data hook.

