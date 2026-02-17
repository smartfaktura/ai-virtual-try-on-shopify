

## Revamp Selfie / UGC Set Animation with Rotating Results

### Concept
The animation will tell the story: **1 Product + Select Model = Multiple Diverse Outcomes**. Each animation loop shows a different result image, rotating through 4 of your uploaded photos — demonstrating that one ice roller product can generate diverse UGC content with different models and scenes.

### Animation Flow (per loop)
1. Ice Roller product chip slides in from left (white background product shot)
2. "+" action button pops in center
3. Model avatar slides in from right
4. "UGC Style" badge slides up from bottom
5. All elements exit, shimmer sweep, result reveals (different result each loop)
6. "Generated" badge pops in
7. Loop restarts with the NEXT result image as background

### Changes Required

**Step 1: Upload 5 images to `landing-assets` storage bucket**

| Image | Storage Path | Purpose |
|---|---|---|
| `freestyle-9.png` | `products/ice-roller-white.png` | Product chip thumbnail |
| `freestyle-7.png` | `workflows/ugc-result-1.jpg` | Result 1 (curly hair model) |
| `freestyle-5.png` | `workflows/ugc-result-2.jpg` | Result 2 (redhead model) |
| `freestyle-3_1.png` | `workflows/ugc-result-3.jpg` | Result 3 (blonde model) |
| `freestyle-1_12.png` | `workflows/ugc-result-4.jpg` | Result 4 (braids model, luxury bathroom) |

**Step 2: Extend `WorkflowScene` type to support rotating backgrounds**

In `WorkflowAnimatedThumbnail.tsx`, update the `WorkflowScene` interface to accept either a single background or an array:

```typescript
export interface WorkflowScene {
  background: string;
  backgrounds?: string[];  // rotating backgrounds — if set, cycles on each loop
  elements: SceneElement[];
}
```

**Step 3: Update `WorkflowAnimatedThumbnail` to cycle backgrounds**

In the main component, pick a different background on each iteration using modulo:

```typescript
const currentBg = scene.backgrounds
  ? scene.backgrounds[iteration % scene.backgrounds.length]
  : scene.background;
```

Then use `currentBg` as the `<img src>` for the background instead of `scene.background`.

**Step 4: Update the UGC scene definition in `workflowAnimationData.tsx`**

Replace the current Selfie / UGC Set (lines 80-101) with:

```typescript
'Selfie / UGC Set': {
    background: ugcResult1,  // fallback for static/first frame
    backgrounds: [ugcResult1, ugcResult2, ugcResult3, ugcResult4],
    elements: [
      {
        type: 'product', image: ugcProduct, label: 'Ice Roller', sublabel: 'Product',
        icon: <Plus className="w-3 h-3" />,
        position: { top: '10%', left: '6%' }, enterDelay: 0.3, animation: 'slide-left',
      },
      {
        type: 'action', label: '', icon: <Plus className="w-4 h-4" />,
        position: { top: '40%', left: '38%' }, enterDelay: 0.9, animation: 'pop',
      },
      {
        type: 'model', image: ugcModel, label: 'Creator',
        icon: <User className="w-3 h-3" />,
        position: { top: '22%', right: '6%' }, enterDelay: 1.4, animation: 'slide-right',
      },
      {
        type: 'badge', label: 'UGC Style', icon: <Camera className="w-3 h-3" />,
        position: { bottom: '18%', left: '6%' }, enterDelay: 2.0, animation: 'slide-up',
      },
    ],
  },
```

Asset references updated at the top of the file:
```typescript
// Selfie / UGC Set
const ugcProduct = getLandingAssetUrl('products/ice-roller-white.png');
const ugcModel = getLandingAssetUrl('models/model-female-average-american-redhead.jpg');
const ugcResult1 = getLandingAssetUrl('workflows/ugc-result-1.jpg');
const ugcResult2 = getLandingAssetUrl('workflows/ugc-result-2.jpg');
const ugcResult3 = getLandingAssetUrl('workflows/ugc-result-3.jpg');
const ugcResult4 = getLandingAssetUrl('workflows/ugc-result-4.jpg');
```

### Files Modified

| File | Change |
|---|---|
| Storage: `landing-assets` bucket | Upload 5 images (1 product + 4 results) |
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Add optional `backgrounds` array to type, cycle through them per iteration |
| `src/components/app/workflowAnimationData.tsx` | Replace UGC scene with ice roller product, model, and 4 rotating result backgrounds |

### Result
Each time the animation loops, visitors see a different model holding the same ice roller in a different bathroom setting — powerfully demonstrating that one product upload generates diverse, professional UGC content.

