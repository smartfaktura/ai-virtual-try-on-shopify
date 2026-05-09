# Make the home-furniture gallery chips room-based

Right now the `home-furniture` page has two chip rails stacked on top of each other:

1. **"What we cover in home & furniture"** — pills like *Living Room, Bedroom, Dining Room, Home Office* that are just anchor links and don't filter anything.
2. **"Built for every home & furniture shot"** — pills *Furniture / Home Decor*, each revealing a 6–8 image grid.

The user wants these merged: the chips should be the **rooms / subcategories** (Bedroom, Living Room, Dining Room, Home Office, Outdoor, Hallway, Home Decor), and clicking each chip should show only images for that room.

## What changes

### 1. `src/data/aiProductPhotographyBuiltForGrids.ts` — restructure the `"home-furniture"` entry

Replace the current 4 groups (`Furniture · Editorial Room Heroes`, `Furniture · Lived-In Lifestyle`, `Furniture · Aesthetic Color`, `Home Decor · Editorial`, …) with **room-based groups**, matching the page's `subcategories` list:

- Living Room
- Bedroom
- Dining Room
- Home Office
- Outdoor
- Hallway / Entry
- Home Decor

Each group keeps 6–8 cards. We re-bucket the existing `imageId`s by best fit using the current card labels (e.g. `Bedroom Context Lifestyle`, `Reading Corner Lifestyle`, `Coffee Table Context Room`, `Dining or Gathering Context`, `Color Console Story`, `Console Placement Story`, etc.). Where a room has fewer than 6 obvious matches, we top it up with the generic "Editorial Room Heroes" / "Lived-In" / "Aesthetic Color" image IDs that read as that room.

This is a pure data move — no new images are added, just rebucketed and relabeled so each chip has a coherent set.

Because `getBuiltForGroupsForPage` keys by the subject (text before `·`), the chip rail in `CategoryBuiltForEveryCategory` will automatically render *Living Room, Bedroom, Dining Room, Home Office, Outdoor, Hallway, Home Decor* in that order.

### 2. `src/pages/seo/AIProductPhotographyCategory.tsx` — remove the redundant chip strip on this page

The standalone `CategorySubcategoryChips` block above the gallery becomes redundant once the gallery itself is chip-filtered by room. Two options:

- **Preferred:** drop `<CategorySubcategoryChips />` from the render for `home-furniture` only (keep it for other category pages that still need it).
- Alternative: keep it but make its pills scroll the gallery into view AND select the matching chip — heavier change, not needed.

We'll go with the preferred option: a small conditional in the page render to skip `CategorySubcategoryChips` when `page.slug === 'home-furniture'`.

### 3. Heading copy (small tweak)

The gallery heading currently reads *"Built for every home & furniture shot."* with sub *"Switch between home & furniture subcategories…"* — that already fits the new behavior. No copy change needed.

## Out of scope

- No changes to other category pages (jewelry, beauty, fashion, etc.).
- No new image generations — we're only re-bucketing existing `imageId`s.
- No changes to `CategoryBuiltForEveryCategory` component — its chip-grouping logic already supports this.
- No changes to admin SEO slot overrides; slot keys derive from the new subcategory names automatically (existing overrides for `Furniture` / `Home Decor` slots will simply stop applying since those groups go away).

## Risk / notes

- Any admin image overrides previously set on `builtFor_furniture_*` / `builtFor_home-decor_*` slots will be orphaned. Acceptable — this page hasn't been heavily customized via the admin tool, and overrides can be re-applied to the new room-based slots.
