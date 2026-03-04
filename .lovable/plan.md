

## Generate Preview Images for Interior/Exterior Design Styles + Add Upsell Banner

### Problem
1. All 22 design style cards in the Interior/Exterior Staging workflow show gradient placeholders with a Package icon — no actual preview images
2. The upsell banner ("Free plan: 1 scene per generation. Upgrade to unlock up to 3") is explicitly hidden for interior design via `{!isInteriorDesign && isFreeUser && (` on line 2600

### Plan

#### 1. Generate 22 AI preview images for design styles
Use the Lovable AI image generation model (`google/gemini-3-pro-image-preview`) via an edge function to generate high-quality interior/exterior staging preview images for each style. Upload them to the `landing-assets` storage bucket under `styles/`.

**Styles to generate (12 Interior):**
Modern Minimalist, Scandinavian, Japandi, Mid-Century Modern, Industrial, Bohemian, Coastal/Hampton, Traditional/Classic, Farmhouse/Rustic, Contemporary Luxury, Art Deco, Mediterranean

**Styles to generate (10 Exterior):**
Mediterranean Villa, Tropical Resort, Modern Architectural, English Cottage Garden, Desert Contemporary, Japanese Zen, Rustic Mountain, Coastal Beach House, Urban Rooftop, Classic Colonial

Each image will be a beautifully staged room/exterior showcasing that specific design style — square aspect ratio, high quality.

**Implementation:**
- Create a one-time admin edge function `generate-style-previews` that generates all 22 images using AI and uploads them to storage
- Run a DB migration to update the `preview_url` field on each variation in the workflow's `generation_config` JSON

However, given that AI image generation produces base64 images that need uploading and the workflow config is a JSON column, a simpler and more reliable approach:

- **Upload 22 curated stock/reference images** from Unsplash to the `landing-assets/styles/` bucket via an edge function, then update the workflow's `generation_config` JSON via a migration to set `preview_url` on each variation.

**Simplest approach chosen:** Use a database migration to set `preview_url` values pointing to high-quality Unsplash images for each style. These are freely usable, instant, and perfectly representative.

#### 2. Show upsell banner for interior design workflow

**File: `src/pages/Generate.tsx`** (line 2600)
- Change `{!isInteriorDesign && isFreeUser && (` to `{isFreeUser && (`
- Update the text for interior context: "Free plan: 1 style per generation." vs "1 scene per generation."

### Files changed — 1 + 1 migration

**`src/pages/Generate.tsx`**
- Line 2600: Remove the `!isInteriorDesign &&` condition so the upsell banner shows for interior workflow too
- Make the banner text dynamic: show "style" instead of "scene" when `isInteriorDesign`

**Database migration**
- Update the `generation_config` JSON for the Interior/Exterior Staging workflow to add `preview_url` (Unsplash URLs) to each of the 22 variation objects

