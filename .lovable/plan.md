

## Add Proper Animation for Product Perspectives Workflow Card

### Problem
The `workflowScenes` map in `workflowAnimationData.tsx` has no entry for `'Product Perspectives'`, so the WorkflowCard falls back to a static image (or broken thumbnail). Additionally, `WorkflowCard.tsx` has no feature list entry for it.

### Solution
Add a "recipe" mode animation scene (matching the style of Virtual Try-On, Product Listing, etc.) and a feature bullet list.

### Changes

#### 1. `src/components/app/workflowAnimationData.tsx` — Add `'Product Perspectives'` scene

Use the standard recipe animation mode with:
- A product image chip (reuse an existing product asset like the cream jar)
- Badge chips for the angle types: "4 Angles", "Close-up", "Back View"
- A background result image (reuse a suitable existing asset or the workflow preview from the DB)
- Standard slide-in animations with staggered delays

Assets: Reuse `listingProduct` (cream jar) as the product chip and `listingResult` as background since perspectives generate product-only images in similar style.

#### 2. `src/components/app/WorkflowCard.tsx` — Add feature list for `'Product Perspectives'`

Add to `featureMap`:
```
'Product Perspectives': [
  'Generate close-up, back, side & wide angles from one image',
  'Strict identity preservation — no hallucinated details',
  'High quality Pro model for maximum fidelity',
  'All aspect ratios supported — portrait, square & landscape',
]
```

### Files changed
| File | Change |
|------|--------|
| `src/components/app/workflowAnimationData.tsx` | Add `'Product Perspectives'` scene entry with recipe-mode badges |
| `src/components/app/WorkflowCard.tsx` | Add feature list for Product Perspectives |

