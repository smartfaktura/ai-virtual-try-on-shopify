## Goal

On `/app/brand-scenes/new` → Step 4 "Cast" → **Featured Model** section, replace the single "Choose featured model" button with a small grid of quick-pick models so the user can pick in one click. Freya is shown as the default suggestion. A "See all models" action opens the existing full catalog, and a dedicated "From Brand Models" entry jumps straight to the Brand Models tab.

## What changes (UI)

Current state: empty section shows one dashed row with an avatar icon and "Choose featured model".

New state for the **Featured Model** card when nothing is picked:

```text
FEATURED MODEL
Optional — lock this exact face across all 3 variations

[ Freya ✓ ] [ Aiden ] [ Maya ] [ Marcus ] [ Sara ] [ Noah ]   ← 6-tile grid, square avatars
                                                                  Freya shown with subtle "Suggested" pill

[ See all models → ]   [ Use a Brand Model ]
```

- 6 quick-pick tiles, ~80×80, rounded, name underneath.
- Curated list = **Freya** (model_029) first, then a balanced mix of 3 women + 3 men picked from `mockModels` (e.g. Aiden, Maya, Marcus, Sara, Noah — final names confirmed from `src/data/mockData.ts`).
- Freya gets a small "Suggested" chip; she is **not auto-applied** to `cast.model_ref` (still optional, per existing semantics) but is the first tile and visually pre-highlighted so one click confirms her.
- Clicking any tile sets `cast.model_ref` via the same mapping `FeaturedModelPicker` already uses.
- "See all models" opens the existing `ModelCatalogModal` (unchanged).
- "Use a Brand Model" opens the same modal but switches to its **My Brand Models** quick view by default. For free plans this still shows the existing upgrade upsell inside the modal.

When a model is already selected, the picker keeps today's compact "selected card" layout (avatar + name + Change/Remove). Nothing to relearn.

## Files touched

- `src/features/brand-scenes/wizard/components/FeaturedModelPicker.tsx` — add quick-pick grid, "See all" + "Use a Brand Model" actions, "Suggested" chip on Freya. Accept new optional prop `initialCatalogView?: 'all' | 'brand'` for routing to the brand tab.
- `src/components/app/freestyle/ModelCatalogModal.tsx` — accept a new optional `initialQuickView?: 'all' | 'brand'` prop and seed `quickView` state from it (kept backward compatible; default unchanged).
- No changes to Step 4 logic, schema, prompt builder, or data.

## Quick-pick curation

Hard-coded list of 6 modelIds resolved at render time from `mockModels` (filter by id, fall back gracefully if a model is hidden via `useModelSortOrder().filterHidden`). Order: Freya first, alternating female/male.

## Out of scope

- No backend or schema changes.
- No new "auto-apply Freya" — keeps Featured Model strictly optional as today.
- No changes to other wizard steps or the brand-scenes prompt builder.
