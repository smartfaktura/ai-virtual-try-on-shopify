

# Fix: Remove Logo/Brand Text Instructions Causing "VILA" Label

## Problem
The AI is hallucinating brand labels (e.g. "VILA") on generated images because the prompt explicitly instructs it to render "brand details," "text/logos," and "product text." When the source product has no visible branding, the model invents one.

## Root Cause — 4 locations in `generate-freestyle/index.ts`

1. **Line 190** — PRODUCT reference: `"brand details, and any text/logos"`
2. **Line 197** — Alternate product reference: same phrase
3. **Line 240** — Quality block: `"product text, and logos"`
4. **Line 485** — Seedream product directive: `"logos, tags, and all visible construction details"`

## Fix

Remove all mentions of logos, brand text, and tags from the prompt directives. Replace with neutral phrasing that focuses on physical construction details only.

### Changes in `supabase/functions/generate-freestyle/index.ts`:

**A. Line 190** — Change:
```
"brand details, and any text/logos"
→ "and all visible construction details"
```

**B. Line 197** — Same change as above.

**C. Line 240** — Change:
```
"Sharp micro-detail on textures, stitching, product text, and logos."
→ "Sharp micro-detail on textures, stitching, and fabric weave."
```

**D. Line 485** — Change:
```
"logos, tags, and all visible construction details"
→ "and all visible construction details"
```

These changes stop the AI from being told to render text/branding, which eliminates the hallucinated labels while keeping all the important physical fidelity instructions (shape, silhouette, color, material, stitching, etc.).

