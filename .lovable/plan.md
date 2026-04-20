## Make "Background editable" affordance obvious on Essential Shots

User picked options **2 + 3** (skip the corner chip on the thumbnail).

### Changes

**1. Labeled micro-row under scene title** (replaces bare colored dots)

```
Background  ● ● ● ●
```

- Leading paintbrush icon (`Palette` or `Paintbrush`, lucide, 10px) + word "Background"
- Aesthetic-color scenes show "Accent" instead
- Same dots as today, just framed by the label so users read them as choices, not decoration

**2. One-line legend under Essential Shots sub-group headers**

```
ESSENTIAL SHOTS                                        Select All
Backgrounds shown are editable in the next step
```

- `text-[11px] text-muted-foreground` 
- Only renders when the sub-group label is "Essential Shots" OR contains scenes with `hasBackground` / `hasAestheticColor`

### File

- `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
  - `SceneCard` (~lines 203-267): wrap the dot row with leading icon + label
  - Sub-group header renderer (~lines 661, 759): inject the one-line legend below "Essential Shots" headers

### Validation

1. Essential Shots cards show `Background ● ● ● ●` row instead of bare dots
2. Aesthetic-color scenes show `Accent Color ● ● ●`
3. Legend line appears once per Essential Shots block
4. Non-editable scenes unchanged (no row, no legend)
5. 3-col mobile layout: row stays on one line, no overflow