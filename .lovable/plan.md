

# Catalog Studio: Props Redesign + UI Fixes

## Overview
Three fixes plus a major Props step redesign — moving from "global props" to a per-generation-combination props assignment with an "apply to all" shortcut.

## 1. Move Brand Models Above Library Models
**File: `CatalogStepModelsV2.tsx`**
- Swap the render order: show "Your Brand Models" section first (currently "My Models" at bottom), then "Library Models" below
- Rename section header from "My Models" to "YOUR BRAND MODELS" with a small crown/star icon to emphasize uniqueness
- Add a subtle upsell note if user has zero brand models: "Create your own AI model for your brand" with a link to `/app/brand-models`

## 2. Fix Stepper Overflow
**File: `CatalogStepper.tsx`**
- 7 steps is too wide — the pills overlap at the edges on smaller desktops
- Desktop fix: reduce `px-4` to `px-3`, reduce `gap-2.5` to `gap-1.5`, make connector lines shorter (`w-4 lg:w-6` instead of `w-6 lg:w-10`), shrink text to `text-[10px]`
- At `md` breakpoint and below (but above mobile), hide step labels and show icon-only pills to save space
- This keeps 7 steps fitting within ~1100px without overlap

## 3. Redesign Props Step as Generation Matrix
**File: `CatalogStepProps.tsx` — full rewrite**

Instead of a simple product grid, show a numbered list of every generation combination with per-row prop controls:

```text
┌──────────────────────────────────────────────────────────────┐
│ Add Styling Props                              (optional)    │
│ Add extra items to your shots. Pick per shot or apply to all │
│                                                              │
│ ┌─ "Add props to all shots" button ─────────────────────┐   │
│                                                              │
│ #1  [img] Pink Bag × Freya × Full Body    [+ Add prop]      │
│ #2  [img] Pink Bag × Freya × Detail       [+ Add prop]      │
│ #3  [img] Pink Bag × Zara  × Full Body    [+ Add prop]  🏷  │
│     └─ Props: Gold Ring, Silver Watch           [× remove]   │
│ #4  [img] Pink Bag × Zara  × Detail       [+ Add prop]      │
│ ...                                                          │
│                                                              │
│ [Back]                        [Skip — no props]  [Next →]    │
└──────────────────────────────────────────────────────────────┘
```

**Data model change:**
- Replace `selectedPropIds: Set<string>` with `propsMap: Map<string, Set<string>>` where key = combination key (`${productId}__${modelId}__${shotId}`) and value = set of prop product IDs
- Add a `globalPropIds: Set<string>` for "apply to all" props

**Each combination row shows:**
- Product thumbnail + product name × model name × shot name
- An "+ Add prop" button that opens a small popover/dropdown with the product library grid (excluding hero products) for multi-select
- If props are assigned, show them as small chips below the row with remove buttons

**"Add to all shots" button at top:**
- Opens the same product picker popover
- Selected props get applied to every combination row
- Individual rows can still override (add/remove per-row)

**Props in the interface:**
```typescript
// New in CatalogStepProps
interface GenerationCombo {
  key: string;           // productId__modelId__shotId
  product: { id: string; title: string; imageUrl: string };
  model: { id: string; name: string; previewUrl: string } | null; // null = product-only
  shot: { id: CatalogShotId; label: string };
}
```

**State in CatalogGenerate.tsx:**
- Replace `selectedPropIds: Set<string>` with `propAssignments: Record<string, string[]>` (combo key → array of prop product IDs)
- Pass `products`, `selectedModelIds`, `selectedShots`, `allModels` into the Props step so it can build the combo list

## 4. Update Prompt Injection
**File: `useCatalogGenerate.ts`**
- Instead of appending the same props to every prompt, look up props for each specific combination key
- Per-job prompt assembly: check `config.propAssignments[comboKey]` and only append those prop titles

## 5. Update Types
**File: `types/catalog.ts`**
- Replace `stylingProps` with `propAssignments: Record<string, { id: string; title: string; imageUrl: string }[]>`

## 6. Update Review + Sidebar
- **Review (`CatalogStepReviewV2.tsx`)**: Show props summary — e.g. "3 of 12 shots have styling props" with expandable detail
- **Sidebar (`CatalogContextSidebar.tsx`)**: Show "Props: 3/12 shots" instead of just count

## Files to modify

| File | Action |
|------|--------|
| `CatalogStepModelsV2.tsx` | Swap brand models to top, add upsell |
| `CatalogStepper.tsx` | Tighten spacing for 7 steps |
| `CatalogStepProps.tsx` | Full rewrite — generation matrix with per-row prop picker |
| `CatalogGenerate.tsx` | Replace `selectedPropIds` state with `propAssignments` map |
| `types/catalog.ts` | Update `CatalogSessionConfig` type |
| `useCatalogGenerate.ts` | Per-combination prop injection |
| `CatalogStepReviewV2.tsx` | Update props summary display |
| `CatalogContextSidebar.tsx` | Update props row display |

