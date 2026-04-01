

# Add "Styling Props" Step to Catalog Studio

## Concept
A new **Step 6: Props** (between Shots and Review, which becomes Step 7) where users can pick extra products from their library to include as styling accessories in their catalog shots. For example: "Freya wearing Pink Bag + a gold ring on her hand."

The props are pulled from the user's existing product library — no new upload needed. Selected props get injected into every generation prompt as additional items in the scene.

```text
Products → Style → Models → Background → Shots → Props → Review
   1         2        3          4          5       6(NEW)    7
```

## Frontend: New Step Component

**New file: `src/components/app/catalog/CatalogStepProps.tsx`**

- Header: "Add Styling Props" with subtitle "Pick extra items from your library to appear in every shot (optional)"
- Shows the user's product library as a compact grid (similar to product step but smaller cards)
- Excludes products already selected as hero products (they're the main subjects)
- Multi-select with simple check/uncheck — no ordering needed
- "Skip" button clearly available (this step is optional)
- Each selected prop card shows a small "prop" badge
- Footer with Back / Next buttons + "Skip — no props" link

## State Changes in `CatalogGenerate.tsx`

- Add `selectedPropIds: Set<string>` state
- Stepper grows from 6 to 7 steps (Props = step 6, Review = step 7)
- Step validation: Props step is always passable (optional), `canStep6 = true`
- Pass selected prop products to Review and to the generation config

## Type Changes in `src/types/catalog.ts`

- Add `stylingProps` to `CatalogSessionConfig`:
  ```typescript
  stylingProps?: Array<{ id: string; title: string; imageUrl: string; detectedCategory: ProductCategory }>;
  ```

## Prompt Injection in `useCatalogGenerate.ts`

- When assembling prompts, if `config.stylingProps` has items, append a styling props block to the prompt:
  ```
  "Additionally, include these styling accessories visible in the scene: [gold ring on the model's right hand], [silver watch on the wrist]"
  ```
- Props titles get injected into `assemblePrompt` output as a post-processing step (no changes to `catalogEngine.ts` needed — just string concatenation after `assemblePrompt` returns)

## Context Sidebar Update

- Add a "Props" row showing count of selected props (e.g. "2 items") or "None"

## Review Step Update

- Show selected props in a new section between Style/Background and Shots
- Small thumbnail strip of prop products with titles

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/app/catalog/CatalogStepProps.tsx` | **Create** — new step component |
| `src/pages/CatalogGenerate.tsx` | **Modify** — add step 6 state, update stepper to 7 steps, wire new step |
| `src/types/catalog.ts` | **Modify** — add `stylingProps` to `CatalogSessionConfig` |
| `src/hooks/useCatalogGenerate.ts` | **Modify** — append props text to assembled prompts |
| `src/components/app/catalog/CatalogContextSidebar.tsx` | **Modify** — add Props row |
| `src/components/app/catalog/CatalogStepReviewV2.tsx` | **Modify** — show props section |

