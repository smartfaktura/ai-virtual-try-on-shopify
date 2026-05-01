# Free Plan Limits Across the Product Images Wizard

Apply Free-plan caps to the bulk-selectors in `/app/generate/product-images`, with consistent inline upgrade messaging. Paid users (Starter, Growth, Pro, Enterprise) keep full multi-select.

## Verified findings before planning

- Step 1 product picker is **rendered inline in `src/pages/ProductImages.tsx`** (around lines 1333–1525). The standalone `ProductImagesStep1Products.tsx` is **not** used in this flow — editing it would do nothing.
- Step 2 = `ProductImagesStep2Scenes.tsx` (imported lazily).
- Step 3 = `ProductImagesStep3Refine.tsx` (Refine — the other Step3 files are not used here).
- `BackgroundSwatchSelector` writes a comma-separated string to `details.backgroundTone` via `onChange` (line 2485). Capping in `onChange` is safe.
- Model picker writes to both `selectedModelIds` and `selectedModelId` (lines 2547–2551). Capping the array to one element is safe and preserves downstream logic in `ProductImages.tsx` line 595, 783, 1052.
- `plan` field is already exposed by `useCredits()` from `CreditContext`. No backend work needed.

## Free-plan caps

| Step | Selector | Free cap | Paid |
|------|----------|----------|------|
| 1 — Products | Product cards | **1 product** | unlimited (`MAX_PRODUCTS = 20`) |
| 2 — Shots | Scene tiles | **3 shots** total | unlimited |
| 3 — Setup | Brand model picker | **1 model** | unlimited |
| 3 — Setup | Background colors | **1 color/gradient** | unlimited |

## Behavior

**Step 1 — Products (edits in `ProductImages.tsx`)**
- Selecting a new product when one is already chosen swaps it (single-select, no toast).
- Banner above the grid: *"Free plan: select 1 product at a time. Upgrade to generate visuals for multiple products in one batch"* + Upgrade link.

**Step 2 — Shots (edits in `ProductImagesStep2Scenes.tsx`)**
- Tapping a 4th shot is silently ignored; small inline hint flashes (auto-clear ~2.5s): *"3 shot limit on Free — upgrade for unlimited"*.
- Persistent banner at top: *"Free plan: up to 3 shots per generation. Upgrade for bulk shot selection"*.
- Hide per-category "Select All" buttons.

**Step 3 — Model picker (edits in `ProductImagesStep3Refine.tsx`)**
- On Free: every selection collapses to `selectedModelIds = [newId]`, `selectedModelId = newId`.
- Caption under section title with Upgrade link.

**Step 3 — Background swatches**
- On Free: every `onChange(v)` is reduced to its last comma-token before being applied.
- Hide the "×N selected" badge on Free.
- Caption with Upgrade link.

## Technical Details

1. **`src/pages/ProductImages.tsx`**
   - Add `const { plan } = useCredits();` and `const isFree = plan === 'free';`.
   - **Step 1 selection logic (lines 1519, 1522)**: when `isFree`, replace the toggle expression with `setSelectedProductIds(s.has(up.id) ? new Set() : new Set([up.id]))`.
   - Render upgrade banner above the product grid when `isFree` (mount `UpgradePlanModal` locally with a `useState` for open).
   - Disable the "Select all filtered" action (line 1355) when `isFree`.
   - Pass `isFree` to `ProductImagesStep2Scenes` and `ProductImagesStep3Refine` as a new prop.

2. **`src/components/app/product-images/ProductImagesStep2Scenes.tsx`**
   - Add `isFree?: boolean` to `Step2Props`.
   - In the scene-toggle handler: if `isFree && !selected && selectedSceneIds.size >= 3`, return early and trigger a transient `setLimitHint(true)` (clear after 2500 ms with `setTimeout`).
   - Render persistent top banner + transient hint near the bottom; mount `UpgradePlanModal` locally.
   - Hide per-category "Select All (X/Y)" buttons when `isFree`.

3. **`src/components/app/product-images/ProductImagesStep3Refine.tsx`**
   - Add `isFree?: boolean` to its props (extend the existing prop interface).
   - **Model picker (lines 2547–2551)**: wrap both `onSelect` and `onMultiSelect` with `if (isFree) { update({ selectedModelIds: [newId], selectedModelId: newId }); return; }`.
   - **Background swatches (line 2485)**: wrap onChange — `onChange={v => { const last = isFree ? (v.split(',').filter(Boolean).pop() || '') : v; update({ backgroundTone: last }); }}`.
   - Hide the "×N selected" badge (line 2469-2473) when `isFree`.
   - Add upgrade caption + button under each affected section title.

Banner / caption pattern (consistent across all locations, fits the minimalist luxury style memory):
```tsx
<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs">
  <Sparkles className="w-3.5 h-3.5 text-primary" />
  <span className="text-muted-foreground">{message}</span>
  <button onClick={() => setUpgradeOpen(true)} className="ml-auto text-primary font-medium hover:underline">Upgrade</button>
</div>
```

## Safety check

- No database, edge-function, pricing-config, or generation-pipeline changes — purely frontend gating.
- Existing `MAX_PRODUCTS = 20` and credit balance checks remain intact for paid users.
- Caps are enforced **only at the UI input layer**; downstream code (prompt builder, batch enqueue, credit estimator at `pages/ProductImages.tsx:595, 767, 783`) already tolerates 1-element arrays — they currently fall back to `|| 1`.
- A user who upgrades mid-session keeps any existing selection intact (caps gate new actions, never trim existing state — avoids surprise data loss).
- `discoverSceneFull` deep-link path on Step 2 (line 1562) is untouched; if a Free user arrives via a deep link it still works because we only cap *additions*.
