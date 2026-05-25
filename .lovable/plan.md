# Phases 3 + 4 + 5 — Wizard UX, Storage Hygiene, Polish

Three focused phases bundled. Each is small; total ≈6 files touched.

---

## Phase 3 — Wizard UX correctness

### 3.1 Guard step-jump so it never lands on a hidden step
File: `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`

The `onGoToStep` handler passed to `WizardLayout` currently dispatches `setStep` raw. When a family has ≤1 sub-family the user can still land on step 2 via a deep link / cached state. Wrap the dispatch:

```ts
const onGoToStep = (s: WizardStep) => {
  if (s === 2 && subFamilyCount <= 1) {
    dispatch({ type: "setStep", step: 1 });
    return;
  }
  dispatch({ type: "setStep", step: s });
};
```

### 3.2 Snap on mount if persisted step is now hidden
Same file. Add a one-shot effect: if the initial reducer state loads `step === 2` but the resolved `subFamilyCount <= 1` for the persisted module, dispatch `setStep` to step 1 (or step 3 if module + reference flow already valid). Prevents the wizard from booting onto a step that has no content.

### 3.3 Reference-flow Back from Step 6
`handleBack` from step 6 in reference flow currently jumps to step 4 (Cast). If the user reached step 6 via the auto-cast skip path, sub-step state is stale — already handled by snapping to the last sub-step. Verified OK; no change. *(noted so QA doesn't re-flag)*

No type changes, no new state.

---

## Phase 4 — Storage hygiene on scene delete

File: `src/pages/BrandScenes.tsx`

Today `handleDelete` removes the DB row only. The `preview_image_url` lives in storage and becomes orphaned.

Update `handleDelete`:

1. Before the DB delete, parse the storage path out of `target.preview_image_url`. The preview is written by the generation pipeline to the user's product-images bucket — extract `(bucket, key)` from the public URL by splitting on `/storage/v1/object/public/`.
2. If parsing succeeds, call `supabase.storage.from(bucket).remove([key])`. Swallow individual errors with a `console.warn` — the DB delete must still proceed.
3. Also remove the reference image (when present) from `BRAND_SCENE_REFERENCE_BUCKET`. The row exposes `reference_image_paths` on the scene metadata; widen the `SELECT` in the list query to include it.
4. Keep the existing toast / `invalidateQueries` behaviour.

No RLS migration needed — current storage policies already allow owners to delete their own files. No new dependencies.

---

## Phase 5 — Polish & empty states

### 5.1 Step 6 — empty variation grid CTA
File: `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`

When `phase === "picking"` but `variations.length === 0` (cache invalidated, network blip), render a small empty state with a single "Regenerate" button that re-fires the existing generate handler. Today the user sees an empty white block.

### 5.2 List page polish
File: `src/pages/BrandScenes.tsx`
- Empty state primary CTA: ensure label matches the header "New scene" button (single wording).
- Skeleton: tighten rows to match the real card aspect ratio (currently taller than the loaded cards, causes layout shift).

### 5.3 Active filter/sort chip color
Same file — swap any hard-coded chip colors for `bg-primary text-primary-foreground` / `border-primary` semantic tokens.

### 5.4 Mobile overflow in Step 4 question groups
File: `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (only the wrapper of the sub-step tabs / pill groups). Add `min-w-0` + `flex-wrap` to the tab row container so long labels (e.g. "Continue to Interaction") don't push the page horizontally on 390px viewports.

No copy changes outside the empty-state CTA; no token additions to `index.css`.

---

## Out of scope

- Backend / RLS / DB schema changes
- Prompt-engine edits beyond what's already shipped
- Adding new sub-families, modules, or interaction enums
- Wholesale redesign of the list page or wizard

## Verification

- **3.1/3.2**: Set `localStorage` wizard state to `{ step: 2, module: "tech" }`, reload `/app/brand-scenes/new` → lands on step 1 or 3, never step 2.
- **3.1**: Click the progress bar on any step → never navigates to step 2 when sub-family count ≤1.
- **4**: Generate a scene, delete it, open Lovable Cloud storage → preview file and (if used) reference file are gone. DB row gone, toast shown. If the file was already missing, deletion still succeeds with a `console.warn`.
- **5.1**: On Step 6, clear `variations` via cache invalidation (edit an earlier step) → empty state with "Regenerate" appears.
- **5.2**: Hard refresh `/app/brand-scenes/` with throttled network → skeleton row height matches the real card height (no jump).
- **5.4**: Open Step 4 at 390×844 → no horizontal scrollbar, tabs wrap.
- Run typecheck, no new TS errors; no new console warnings in dev.

Approve to implement all three phases (run sequentially: 3 → 4 → 5).