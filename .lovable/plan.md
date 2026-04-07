

# Fix Model Circles + Redesign Style Direction & Styling Section

## Changes

### 1. Fix the 3 circles near "Choose model"
**File: `ProductImagesStep3Refine.tsx` — lines 1581-1587**

Replace the empty gradient circles with actual model preview images. Use the first 3 `globalModels` images rendered as `<img>` inside the circles with `object-cover`. Fallback to colored placeholder circles if no models loaded.

### 2. Merge Style Direction + Outfit & Model Styling into one unified section
**File: `ProductImagesStep3Refine.tsx` — lines 1649-1715**

Currently these are two separate visual blocks: "Style direction" (lines 1649-1666) and "Outfit & Model styling" Card (lines 1669-1715). Merge into a single section placed directly after the model picker:

```text
┌─────────────────────────────────────────────┐
│  Style & Outfit                             │
│  Set the look — presets apply to outfit      │
│  and appearance automatically.              │
│                                             │
│  🔒 Locked across all on-model scenes.      │
│                                             │
│  [Studio] [Editorial] [Minimal] ...         │  ← compact preset chips
│                                             │
│  ▸ Outfit details    ▸ Appearance           │  ← inline collapsibles
└─────────────────────────────────────────────┘
```

### 3. Make style preset cards more compact + add color accents
**File: `ProductImagesStep3Refine.tsx` — `OutfitPresetsOnly` (lines 1199-1241)**

- Remove description text from preset cards entirely — just the name
- Reduce card width from `170px` to `130px`
- Keep the colored accent bar at top (already exists)
- Add a subtle gradient background tint based on the accent color for more visual personality
- Active state: stronger ring + filled accent

### 4. Move the unified section right after models (before Background style)
Reorder in the main render: Selected shots → Choose model → **Style & Outfit** → Background style → Additional note

### Files modified
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`

