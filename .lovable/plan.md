

# Move Badge Pills to Lower Side of Carousel Images

## Problem
Currently the badge pills are split — one at top-left (`top: '10%'`) and one at bottom-left (`bottom: '18%'`). User wants both pills grouped together on the lower side of the image.

## Change

### File: `src/components/app/workflowAnimationData.tsx`

Update positions for all carousel workflow scenes that have two badges:

**Product Visuals** (lines ~92-99): Move first badge from `top: '10%'` to `bottom: '26%'`

**Virtual Try-On Set** (lines ~110-117): Move first badge from `top: '10%'` to `bottom: '26%'`

**Product Listing Set** (lines ~128-135): Move first badge from `top: '10%'` to `bottom: '26%'`

**Selfie / UGC Set** — first element is a `product` type, move from `top: '10%'` to `bottom: '26%'`

**Picture Perspectives** — move first badge from `top: '10%'` to `bottom: '16%'`, second from `bottom: '8%'` to `bottom: '6%'`

**Catalog Studio** — move first badge from `bottom: '18%'` to `bottom: '16%'` (already low, just tighten gap)

Result: both pills stacked at the bottom-left of each card, visually grouped.

## Impact
- 1 file, ~6 position tweaks
- Consistent bottom-left pill placement across all carousel workflows

