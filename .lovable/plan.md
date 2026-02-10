

## Redesign Discover into a Pinterest-Style Masonry Grid + Integrate Scenes

### What changes

**1. Remove card metadata clutter**
Strip the bottom info section (title, category badge, aspect ratio badge) from `DiscoverCard`. The grid becomes image-only with hover overlay -- just like the Pinterest/Kive reference. No titles, no badges, no spacing between cards.

**2. Pinterest-style masonry layout (no gaps, mixed aspect ratios)**
Replace the fixed-aspect-ratio grid with a CSS columns-based masonry layout where images flow naturally at their native aspect ratios. Minimal gap (4-8px) between items. Cards have no bottom padding -- image fills the entire card.

**3. Integrate Scenes into Discover**
Add a new source type to the Discover feed: platform Scenes (from `mockTryOnPoses`). These appear in the grid alongside presets but behave differently on click:
- **Platform presets** (from `discover_presets` table): Click opens detail modal with "Use Prompt" -> navigates to Freestyle with prompt pre-filled
- **Scene cards** (from scene library): Click selects that scene and opens Freestyle with the scene pre-selected via URL param (e.g. `?scene=pose_001`)

Both types look identical in the grid -- just images. The difference is only in the click behavior.

**4. Simplified category filters**
Keep the horizontal filter bar but remove verbose labels. Categories become: All, Scenes, Cinematic, Commercial, Photography, Styling, Ads, Lifestyle.

### Files to modify

| File | Change |
|------|--------|
| `src/pages/Discover.tsx` | Merge scenes into feed, masonry layout, simplified filters |
| `src/components/app/DiscoverCard.tsx` | Remove bottom info section, image-only card, keep hover overlay |
| `src/components/app/DiscoverDetailModal.tsx` | Minor: handle scene-type presets differently |
| `src/pages/Freestyle.tsx` | Read `?scene=poseId` URL param to pre-select scene |
| `src/hooks/useDiscoverPresets.ts` | No change (DB presets stay the same) |

### Technical approach

**Unified feed item type:**
```text
type DiscoverItem = 
  | { type: 'preset'; data: DiscoverPreset }
  | { type: 'scene'; data: TryOnPose }
```

Both render as image cards. Scenes use their `previewUrl` as the image. On click:
- Preset: opens detail modal (existing behavior)
- Scene: navigates directly to `/app/freestyle?scene={poseId}`

**Masonry layout** using CSS `columns` property:
- Mobile: 2 columns
- Tablet: 3 columns  
- Desktop: 4-5 columns
- Gap: 4px (tight, like the reference)
- Each card uses `break-inside: avoid` with natural image aspect ratios

**Card simplification:**
- Remove `<div className="p-3 space-y-2">` bottom section entirely
- Image fills 100% of card with small border-radius
- Hover overlay stays (Copy + Use Prompt for presets, "Use Scene" for scenes)
- Mobile button becomes a small icon overlay instead of full-width button

### Freestyle scene param integration
When arriving at Freestyle with `?scene=pose_001`, find the matching scene from `mockTryOnPoses` and set it as `selectedScene` on mount, same pattern as the existing prompt/ratio/quality params.

