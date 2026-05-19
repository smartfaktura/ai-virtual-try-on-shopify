## Audit findings — `/app/models` and `/app/models/new`

Reviewed both pages against the rest of the `/app` shell (Catalog Studio, Bundle Visuals, Generate). Fixes grouped by surface.

---

### A. `/app/models/new` — header

**Issues**
- Title "Create new model" — vague verb. Other create flows in the app use noun-led titles ("New Brand Model", "New Catalog", "New Bundle"). Brand mention is also missing.
- Floating "20 credits per generation" pill on the right duplicates the sticky footer (which already shows cost + balance live).
- Subtitle "Describe your ideal model" is generic.
- Local back link + custom h1 diverges from `PageHeader.backAction` used everywhere else in the app — visual inconsistency.

**Fixes**
- Title → **"New brand model"** (matches "New catalog" / "New bundle" pattern).
- Subtitle → **"Describe the person you want VOVV.AI to create"** (more specific, human).
- Remove the credit pill from the header entirely — the sticky bar is the single source of truth.
- Replace the custom header block with the standard `<PageHeader title subtitle backAction>` component so the back-action button matches Brand Scenes / Catalog / Add Product. This also restores keyboard semantics (real `<Button>` vs link).

### B. `/app/models/new` — sticky action bar

**Issues**
- Bar currently uses `fixed bottom-0 left-0 right-0 lg:left-[260px]` with `bg-background/85 backdrop-blur-md` and a `max-w-3xl` inner container — different from every other workflow:
  - **BundleVisuals**: `border-t border-border bg-background/95 backdrop-blur-sm`, `max-w-5xl`, simple Back/Next.
  - **Generate**: `bg-card border-t border-border shadow-lg`, `lg:left-60`, content + CTA.
- Inconsistent inner width (`max-w-3xl` vs the rest of the app's `max-w-5xl/7xl`).
- The error/validation line wraps inside a tight column; not aligned with the cost row.
- The `lg:left-[260px]` magic number doesn't match the sidebar (others use `lg:left-60` = 240px) → bar is offset slightly on desktop.

**Fixes**
- Adopt the **BundleVisuals pattern** verbatim for visual consistency:
  - `fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm`
  - Inner: `max-w-5xl mx-auto flex items-center justify-between px-4 py-3`
  - Use `lg:left-60` instead of `lg:left-[260px]` to match `Generate.tsx`.
- Layout left → right:
  - **Left**: stacked, single column — line 1 cost/balance (`20 credits · Balance N`), line 2 validation hint (when present) or "Public model — free".
  - **Right**: `Cancel` (ghost) + primary `Generate brand model` (with `<Wand2/>` icon kept).
- Keep `pb-32` page padding so content clears the bar.

### C. `/app/models/new` — mobile experience

**Issues**
- Section cards use `p-6` → uncomfortably tight horizontal padding on small screens, especially with the model-name counter pushed against the edge.
- Sticky footer has `px-4 sm:px-6` but inner buttons currently wrap awkwardly on 360px (cost text + two buttons in one row).
- "Reference image" content-policy callout is fairly tall; the consent checkbox label + policy stack makes the page feel long on mobile.
- The dashed upload tile has `p-8` which feels oversized on phones.
- `BrandedLoadingState` has `w-32 h-32` avatar block + 6 dots — fine but `max-w-xs` info box gets clipped padding on 320px.

**Fixes**
- Section card: `p-4 sm:p-6`.
- Sticky footer at <`sm`: stack vertically — cost row on top, buttons on a second row taking full width (`flex-col sm:flex-row gap-2 sm:gap-4`). Buttons go `flex-1 sm:flex-none`.
- Upload dropzone: `p-6 sm:p-8`.
- Header: title `text-2xl sm:text-3xl` (already PageHeader default — confirms switch in A).
- Loading state: `max-w-xs` → `max-w-[280px] sm:max-w-xs`.

### D. `/app/models` — grid + page polish

**Issues**
- Header CTA reads **"Create New Model"** — Title Case + vague. Sidebar and other CTAs use sentence case ("Create visuals", "Add product").
- Dashed "New model" tile label uses "+ New model" lowercase, but the page CTA says "Create New Model" — two different names for the same action.
- `ModelCard` hover pill says "Use in Studio" but the platform terminology is **Visual Studio** (core memory rule). Should match.
- `ModelCard` chips bg `bg-muted/50` slightly heavier than other chips in the app — minor.

**Fixes**
- Page header CTA → **"New brand model"** (sentence case, matches /new page title).
- Empty-state CTA → **"Create your first brand model"** (was "Create your first model").
- Dashed tile label → **"New brand model"**.
- ModelCard hover pill → **"Use in Visual Studio"** (matches sidebar terminology rule).

### E. Misc consistency

- Empty-state body copy currently has no terminal period — correct per memory rule (single-sentence subtitle). Keep.
- `UnifiedGenerator` legacy `inlineFooterBlock` button label still says "Generate Brand Model (20 credits)" — fine for the (unused now?) card layout; leave.
- "Reference image" callout sentence currently ends with "any reference you upload." — keep (multi-sentence body).
- Make sure the new title casing follows the no-terminal-period rule for short subtitles (it does).

---

## Files to touch

- `src/pages/BrandModelNew.tsx`
  - Replace custom header with `PageHeader` (`title="New brand model"`, `subtitle="Describe the person you want VOVV.AI to create"`, `backAction={{ content: 'Brand Models', onAction: …}}`).
  - Drop the credit pill.
- `src/pages/BrandModels.tsx`
  - Header CTA copy: `Create New Model` → `New brand model`.
  - Empty-state CTA copy: `Create your first model` → `Create your first brand model`.
  - Dashed tile label: `New model` → `New brand model` (verify current copy).
  - `ModelCard` hover pill: `Use in Studio` → `Use in Visual Studio`.
  - `UnifiedGenerator` sticky footer (sections layout):
    - Use Bundle-style classes: `border-border bg-background/95 backdrop-blur-sm` (drop `border-border/60` and `/85`).
    - `lg:left-[260px]` → `lg:left-60`.
    - Inner container `max-w-5xl`.
    - Wrap left column at `<sm`; stack buttons full-width on mobile (`flex-col sm:flex-row`, `flex-1 sm:flex-none` on the two buttons).
  - Section card padding: `p-6` → `p-4 sm:p-6`.
  - Reference dropzone: `p-8` → `p-6 sm:p-8`.
  - `BrandedLoadingState` info box max width: `max-w-xs` → `max-w-[280px] sm:max-w-xs`.

## Out of scope

- No DB / edge function changes.
- No restructure of fields inside the form (already done in prior pass).
- No changes to free/upgrade-gated view.