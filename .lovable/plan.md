

# Fix Modal Workflow Cards: Enable Animations Below Image + Zoom Out Backgrounds

## Problems
1. **No animations in modal** — recipe-mode cards (Try-On, Listing, Flat Lay, Mirror Selfie) have animations completely disabled by `!modalCompact` check. The ingredient strip below the image exists but feels static/lifeless.
2. **UGC/Selfie has floating overlays ON the image** — carousel mode doesn't check `modalCompact`, so "PRODUCT Ice Roller" and "UGC Style" badges float on top of the image, inconsistent with the clean-image approach.
3. **Images too zoomed in** — `objectPosition` values crop aggressively in the portrait containers.

## Changes

### 1. `src/components/app/WorkflowAnimatedThumbnail.tsx`

**Carousel mode (line 288)**: Add `!modalCompact` check to hide floating overlays on carousel cards too, matching recipe mode behavior:
```tsx
{isActive && elementsReady && !modalCompact && (
```

Also hide the gradient overlay (lines 279-285) when `modalCompact` — keep the image clean.

### 2. `src/components/app/WorkflowCardCompact.tsx`

The ingredient strip (lines 66-81) already exists and animates with `animate-fade-in` + staggered delays. But it only filters for product/model/scene/badge and uses `isVisible` which may fire late.

**No structural change needed** — the strip is already there. The issue is that `isVisible` depends on IntersectionObserver which may not trigger inside a modal (the card is inside a scrollable dialog). Fix: when `modalCompact`, default `isVisible` to `true` since the modal is always in view.

Update line 27:
```tsx
const [isVisible, setIsVisible] = useState(!!modalCompact);
```

### 3. `src/components/app/workflowAnimationData.tsx`

Zoom out backgrounds by adjusting `objectPosition`:

- **Virtual Try-On Set**: `'center 30%'` → `'center 20%'` (shift up to show more body)
- **Product Listing Set**: `'center 40%'` → `'center'` (center the composition)
- **Selfie / UGC Set**: No `objectPosition` set — add `objectPosition: 'center'`
- **Mirror Selfie Set**: No `objectPosition` — add `objectPosition: 'center 25%'`

### Files
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — hide carousel overlays + gradient when `modalCompact`
- `src/components/app/WorkflowCardCompact.tsx` — default `isVisible` to true for modal cards
- `src/components/app/workflowAnimationData.tsx` — adjust objectPosition values to zoom out

