
## Goal
Apply remaining P2 fixes from the audit. Skip P0 #1 (admin-only, confirmed not user-visible).

## Changes
1. **`src/components/app/WorkflowRequestBanner.tsx:103`** — "template" → "Visual Type"
2. **`src/pages/BrandModels.tsx:853, 892`** — unify section headings to "My Brand Models"
3. **`src/pages/Jobs.tsx:557`** — "Visual Studio or with Freestyle" → "Visual Studio or Freestyle Studio"; L560 button → "Open Freestyle Studio"
4. **`src/pages/video/AnimateVideo.tsx:526`** — "3-5 minutes" → "3–5 minutes" (en-dash)
5. **`src/pages/Products.tsx:139`** — drop ambiguous "library" wording
6. **`src/pages/Discover.tsx:433`** — "Every image" → "Every result"

## Out of scope
- P0 BrandModels admin checkbox (admin-only, not user-visible)
- P1 WorkflowRequestBanner already covered above as P2 polish item

## Acceptance
- ~7 strings updated across 6 files
- Text-only, no routes/types/backend touched
