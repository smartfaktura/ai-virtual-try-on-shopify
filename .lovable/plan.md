

# Post-Gen Conversion — Coverage Audit

## Current Status

The 3-layer Post-Gen Conversion system (Layer 1 inline card → Layer 2 value drawer → Layer 3 no-credits modal) is **fully wired** on these pages:

| Page | Route | All 3 Layers | No-credits gate |
|------|-------|-------------|-----------------|
| Generate (all workflows) | `/app/generate/:slug` | Yes | Yes |
| Freestyle | `/app/freestyle` | Yes | Yes |
| Text-to-Product | `/app/generate/text-to-product` | Yes | Yes |

## Missing Pages

These generation pages have **no Post-Gen Conversion** — they only show a toast error when credits run out:

| Page | Route | What happens today |
|------|-------|--------------------|
| **Perspectives** | `/app/perspectives` | `toast.error("Not enough credits...")` |
| **Animate Video** | `/app/video/animate` | `toast.error("Insufficient credits...")` |
| **Brand Models** | `/app/models` | Inline text "Not enough credits" |
| **Product Images** | `/app/generate/product-images` | No explicit credit gate found at submission level |

## Recommendation

For your question — "will I see Post-Gen Conversion on freestyle, workflows, any function?" — the answer is **yes for the 3 main generation pages, but no for Perspectives, Video, and Brand Models**.

### Option A: Add Layer 3 only (NoCreditsModal) to missing pages
Minimal effort. Replace toast errors with the enhanced modal so users always see credit pack options. Skip Layers 1–2 since those pages have different post-generation UX patterns.

### Option B: Full 3-layer system on all pages
Add all three layers to Perspectives, AnimateVideo, and BrandModels. More comprehensive but heavier integration.

### Proposed: Option A (Layer 3 on missing pages)

**Files to modify:**
1. **`src/pages/Perspectives.tsx`** — Import `NoCreditsModal`, add state, replace toast with modal open
2. **`src/pages/video/AnimateVideo.tsx`** — Same pattern: import modal, replace toast with modal
3. **`src/pages/BrandModels.tsx`** — Same pattern: import modal, replace inline text with modal trigger

This ensures every generation surface in the app shows the enhanced credit purchase modal instead of a dead-end toast when credits run out. Design-wise, no new components needed — reusing the already-audited `NoCreditsModal`.

