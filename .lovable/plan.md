# Refresh Home & Furniture SEO category page

The `/ai-product-photography/home-furniture` page is stale. The live scene library has grown from ~60 to **~150 scenes** across many new room types (Living Room, Bedroom, Dining Room, Hallway, Home Office, Outdoor Furniture, Child Room, Editorial Room Heroes, Lived-In Lifestyle, Studio) plus expanded Home Decor (Editorial Object Studio, Console / Shelf Lifestyle, Aesthetic Color Decor, Grouped Styling). The page still advertises 60 shots and a thin sample of scene examples.

This plan refreshes the page content only — no DB or component changes.

## Scope

Edit two data files. No component, route, or schema changes.

### 1. `src/data/aiProductPhotographyCategories.ts` — hub card

Update the `home-furniture` entry:

- `shotCount`: `60` → `150`
- `subcategories`: extend to reflect new rooms — `['Living Room', 'Bedroom', 'Dining Room', 'Home Office', 'Hallway', 'Outdoor Furniture', 'Home Decor', 'Vases', 'Candles', 'Lighting', 'Sofas', 'Chairs']`
- `description`: rewrite to mention room scenes (living, bedroom, dining, home office, outdoor) alongside decor
- `previewImages`: swap to 3 fresh hero-quality previews from the new rooms (one Living Room, one Bedroom, one Decor) — e.g. `1778050204000-gl9kym` (Grand Atelier Salon), `1778048568910-lx1q0n` (Linen Cloud Suite bedroom), `1776588673759-kwlh8f` (Color Wall Decor Hero)
- `previewImage`: bump to `1778050204000-gl9kym`
- `alt`: refresh to match new hero

### 2. `src/data/aiProductPhotographyCategoryPages.ts` — category page

Rewrite the `home-furniture` entry (around lines 578–651):

- **groupName / hero / SEO copy**: keep "Home & Furniture" but broaden hero subheadline and meta description to call out room scenes (living room, bedroom, dining, home office, outdoor) plus decor, vases, candles.
- **secondaryKeywords**: add `living room product photography`, `bedroom furniture photography`, `outdoor furniture photography`, `dining room product photos`.
- **longTailKeywords**: add `AI living room scenes for furniture brands`, `AI bedroom furniture photos`, `AI outdoor furniture lifestyle photos`, `AI home office furniture photos`.
- **subcategories**: extend list with the new rooms (Living Room, Bedroom, Dining Room, Home Office, Hallway, Outdoor Furniture, Child Room) alongside existing Home Decor / Vases / Candles / Lighting / Sofas / Chairs.
- **painPoints**: add a line about scaling room-specific scenes (living, bedroom, dining, outdoor) without booking a styled set per room.
- **visualOutputs**: replace 1–2 generic items with `Living room scenes`, `Bedroom suites`, `Dining room scenes`, `Home office scenes`, `Outdoor furniture scenes` while keeping decor + catalog + Pinterest cards.
- **sceneExamples** (8 scenes — used by the grid + chip selector): replace with one per major new sub-category. Proposed:

  ```text
  Grand Atelier Salon       — Furniture · Living Room                        — 1778050204000-gl9kym
  Linen Cloud Suite         — Furniture · Bedroom                            — 1778048568910-lx1q0n
  Warm Travertine Dining    — Furniture · Dining Room                        — 1778071100932-306rp9
  Concrete Architect Studio — Furniture · Home Office                        — 1778049958891-reu4vd
  Mediterranean Stone Terrace — Furniture · Outdoor Furniture               — 1778061177176-1ii0an
  Parisian Entry Hall       — Furniture · Hallway                            — 1778058451812-aypoov
  Color Wall Decor Hero     — Home Decor · Aesthetic Color Decor Stories     — 1776588673759-kwlh8f
  Console Placement Story   — Home Decor · Console / Table / Shelf Lifestyle — 1776588674825-uxohrz
  ```

  Each entry sets `collectionLabel` (`Furniture` or `Home Decor`) and `subCategory` to match the live `product_image_scenes` data so the on-page chip filter labels stay accurate.

- **useCases**: keep — already aligned (PDP, Pinterest, ads, catalog, seasonal, email).
- **faqs**: add one new entry: *"Can VOVV.AI generate room-specific scenes (living, bedroom, dining, outdoor)?"* with a short yes answer.
- **heroImageId / heroAlt / heroNoun**: switch hero to `1778050204000-gl9kym` (Grand Atelier Salon living room) for a stronger above-the-fold visual; alt updated accordingly; noun stays `piece`.
- **relatedCategories**: unchanged.

## Out of scope

- BuiltFor grid (`aiProductPhotographyBuiltForGrids.ts`) already has a Home & Furniture block; expanding it with the new room sub-groups is a separate, larger pass — flagged but not done here.
- No new sub-niche category pages (e.g. `/ai-product-photography/living-room`) — say the word and we can add them in a follow-up.
- No deep-link map changes in `visualLibraryDeepLink.ts` (page still links to the `home` family in the visual library).

## Verification

- Visit `/ai-product-photography/home-furniture` in preview: hero, subcategory chips, 8 scene example tiles, and FAQ all reflect new content.
- Confirm preview images load (check network for any 404 on the new IDs).
- Hub page `/ai-product-photography` shows updated shot count and refreshed collage for Home & Furniture.
