# Phase 3 — Wizard Shell (Admin-Only)

Goal: stand up the **empty wizard skeleton** at the existing `/app/brand-scenes` route so admins can click through it end-to-end, while regular users keep seeing the current "Coming soon" page. **No category questions yet. No saving to DB. No prompt generation.** Pure UI scaffolding.

---

## Routing & gating

Existing route `/app/brand-scenes` (already in `App.tsx`) keeps its current `BrandScenes` component as the **public landing**. We add one new route:

```text
/app/brand-scenes/new   → BrandSceneWizard  (admin-only)
```

Both pages share the same gate logic:

| Viewer | `/app/brand-scenes` | `/app/brand-scenes/new` |
|--------|---------------------|--------------------------|
| Regular user | Current Coming Soon page (unchanged) | Redirected to `/app/brand-scenes` |
| Admin | Coming Soon page + small "Open wizard (admin)" button visible only to admin | Wizard shell |

Gate source of truth: `useIsAdmin()` (already exists). No env feature flag needed — `useIsAdmin` already returns false for everyone else, which IS the kill switch.

> Sidebar entry is **not** added in this phase. Admins reach the wizard via the new button on the Coming Soon page.

---

## Wizard shell structure

New folder, adjacent to Phase 2 foundation:

```text
src/features/brand-scenes/
  wizard/
    BrandSceneWizard.tsx          // page-level shell with step state
    WizardLayout.tsx              // header, progress, footer (Back / Next / Save draft)
    steps/
      Step1ChooseModule.tsx       // pick category module (apparel/footwear/…)
      Step2BaseAnswers.tsx        // shared base shape inputs (aesthetic, palette, mood…)
      Step3ModuleQuestions.tsx    // placeholder — "Coming in next phase for {module}"
      Step4Review.tsx             // read-only summary + disabled "Save scene" button
    useWizardState.ts             // useReducer over BrandSceneAnswers draft (in-memory only)
  pages/
    (no new pages — page lives in src/pages/BrandSceneWizard.tsx)
```

Plus:
- `src/pages/BrandSceneWizard.tsx` → thin wrapper that gates on `useIsAdmin` then renders `<BrandSceneWizard />`.
- Route added in `src/App.tsx` (single line, lazy import).
- Tiny admin-only button on existing `BrandScenes` page → `navigate('/app/brand-scenes/new')`.

---

## Behavior in this phase

- All 4 steps render. Back / Next navigation works.
- State stays in memory via `useWizardState` (reducer over the Phase 2 `BrandSceneAnswers` type). **No Supabase writes.**
- Step 4 review shows the JSON payload (for admin debugging) + disabled "Save scene" button with tooltip "Available in Phase 6".
- Step 3 shows a clear "Module-specific questions for **{module}** ship in a later phase." placeholder per module — proves the wizard registry pattern works without committing any category content.
- Validation: on Next, run the relevant slice through `brandSceneAnswersSchema` (Phase 2) and surface inline errors via `react-hook-form` + zod resolver (already used elsewhere in the app).

---

## Saugikliai (safety rails)

| Rail | How |
|------|-----|
| Non-admins cannot reach wizard | `useIsAdmin` gate on page + route guard redirect |
| No DB writes | Zero `supabase.from(...).insert(...)` calls — Save button is disabled |
| No RLS surface change | Phase 1 policies already allow only admin or owner — wizard simply doesn't call them yet |
| No sidebar exposure | Sidebar untouched; entry point is the admin-only button on Coming Soon page |
| Existing scene flows untouched | No edits to Product Images, Catalog, Discover, Admin Scenes, or any generate-* edge functions |
| Reversible | Delete `src/features/brand-scenes/wizard/`, `src/pages/BrandSceneWizard.tsx`, revert the App.tsx route + button → fully gone |
| Type safety | Wizard state is `BrandSceneAnswers` from Phase 2; schema mismatch caught at compile time |

---

## Acceptance checklist

- [ ] Admin: visits `/app/brand-scenes`, sees existing Coming Soon page + small "Open wizard (admin)" button.
- [ ] Admin: clicks button, lands on `/app/brand-scenes/new`, walks through 4 steps, Back/Next works, Save button is disabled.
- [ ] Regular user: visits `/app/brand-scenes/new` directly, redirected to `/app/brand-scenes`, sees unchanged Coming Soon (no admin button).
- [ ] Anonymous user: protected by existing `ProtectedRoute`, redirected to `/auth`.
- [ ] No new network calls to `product_image_scenes` from the wizard.
- [ ] Existing Discover, Product Visuals, Admin Scenes pages unchanged.
- [ ] Build passes; Phase 2 tests still green.

---

## Out of scope (explicit)

- No per-module question sets — those land one-by-one in later phases on your signal (Phase 4 = apparel, Phase 5 = footwear, etc.).
- No DB writes / saving — Phase 6.
- No prompt engineering — Phase 7.
- No sidebar entry — added when feature ships to everyone.

After this phase lands I stop and wait for **"let's move to next phase"**.
