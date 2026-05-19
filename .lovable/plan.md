## Polish Summary card + simplify sticky bar

**File:** `src/pages/BrandModels.tsx` (sections layout only)

### 1. Summary card (lines 827–898)
- Remove the avatar block entirely: drop the `previewUrl` thumbnail AND the overlapped trio of `mockModels` previews. No icon, no image.
- Render summary info as a clean text-only block:
  - Model name (or muted "New brand model" placeholder) as the title.
  - Trait chips row below (gender · age · ethnicity · morphology≠average · hairColor) using existing chip styling.
- Keep the divider.
- Cost row: keep only `3 variations · 20 credits` (or `Free` when `makePublic`). Remove the `Balance {balance}` span on the right.
- Keep the validation error / low-credits tappable link as-is.

### 2. Sticky floating bar (lines 902–931)
- Remove the middle status text entirely when there's no validation error (drop the `20 credits · Balance {balance}` / `Public model · free` span).
- Keep Back button, validation-error message (when present), and Generate button.
- Layout becomes: `Back · [error if any, else spacer] · Generate`.

### Out of scope
- Legacy single-card layout (`inlineFooterBlock`, lines 750–790) is not touched — only the `layout === 'sections'` branch.
- No logic, no new imports.