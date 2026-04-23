

## Tighten "Picked for your product" copy

The title wraps to 2 lines on mobile (390px) because `text-sm` is too wide for the narrow card. Quick fix:

### Change in `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (lines 527–532)

1. **Title**: `text-sm font-semibold` → `text-[13px] font-semibold tracking-tight` and shorten copy: **"Picked for your product"** → **"Picked for you"** (cleaner, fits one line on mobile and desktop).
2. **Subtitle**: keep `text-xs text-muted-foreground` but shorten: **"From your Explore pick"** → **"From your Explore selection"** stays clear but shorter alt: **"From Explore"** (matches the section header above, less repetition).
3. **Spacing**: `space-y-1.5` → `space-y-1` so the two lines hug closer and the block feels balanced against the avatar.
4. **Avatar**: drop from `w-10 h-10` → `w-9 h-9` so it doesn't dominate the small card.

### Result

```text
┌──────────┐
│    ⓘ     │
│  ╭──╮    │
│  │👤│    │
│  ╰──╯    │
│ Picked   │
│ for you  │
│From Explore│
│          │
│Add more… │
└──────────┘
```

Single-line title on mobile, tighter rhythm, same structure.

### Out of scope
- Card layout, footer, icon, header — all unchanged.

