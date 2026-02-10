

## Fix Discover Page and Next Phase Steps

### Current Issues Found

1. **Placeholder images**: All 12 presets use generic Unsplash stock photos instead of actual AI-generated product photography. The gallery looks like a stock photo site, not an AI generation showcase.

2. **Featured presets not highlighted**: The `is_featured` flag exists in the database but the UI treats all cards identically -- no hero section or visual distinction.

3. **No mobile-friendly interactions**: Hover-only overlay for "Copy" and "Use Prompt" buttons means mobile users can't access these actions without opening the detail modal.

4. **Missing toast feedback on copy**: The card's inline "Copy" button copies silently; only the modal copy shows a toast.

5. **Minor console warning**: Badge component ref warning in the detail modal (cosmetic but noisy).

6. **Category "all" icon mismatch**: The "All" filter uses a Sparkles icon which could be confused with a "Featured" filter.

### Fixes to Implement Now

#### Fix 1: Add Featured Hero Section
Show `is_featured` presets in a larger hero row at the top of the gallery, before the regular grid. This gives the page visual hierarchy and a clear starting point.

#### Fix 2: Add Toast on Card Copy
When clicking "Copy" on a card's hover overlay, show a success toast (matching the modal behavior).

#### Fix 3: Mobile-Friendly Card Actions
Add a small action button visible on mobile (not just hover) -- a subtle "..." menu or always-visible "Use" button at the bottom of each card.

#### Fix 4: Better Empty State
When no presets match a search/filter, show a more helpful message suggesting the user try different keywords or browse all categories.

#### Fix 5: Fix Badge Ref Warning
The Badge component in the detail modal triggers a ref warning. Wrap it properly or remove the ref-passing issue.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Discover.tsx` | Add featured hero row, improve empty state |
| `src/components/app/DiscoverCard.tsx` | Add toast on copy, mobile-friendly actions |
| `src/components/app/DiscoverDetailModal.tsx` | Fix Badge ref warning |

### Next Phase Steps (Roadmap)

These are the logical next features to build after the fixes above:

**Phase 2A: Real Content**
- Replace all 12 Unsplash placeholder URLs with actual AI-generated images from your platform
- Add more presets (target 30-50) across all categories
- Fill in `model_name` and `scene_name` fields so users see which model/scene was used

**Phase 2B: User-Generated Discover Feed**
- Let users "Share to Discover" from their Freestyle generation results
- Add a `shared_by_user_id` column to `discover_presets`
- Show user attribution on shared presets
- Moderation: shared presets start as "pending" until approved

**Phase 2C: Save and Like**
- Add a `saved_presets` table (user_id, preset_id)
- Heart/bookmark icon on cards
- "Saved" tab in the filter bar
- Personal collection page

**Phase 2D: Smart Recommendations**
- "Try this with your product" button that takes the preset prompt + user's selected product and opens Freestyle
- "Similar to your recent generations" section based on matching tags/categories
- "Trending" sort option based on copy/use counts (add a `use_count` column)

**Phase 2E: Enhanced Discovery**
- Infinite scroll or pagination for larger preset libraries
- "New this week" badge on recently added presets
- Tag cloud or trending tags section
- Full-text search with tag highlighting

### Technical Details

- Featured hero section uses the existing `is_featured` boolean flag already in the database
- Mobile actions use a persistent bottom bar on each card (visible without hover) using CSS `@media (hover: none)`
- Toast import from `sonner` is already available in the card component file
- Badge ref fix: use `<span>` wrapper or update Badge to forward refs
- No database changes needed for the immediate fixes
- Phase 2B-2E will each require new tables and migrations

