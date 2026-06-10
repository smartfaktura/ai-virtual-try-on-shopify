## Goal

Update the `/ai-product-photography/supplements-wellness` page to feature the new wellness scenes now live in the Product Visual Library (family=wellness), replacing the older imagery currently rendered in the hero and "Scene examples" grid.

## What changes

Single file edit: `src/data/aiProductPhotographyCategoryPages.ts` — the `supplements-wellness` entry (currently lines 762–833). Everything else (copy, SEO, FAQs, related categories) stays the same.

### Hero image
- `heroImageId`: replace `1776247491181-ox42m3` with `1779945336044-l182le` (new "Soft Ritual Hold" — editorial wellness routine, warm hand-held bottle).
- Update `heroAlt` to match.

### Scene examples grid (8 tiles)
Swap all 8 to a curated mix of the new wellness library scenes, balanced across sub-categories:

| # | Label | Sub-category | New imageId | Source title |
|---|---|---|---|---|
| 1 | Soft Ritual Hold | Editorial Wellness Routine | `1779945336044-l182le` | Soft Ritual Hold |
| 2 | Pure Joy Glow | Editorial Wellness Routine | `1779945504810-74fe51` | Pure Joy Glow |
| 3 | Glossed Wellness Close-Up | Editorial Wellness Routine | `1779910171858-94bets` | Glossed Wellness Close-Up |
| 4 | Sunlit Ritual Hand Hold | Editorial Wellness Routine | `1779911299275-6ksf6d` | Sunlit Ritual Hand Hold |
| 5 | Coastal Cliff | Outdoor Editorial | `1779910172676-4krpnw` | Coastal Cliff |
| 6 | Beachside Supplement Ritual | Outdoor Editorial | `1779911321508-v9n6qu` | Beachside Supplement Ritual |
| 7 | Sky Product Portrait | Creative Shots | `1779908989824-srme6q` | Sky Product Portrait |
| 8 | Brutalist Concrete | Creative Shots | `1779910171054-jwwlkk` | Brutalist Concrete |

Each tile keeps `collectionLabel: 'Supplements & Wellness'`, gets a fresh `alt` describing the scene, and the existing `subcategories` array gets `'Outdoor Editorial'` appended so the new theme is reflected in the on-page chip list.

## Technical notes

- `imageId` is the bare filename (no extension) consumed by `PREVIEW(id)` in the same file, which builds the `scene-previews/{id}.jpg` URL. All 9 chosen IDs are `.jpg` (no PNG-list entry needed).
- No schema, RLS, or component changes — only data array edits.
- The Visual Library page (`/product-visual-library`) is unaffected; it reads directly from `product_image_scenes`.

## Out of scope

- No new heroCollage section (this page intentionally uses a single hero image).
- Copy, FAQs, SEO meta, and related-categories stay untouched.
- If you want different specific scenes from the wellness family swapped in, share the titles and I'll restructure the table before building.
