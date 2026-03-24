

# Fix Share Link to Include Unique Asset URL

## Problem
Share links just copy `https://vovv.ai/discover` — not a unique URL for the specific item being viewed.

## Solution
Append a query parameter `?item={type}-{id}` to the share URL so each asset gets a unique shareable link. E.g. `https://vovv.ai/discover?item=preset-abc123`.

## Changes

### 1. `src/components/app/PublicDiscoverDetailModal.tsx`
Change share URL from `${SITE_URL}/discover` to `${SITE_URL}/discover?item=${item.type === 'preset' ? `preset-${item.data.id}` : `scene-${item.data.poseId}`}`

### 2. `src/components/app/DiscoverDetailModal.tsx`
Same change — construct unique URL with item type and ID.

### 3. `src/pages/PublicDiscover.tsx` — auto-open modal from URL
On mount, read `?item=` query param. If present, parse the type/id, find the matching item in loaded data, and auto-open the detail modal for it.

### 4. `src/pages/Discover.tsx` — auto-open modal from URL
Same logic for the authenticated discover page.

### Files
- `src/components/app/PublicDiscoverDetailModal.tsx`
- `src/components/app/DiscoverDetailModal.tsx`
- `src/pages/PublicDiscover.tsx`
- `src/pages/Discover.tsx`

