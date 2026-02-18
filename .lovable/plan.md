

## Fix First-Run Dashboard Issues

### Problem Summary
The first-run dashboard (new user state) has four issues:
1. **Images not loading** in "What You Can Create" gallery, onboarding checklist thumbnails, and team avatars -- all reference files in the `landing-assets` storage bucket that may not exist or may be returning 404s
2. **"Two Ways to Create" section** should be removed -- user says it's not needed
3. **"Explore Workflows" layout is broken** -- the `WorkflowCard` component is designed as a large horizontal row card (with side-by-side image + text), but the dashboard renders them in a `grid-cols-3` grid, causing severe content truncation and overflow
4. **React warning** about `FloatingEl` not using `forwardRef` in `WorkflowAnimatedThumbnail`

### Plan

**1. Remove "Two Ways to Create" section from first-run dashboard**
- In `src/pages/Dashboard.tsx`, delete the `GenerationModeCards` section block (the "Two Ways to Create" heading and `<GenerationModeCards />` component) from the first-run (isNewUser) return block.

**2. Fix "Explore Workflows" layout**
- The current grid (`grid-cols-2 lg:grid-cols-3`) cramps the large `WorkflowCard` components which are designed for full-width display.
- Change the layout to a **single-column stack** (`grid-cols-1`) so each `WorkflowCard` gets full width and its internal `flex-row` layout works properly. Optionally use `lg:grid-cols-2` for desktop.
- Alternatively, pass a `reversed` prop to alternate card layouts.

**3. Fix broken/missing images**
- The `RecentCreationsGallery` placeholder images, `OnboardingChecklist` thumbnails, and `DashboardTeamCarousel` avatars all use `getLandingAssetUrl()` paths. If these files don't exist in the storage bucket, they'll show as blank grey cards.
- Add fallback handling: for the gallery and checklist, provide local fallback images from `public/placeholder.svg` when the storage URLs fail to load.
- For team avatars, add an `onError` handler on `<img>` elements to show initials or a placeholder.

**4. Fix WorkflowAnimatedThumbnail forwardRef warning**
- Wrap the `FloatingEl` function component with `React.forwardRef` to eliminate the React console warning.

### Technical Details

**Files to modify:**

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Remove "Two Ways to Create" section; change Explore Workflows grid from `grid-cols-2 md:grid-cols-2 lg:grid-cols-3` to `grid-cols-1 lg:grid-cols-2` |
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Wrap `FloatingEl` with `React.forwardRef` |
| `src/components/app/RecentCreationsGallery.tsx` | Add `onError` fallback to `ShimmerImage` for placeholder images |
| `src/components/app/OnboardingChecklist.tsx` | Add `onError` fallback to thumbnail `<img>` elements |
| `src/components/app/DashboardTeamCarousel.tsx` | Add `onError` fallback to avatar `<img>` elements |

