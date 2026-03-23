

# Add Discover Section to Dashboard

## Overview
Create a new `DashboardDiscoverSection` component that shows a category bar + 2 rows of discover images in a grid (not carousel). Clicking a category filters the images. Desktop gets hover "Recreate this" like the Discover page; mobile shows a small visible "Recreate" button on each card.

## Changes

### 1. New file: `src/components/app/DashboardDiscoverSection.tsx`

A self-contained component that:
- Imports `useDiscoverPresets`, `DiscoverCard`, `DiscoverDetailModal`, `DiscoverCategoryBar`
- Uses the same `CATEGORIES` list and `itemMatchesProductCategory` logic from Discover page
- State: `selectedCategory`, `selectedItem` (for detail modal)
- Filters presets by category, takes the first 10 items (5 per row on desktop = 2 rows of 5, 2 columns on mobile = ~5 rows)
- Renders a masonry-style grid identical to Discover page (flex columns, gap-1) but capped at 10 items
- On desktop: `DiscoverCard` with `onRecreate` for hover overlay (same as Discover page)
- On mobile: render a small persistent "Recreate" button below each card image (not hidden behind hover)
- Opens `DiscoverDetailModal` on card click with `onUseItem` navigation logic (same as Discover page)
- Shows skeleton loading state while presets load
- Section header: "Discover" with a "View all" link to `/app/discover`
- Uses responsive column count: 2 on mobile, 3 on tablet, 5 on desktop

### 2. `src/pages/Dashboard.tsx`

**New user view** (line ~387, after Explore Workflows section):
- Insert `<DashboardDiscoverSection />` before `<DashboardTeamCarousel />`

**Returning user view** (line ~480, after Recent Creations):
- Insert `<DashboardDiscoverSection />` before the "Create" section

### Technical details

- Reuse `CATEGORIES` constant and `PRODUCT_CATEGORY_MAP` + `itemMatchesProductCategory` from Discover — extract to a shared location or inline in the new component
- The component only loads `discover_presets` (already cached via React Query with 10min staleTime), no scenes — keeps it lightweight
- Column count uses the same responsive logic as Discover page but with 5 columns max for dashboard
- Mobile "Recreate" button: a small `text-xs` button with `ArrowRight` icon positioned below the image overlay, always visible (not hover-dependent)

### Files
- `src/components/app/DashboardDiscoverSection.tsx` — new component
- `src/pages/Dashboard.tsx` — add section to both new-user and returning-user views

