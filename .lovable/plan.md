# Fix: Swimwear presets not appearing on Discover

## What I found

You added "Sun Chaser Girl" and "Island Flash Hour" to Discover. Both are saved correctly in the database:

| Title | category | subcategory | image_url |
|---|---|---|---|
| Sun Chaser Girl | fashion | swimwear | loads (200) |
| Island Flash Hour | fashion | swimwear | loads (200) |
| Beach Day Bliss (old) | fashion | swimwear | loads (200) |

I verified `/app/discover` → Fashion → Swimwear in the browser. ~13 swimwear scene cards show, but **none of the 3 swimwear presets** appear (including the March one). So this is a pre-existing bug affecting every preset tagged `subcategory = swimwear`, not just the new ones.

The filter logic in `itemMatchesDiscoverFilter` looks correct on paper (cat=fashion + sub=swimwear should pass). So the items are being dropped somewhere between `useDiscoverPresets` returning them and the grid rendering them.

## Plan

1. **Reproduce in code**, not just the UI — add a temporary debug log in `src/pages/Discover.tsx` for the 3 preset titles to see at which step they disappear:
   - after `useDiscoverPresets` (raw fetch)
   - after the `allItems` merge / recommended-titles dedupe
   - after `filtered` (taxonomy filter)
   - after `sorted` / `visibleCount` slice
2. **Apply the fix** for the step that drops them. Most likely candidates based on the code:
   - dedupe against `recommendedPoses` titles (line 319) accidentally matching
   - sort/bucket logic pushing presets past `visibleCount=24` when the user has onboarding family prefs
   - subcategory string mismatch (case / whitespace)
3. **Remove the debug log** and verify the 3 cards appear under Fashion → Swimwear and on the "All" tab.
4. Repeat the spot-check on another subcategory (e.g. dresses) to make sure the fix is general, not swimwear-only.

## Scope

- Frontend only. `src/pages/Discover.tsx` and possibly `src/pages/PublicDiscover.tsx` (same merge pattern). No DB changes, no preset edits.
- No new fields, no new UI.

## Out of scope

- Redesigning the Discover filter UI.
- Touching `useDiscoverPresets` query or RLS.
