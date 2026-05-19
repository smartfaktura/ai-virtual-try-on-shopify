## Scope

Six small fixes across `/app/models` and `/app/models/new`.

---

### 1. Fix empty state on `/app/models`

Currently the empty state shows AND the `PageHeader` "Create New Model" button still renders above it → two CTAs.

- When `models.length === 0` (paid users), suppress the header's "Create New Model" action — render `PageHeader` without the button so only the single "Create your first model" pill in the empty state remains.
- Polish empty-state copy/visual to match the platform's editorial restraint:
  - Slightly lighter title weight (`font-medium`) to match other surfaces
  - Wider body text container, calmer line-height
  - Subtle dashed-border illustration tile (matches the dashed "New model" tile in the grid) instead of the filled muted square
  - Single primary pill CTA stays: "Create your first model"

### 2. `Create New Model` → header CTA stays only when grid is populated (no redundancy fix needed beyond #1)

### 3. Appearance section collapsed by default

In `UnifiedGenerator` sections layout, wrap the **Appearance** section in a collapsible (using existing `Collapsible` primitive). Header row shows title + "All optional" hint + chevron. Collapsed by default. Reference section stays expanded (it's now always-open by design). Essentials always expanded.

### 4. Age inline with the other essentials, not in its own column

Right now Essentials uses `grid sm:grid-cols-2` putting Gender / Age side-by-side and Region / Morphology stacked below. Restructure to a single coherent rhythm:

- Row 1: **Model name** (full width)
- Row 2: **Gender** chips (full width, compact)
- Row 3: **Age** slider (full width — slider needs the room and reads more naturally horizontal)
- Row 4: **Region / Look** select (full width)
- Row 5: **Morphology** chips (full width)

Removes the awkward orphaned column and gives the slider proper breathing room.

### 5. Model name length restriction

- Hard cap input `maxLength={32}` (was 40)
- Add a small character counter under the input (`{modelName.length}/32`) that turns muted → warning at ≥28
- Minimum 2 chars validated for generation

### 6. Validation + disabled-button hint message

Today the Generate button greys out silently when something is missing. Add a derived `validationError` string with priority:

1. `!modelName.trim() || modelName.trim().length < 2` → "Add a model name (min 2 characters)"
2. `uploadedUrl && !termsAccepted` → "Confirm the content & rights policy to continue"
3. `isUploading` → "Waiting for upload to finish…"
4. `!makePublic && balance < 20` → "Not enough credits — top up to continue" (this one keeps the existing buy-credits link)
5. otherwise `null`

UI:
- Sticky footer (sections layout): when `validationError` is set, show it as a small inline message left of the Cancel/Generate buttons, in `text-destructive/80` for the credit case and `text-muted-foreground` for the other cases. Button stays disabled.
- Also show it inside the inline (legacy) footer for symmetry.
- Add a `title={validationError}` tooltip attribute on the disabled Generate button so hover also reveals the reason.

Also tighten `canGenerate` to require `modelName.trim().length >= 2`.

### 7. Content policy copy

Drop the sentence `"Violations may result in account suspension."` from the reference policy callout. Keep the rest.

---

## Files

- `src/pages/BrandModels.tsx`
  - Empty-state block (~line 971-987): refine layout/typography, switch tile to dashed style
  - Page header (~line 930-938): only render the `<Button>` action when `models.length > 0`
  - `UnifiedGenerator`:
    - `essentialsBlock`: restructure to single-column ordering above
    - `modelName` `Input`: `maxLength={32}` + counter below
    - Add `validationError` derived value; tighten `canGenerate` to require name length
    - Wrap Appearance section in `Collapsible` (sections layout only), default closed
    - Sticky footer + inline footer: surface `validationError` next to the Generate button; pass to `title=` on the button
    - Reference policy: remove the "Violations may result in account suspension." sentence

## Out of scope

- No backend / edge function / DB changes (the existing edge function already validates server-side; this is purely client-side UX clarification)
- No `ModelCard` grid changes
- No changes to the upgrade-gated (free) view