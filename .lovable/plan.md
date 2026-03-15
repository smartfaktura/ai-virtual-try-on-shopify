

## Rename "Product Perspectives" → "Picture Perspectives" + Carousel Animation + Fix Est. Time

### 1. Rename everywhere

**Database migration**: Update the workflow row name from `'Product Perspectives'` to `'Picture Perspectives'`.

**Code references** — all string matches for `'Product Perspectives'` across these files:

| File | What changes |
|------|-------------|
| `src/components/app/workflowAnimationData.tsx` (line 164) | Key `'Product Perspectives'` → `'Picture Perspectives'` |
| `src/components/app/WorkflowCard.tsx` (line 63) | Feature map key → `'Picture Perspectives'`, update bullet text: "Generate close-up, back, side & wide angles from one **picture**" |
| `src/hooks/useGeneratePerspectives.ts` (lines 375-377) | `workflow_label` and `workflow_name` strings |
| `src/pages/Generate.tsx` (line 143) | Comment text |
| `src/pages/Perspectives.tsx` (lines 123, 500, 638, 648) | DB query `.eq('name', ...)`, page titles, headings |
| `src/pages/Workflows.tsx` (line 277) | Navigation check `workflow.name === ...` |

Also update description text on the Perspectives page (line 650) from "Generate close-ups, back views..." to something more inclusive like: "Generate angle and detail variations — close-ups, back views, side angles, and wide shots from any image."

### 2. Carousel animation for the workflow card

Currently the Perspectives card uses the default "recipe" mode (floating badges animate in/out). Switch it to `mode: 'carousel'` using 4 perspective result images that cycle with crossfade — similar to the UGC card.

In `workflowAnimationData.tsx`:
- Add 4 asset URLs for perspective angle results (using existing `getLandingAssetUrl` or the listing product at different crops — reuse `listingResult` as base and add 3 more perspective preview images from landing assets)
- Change the scene to `mode: 'carousel'`, set `backgrounds: [img1, img2, img3, img4]`
- Keep floating badges for "Close-up", "Back View" etc. as persistent overlays (same as UGC keeps its product chip)

### 3. Fix estimated time

In `src/pages/Perspectives.tsx` line 478:
- Change `estimatedSecondsPerImage = 90` → `estimatedSecondsPerImage = 45` — Pro model generations typically take 30-60 seconds, not 90.

### Files changed
| File | Change |
|------|--------|
| New migration SQL | `UPDATE workflows SET name = 'Picture Perspectives' WHERE name = 'Product Perspectives'` |
| `src/components/app/workflowAnimationData.tsx` | Rename key, switch to carousel mode with 4 background images |
| `src/components/app/WorkflowCard.tsx` | Rename feature map key, update bullet text |
| `src/hooks/useGeneratePerspectives.ts` | Update workflow_label and workflow_name strings |
| `src/pages/Generate.tsx` | Update comment |
| `src/pages/Perspectives.tsx` | Update DB query, headings, titles, est. time (90→45) |
| `src/pages/Workflows.tsx` | Update name check |

