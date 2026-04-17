

## Tighten gap between category bar and image grid on /app/discover

### Issue
Screenshot shows large empty space between the category filter row (All / Fashion / Beauty…) and the first row of images. User wants images to appear right after the categories.

### Root cause
`PublicDiscover.tsx` (the public page). But screenshot shows `/app/discover` (authenticated) which sits inside `AppShell`. Need to check the authenticated `Discover.tsx` page wrapper. The outer container uses `space-y-8` (or similar) PLUS `PublicDiscoverCategoryBar` likely has its own bottom margin/padding, compounding into a big gap.

Need to verify which component renders `/app/discover` in the auth shell, and the spacing classes on the wrapper + category bar.

### Plan
1. Locate `/app/discover` route component (likely `src/pages/Discover.tsx`).
2. Inspect wrapper `space-y-*` and `DiscoverCategoryBar` margins.
3. Reduce top-level vertical rhythm from `space-y-8` → `space-y-4` (or remove redundant `mt-*`/`mb-*` on the category bar) so the grid sits ~16px below the chips instead of ~48-64px.
4. Verify mobile + desktop both look tight.

### Files likely changed
- `src/pages/Discover.tsx` (auth version) — reduce wrapper spacing.
- Possibly `src/components/app/DiscoverCategoryBar.tsx` if it adds its own `mb-*`.

### Acceptance
- On `/app/discover`, the image grid starts immediately below the category chip row (~16px gap), matching dashboard rhythm.
- No regression on mobile or in the public `/discover` page.

