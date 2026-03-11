

## Simplify Freestyle Showcase Section

### Issues to fix
1. Prompt text is too long — shorten to something concise
2. "Sofia" model chip references a specific model with a Supabase-hosted thumbnail — remove
3. Product chip shows the flat crop top image — user wants the source crop top image used consistently but not as a tiny chip thumbnail
4. Result images need to be proper portraits of models wearing the crop top

### Changes in `src/components/landing/FreestyleShowcaseSection.tsx`

**1. Shorten `PROMPT_TEXT`:**
```typescript
const PROMPT_TEXT = 'White Crop Top, three looks: studio, outdoor café, urban concrete';
```

**2. Simplify `CHIPS`** — remove the model chip entirely (no "Sofia"), keep Product and Scene chips but without the crop top thumbnail on Product (just icon):
```typescript
const CHIPS = [
  { key: 'product', icon: Package, label: 'White Crop Top', thumb: '/images/source-crop-top.jpg', delay: 3000 },
  { key: 'scene', icon: Camera, label: 'Multi-Scene', thumb: '/images/try-showcase/cafe-lifestyle.png', delay: 4000 },
];
```
Remove the `getLandingAssetUrl` import (no longer needed).

**3. Update `RESULT_CARDS`** — use the three `virtual-tryon` images which are actual portraits of models wearing the crop top:
```typescript
const RESULT_CARDS = [
  { label: 'Studio', src: '/images/try-showcase/virtual-tryon-1.png' },
  { label: 'Outdoor Café', src: '/images/try-showcase/virtual-tryon-2.png' },
  { label: 'Urban', src: '/images/try-showcase/virtual-tryon-3.png' },
];
```

**4. Update `ChipKey` type** to remove `'model'`:
```typescript
type ChipKey = 'product' | 'scene';
```

And update the `activeChips` initial state to remove `model`.

