

## Add Generation Summary to Results Page

### Problem
The results step only shows the product card and generated images. There's no summary of what model, scene, settings, or prompt were used — making it hard to understand what produced the results or reproduce them.

### Design
Add a compact, collapsible "Generation Details" card between the product card and the images grid. It should show reference thumbnails and key settings in a clean, scannable layout.

### Layout

```text
┌─────────────────────────────────────────────┐
│ Publishing to                               │
│ [product thumb] Product Name                │
├─────────────────────────────────────────────┤
│ Generation Details              [▾ collapse]│
│                                             │
│ ┌──────┐  ┌──────┐  ┌──────┐               │
│ │ prod │  │model │  │scene │               │
│ │ img  │  │ img  │  │ img  │               │
│ └──────┘  └──────┘  └──────┘               │
│ Product    Model     Scene                  │
│ "Ring"    "Aaliyah"  "Side Profile"         │
│                                             │
│ Aspect: 3:4 · Quality: Standard · Framing: │
│ Side Profile                                │
│                                             │
│ Brand: My Brand Profile                     │
│                                             │
│ Prompt (if available):                      │
│ "A model wearing a diamond ring..."         │
├─────────────────────────────────────────────┤
│ Generated Images                            │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Changes

**`src/pages/Generate.tsx`** — Single file change, insert a new card block between lines 2912-2914 (after product card, before images card):

1. Add a new `<Card>` with `<Collapsible>` wrapper (default open) containing:
   - **Reference images row**: Up to 3 small thumbnails (product, model if used, scene if used) with labels beneath each
   - **Settings chips**: Aspect ratio, quality, framing (if set) as small `<Badge>` elements in a flex row
   - **Brand profile**: Name if one was selected
   - **Workflow name**: If a workflow was used
   - **Prompt**: Show the workflow variation label or a truncated version of any custom prompt, in a muted text block

2. All data is already available in component state: `selectedProduct`, `selectedModel`, `selectedPose`, `aspectRatio`, `quality`, `framing`, `selectedBrandProfile`, `activeWorkflow`, `workflowVariationLabels`. No new state or API calls needed.

3. Conditionally render sections — model/scene thumbnails only appear if they were used (try-on or workflow with model picker). This keeps the card minimal for product-only generations.

4. Use existing `Collapsible` + `ChevronDown`/`ChevronUp` pattern already used elsewhere in the codebase. Mobile-friendly with small thumbnails (48×48) and text wrapping.

