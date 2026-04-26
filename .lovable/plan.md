## Goal

Bring `/product-visual-library` up to the same editorial vibe as `/`, `/how-it-works`, and the refreshed `/faq`: two-tone H1 with `#4a5578` accent, a proper mid-page editorial section instead of the flat 2-column SEO copy, and a dark closing CTA matching `HomeFinalCTA`.

## Changes (single file: `src/pages/ProductVisualLibrary.tsx`)

### 1. Hero — two-tone H1
Currently a single line "AI Product Visual Library". Replace with the home/how-it-works pattern:
- Eyebrow stays: `Scene library`
- H1 becomes two lines:
  - Line 1: `Every visual direction`
  - Line 2: `<span className="text-[#4a5578]">your product can take.</span>`
- Bump spacing to `pt-28 pb-16 lg:pt-36 lg:pb-24` (matches HowItWorksHero)
- Subcopy unchanged (still uses live `totalScenes` count)

### 2. Replace the 2-column SEO block with an editorial centered section
Currently a small `py-16` 2-column block with two H3s. Promote it to a real section:
- Eyebrow: `Why this library`
- H2 two-tone:
  - `One product photo.`
  - `<span className="text-[#4a5578]">A full visual system.</span>`
- Single centered subcopy that merges both existing paragraphs (no SEO content lost — keeps "skip studio sessions / ship in hours" + "tuned to category")
- Spacing `py-20 sm:py-28` for proper rhythm

### 3. Add a dark final CTA section (new, was missing)
Mirror the structure of `HomeFinalCTA` so the page closes like every other landing page:
- `bg-[#1a1a2e]` with subtle blurred orbs
- Eyebrow: `Get started`
- H2 white: `Pick a direction. Run with it.`
- Subcopy: `Upload one product photo. Get every scene in this library — on your product, in minutes.`
- CTAs: white pill `Start free` → `/auth`, outlined white pill `See how it works` → `/how-it-works`

### 4. Imports
Add `Link` from `react-router-dom` and `ArrowRight` from `lucide-react` (only `ChevronLeft, ChevronRight, SlidersHorizontal, X` are imported today).

## Out of scope

- Catalog grid, sidebar, mobile filter drawer, scene cards — untouched
- Family/collection logic and `FamilySection` — untouched
- SEO meta and JSON-LD — untouched
- No changes to other pages
