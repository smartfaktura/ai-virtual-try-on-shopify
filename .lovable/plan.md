## Plan — Preselect Wedding Dress on Dashboard "Steal the Look"

### Root cause

`src/components/app/DashboardDiscoverSection.tsx` has a local `SUBTYPE_TO_DISCOVER` map (lines 57-85) that resolves the user's first onboarding sub-type slug to the matching Discover family. Wedding Dress was added to onboarding (`wedding-dress`) but the map was never updated, so when the user's `product_subcategories[0]` is `'wedding-dress'`, lookup returns undefined, the function falls through to the family-id branch, and the Wedding Dress sub-pill is never preselected.

### Fix — single line in `src/components/app/DashboardDiscoverSection.tsx`

In the Fashion block of `SUBTYPE_TO_DISCOVER` (line 59), add `'wedding-dress': 'fashion'` alongside `garments`, `hoodies`, `dresses`, etc.

That's enough — the existing logic then:
1. Maps `wedding-dress` → `fashion` family
2. Calls `getDiscoverSubtypes('fashion')` which already includes `wedding-dress` (from yesterday's onboardingTaxonomy change)
3. Sets `defaultSubtype = 'wedding-dress'`, reorders pills so it appears right after Featured, and selects it

### Out of scope

No other files. The pill already exists in the row (visible in screenshot) and item matching already handles the slug.

### Risk

None — pure constant addition.