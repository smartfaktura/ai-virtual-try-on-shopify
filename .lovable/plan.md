

## "Missing Something?" Request Banners

Add small inline request banners at the end of model/scene selector grids (in Freestyle popovers) and at the bottom of the Workflows page catalog.

### What it looks like

A compact, subtle card at the bottom of each list:
- **Model selector popover** (`ModelSelectorChip.tsx`): Below the model grid — "Missing a model? Tell us, we'll create it in 1–2 business days."
- **Scene selector popover** (`SceneSelectorChip.tsx`): Below the scene grid — "Missing a scene? Tell us, we'll create it in 1–2 business days."
- **Workflows page** (`Workflows.tsx`): After the workflow catalog cards — "Missing a feature or workflow? Let us know what you need."

Each banner: small `MessageSquarePlus` icon, one-liner text, and a "Request" button that opens a compact inline form (or reuses the existing `feedback` table with type auto-set to `feature`). Clicking "Request" expands a tiny textarea inline + submit. On submit, inserts into the existing `feedback` table with `type = 'feature'` and a tag in the message like `[model-request]` / `[scene-request]` / `[workflow-request]` so admins can filter.

### Files

| Action | File | Change |
|--------|------|--------|
| New | `src/components/app/MissingRequestBanner.tsx` | Reusable compact banner with configurable title/placeholder, submits to `feedback` table |
| Edit | `src/components/app/freestyle/ModelSelectorChip.tsx` | Add `<MissingRequestBanner />` after the model grid (inside the popover) |
| Edit | `src/components/app/freestyle/SceneSelectorChip.tsx` | Add `<MissingRequestBanner />` after the scene grid (inside the popover) |
| Edit | `src/pages/Workflows.tsx` | Add `<MissingRequestBanner />` after the workflow catalog |

No database changes needed — reuses the existing `feedback` table.

