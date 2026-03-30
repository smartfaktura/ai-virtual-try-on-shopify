

## Fix Sample Product Images + Open Video to All Users

### 1. Sample product images — fix quality, borders, and aspect ratio

**File: `src/components/app/freestyle/ProductSelectorChip.tsx`** (line 127)

Current: `object-contain bg-muted/30` — images float inside the container with whitespace and no fill.

Change to: `object-cover` so images fill the 1:1 aspect-square container edge-to-edge. Also add `rounded-xl` to the image itself to match the container rounding. The `getOptimizedUrl` with `quality: 60` is already applied, so optimization is in place — but sample images are local files served as-is. Since they're small static assets this is acceptable.

The grey border is from the `rounded-xl` container outline being visible against the `bg-muted` background. Fix by removing `bg-muted` from the container or ensuring the image covers it entirely with `object-cover`.

### 2. Open Video to all users

Three locations gate video behind admin/coming-soon:

**File: `src/components/app/AppShell.tsx`** (line 54)
- Remove `comingSoon: true` from the Video nav item so all users can click it.

**File: `src/pages/VideoGenerate.tsx`** (lines 129-135)
- Remove the `isAdmin` gate — render `VideoGenerateInner` for everyone, delete `VideoComingSoon` component.

**File: `src/pages/VideoHub.tsx`** — The sub-workflow cards (Start & End, Ad Sequence, etc.) have `comingSoon` props. These are separate future workflows, so they stay as-is. Only the main Video nav entry and the legacy generate page need ungating.

### Files to edit
- `src/components/app/freestyle/ProductSelectorChip.tsx` — `object-cover` on sample images, clean container bg
- `src/components/app/AppShell.tsx` — Remove `comingSoon: true` from Video nav
- `src/pages/VideoGenerate.tsx` — Remove admin-only gate

