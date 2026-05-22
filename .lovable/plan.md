## Brand Scenes — phased, admin-gated build

A Brand Scene = a `product_image_scenes` row owned by a user. No new table, no new generation pipeline, no aspect-ratio column. Existing engine, scene picker, and Create with Prompt keep working unchanged.

```text
Wizard (per-category module)
  -> typed Answers (validated)
    -> Compiler (pure, staged, snapshot-tested)
      -> row in product_image_scenes (owner_user_id = me)
        -> appears in Product Visuals + Create with Prompt
          -> generation engine uses it as-is
```

### Two non-negotiable rules

- **Additive only** — never rename, never drop, never change behavior of existing scenes.
- **Hidden until proven** — every new surface is **admin-only** while we build. Regular users keep seeing the current "Coming soon" page until we explicitly flip it on.

### Phase gating

We execute one phase at a time. After a phase ships, we stop and wait. You write **"let's move to next phase"** and we start the next one. Nothing in a later phase is touched before you say so.

The gate is enforced by `useIsAdmin()` on the route + a server-side admin check in any new RPC. No env feature flag needed — admin role is the flag.

---

## Phase 0 — Safety audit (no code changes)

**What we do:** read-only audit of every place that touches `product_image_scenes`:
`useProductImageScenes`, `useSceneCatalog`, `useInterleavedSceneCatalog`, admin page, `get_public_recommended_scenes`, `get_scene_popularity`, `toggle_scene_featured`. Write a short note in `.lovable/brand-scenes-audit.md` confirming new columns + new RLS won't change what anon/admin currently see.

**Deliverable:** audit doc. Nothing user-visible changes.

**Gate:** you say "next phase".

---

## Phase 1 — Migration (additive only)

**Add to `product_image_scenes`:**

- `owner_user_id uuid null`  — null = admin/global, set = private user scene
- `is_brand_scene boolean not null default false`
- `brand_scene_answers jsonb not null default '{}'::jsonb`
- `brand_scene_schema_version int not null default 1`
- `brand_scene_module text null`  — e.g. `'activewear.v1'`
- `source_generation_id uuid null`

Indexes: `(owner_user_id, is_active)` + partial `where is_brand_scene`.

**RLS (tightened, behavior-preserving):**
- Anon SELECT: `is_active AND owner_user_id IS NULL` (current public behavior preserved).
- Authenticated SELECT: `is_active AND (owner_user_id IS NULL OR owner_user_id = auth.uid())`.
- Admin SELECT/UPDATE/DELETE: full.
- User INSERT: only if `owner_user_id = auth.uid() AND is_brand_scene = true`.
- User UPDATE/DELETE: only on own brand scenes.

**BEFORE INSERT/UPDATE trigger (saugiklis):**
- Force `scene_id` prefix `brand-<short-uid>-<slug>` when `is_brand_scene = true`.
- Forbid flipping `owner_user_id` once set.
- Forbid non-admin `sort_order < 0` (featured slots admin-only).
- Forbid `category_collection = 'bundle'` for user scenes.

**Deliverable:** migration applied, smoke check: public scene picker unchanged for anon user.

**Gate:** you say "next phase".

---

## Phase 2 — Types & validation (foundation, no UI)

`src/lib/brandScenes/types.ts` — `FieldSpec` union (select/multi/chips/color/text/toggle/slider), `CategoryModule`, `CompiledScene`.

`src/lib/brandScenes/validation.ts` — auto-derives zod schema from a module's `FieldSpec[]`. Wizard + compiler share one source of truth.

**Deliverable:** types + validation + one tiny unit test on a stub module.

**Gate:** you say "next phase".

---

## Phase 3 — Compiler (pure, staged, snapshot-tested)

`src/lib/brandScenes/compiler/` — pure function `compile(answers, module, ctx) -> CompiledScene`.

Fixed stage order, each returns `{ text, triggerBlocks[], negatives[] }`:
1. productAnchor (`[PRODUCT IMAGE]`, `{{productName}}`)
2. subject (`[MODEL IMAGE]` if with_model)
3. environment + palette
4. composition + framing
5. lighting
6. camera (uses `scene_type` 35/50/85mm — never sets ratio)
7. outfit (delegates to outfit subsystem)
8. mood
9. fidelity reminders (product preservation, color saugiklis)
10. negatives (module forbidden + auto-derived)

Literal tokens preserved: `[PRODUCT IMAGE]`, `[MODEL IMAGE]`, `{{productName}}`, `{{aestheticColor}}`, `{{brandLogoText}}`. Sanitize free-text inputs. **No aspect ratio anywhere.**

Snapshot tests: `__tests__/<module>.snapshot.test.ts` — fixed `answers.json` → expected `prompt_template.txt`. Compiler changes must explicitly bump fixtures.

**Deliverable:** compiler + first snapshot test against a stub module.

**Gate:** you say "next phase".

---

## Phase 4 — Outfit subsystem (isolated)

`src/lib/brandScenes/outfit/` — `buildOutfitHint(...)` returns `null` for product-only, otherwise generates outfit prose from `aestheticColor + formality + layering`, reusing existing product-aware nullification (`outfitConflictResolver`). Writes into the existing `outfit_hint` column.

**Deliverable:** outfit generator + unit tests.

**Gate:** you say "next phase".

---

## Phase 5 — Wizard shell (admin-only)

Route: `/app/brand-scenes` — **gated by `useIsAdmin()`**. Non-admin users keep seeing today's "Coming soon" page (we leave it untouched and conditionally render the wizard above it for admins only).

```text
if (isAdmin) render <BrandSceneWizard />
else         render <BrandScenesComingSoon />   // current page
```

Wizard is pure shell, driven entirely by `FieldSpec` — no per-category JSX:

1. Pick category (cards; only registered modules appear).
2. Pick subcategory + subject mode.
3. Auto-rendered form from `module.fields` (with `dependsOn`).
4. Live preview panel: compiled prompt + outfit hint + trigger summary (read-only).
5. "Generate preview" → reuses existing Product Visuals generation on a sample/selected product (same cost as one Visual).
6. "Save Brand Scene" → insert row with `owner_user_id = auth.uid()`, `is_brand_scene = true`.

Reuses: `ScenePreviewThumb`, Curator Pick color picker, trigger block chips, existing image generator. No new generation pipeline.

**Deliverable:** wizard runs end-to-end for admins against a stub module, saves a real row, regular users see no change.

**Gate:** you say "next phase".

---

## Phase 6 — Integration (admin-only visibility)

- `useProductImageScenes` / `useSceneCatalog`: queries already return `owner_user_id IS NULL OR auth.uid()` rows under new RLS. Add a client-side "My Brand Scenes" group at the top **only when the user is admin** during this phase (a one-line guard). Once we lift the gate in Phase 8, every user sees their own group.
- Product Visuals Step 2 + Create with Prompt scene picker: pinned "My Brand Scenes" group above recommended categories (admin-gated during build).
- `generate-workflow` edge function: **unchanged**.
- Admin `/app/admin/product-image-scenes`: add filter chip "Brand Scenes", owner badge, read-only banner on user-owned rows.

**Deliverable:** admin can save a Brand Scene in the wizard and immediately use it inside Product Visuals + Create with Prompt at any ratio.

**Gate:** you say "next phase".

---

## Phase 7 — Per-category onboarding (one category per cycle)

For each category we ship one file: `src/lib/brandScenes/modules/<category>.ts` (`subjectModes`, `subcategories`, `fields[]`, `defaults`, optional `compose()`) + `__tests__/<category>.snapshot.test.ts`.

Registry adds it to the picker. No migration, no compiler change, no wizard change.

Launch order: **activewear → eyewear → footwear → apparel → backpack → fragrance → portraits**. We stop after each category and wait for "next phase" before starting the next.

**Deliverable per cycle:** one category fully working in the admin-only wizard with 2 reference scenes hand-built and verified.

**Gate:** you say "next phase" before each new category.

---

## Phase 8 — Public rollout (remove admin gate)

Only after a category passes QA do we flip its visibility from admin-only to all users:

1. Remove the `useIsAdmin()` guard on `/app/brand-scenes` (and on the "My Brand Scenes" group surfacing in Product Visuals + Create with Prompt).
2. Replace the "Coming soon" page with the wizard for everyone.
3. Keep per-module registry flags so we can roll out categories one at a time even after the route is public.

QA checklist before flipping:
- 2 reference scenes per launched category generated at 1:1, 4:5, 16:9 in both Product Visuals and Create with Prompt.
- Anon users still see exactly the same scenes as today.
- User B cannot see User A's brand scenes (RLS test).
- `cancel_queue_job`, `get_public_recommended_scenes`, `get_scene_popularity`, `toggle_scene_featured` still work.

**Gate:** you say "go live" per category.

---

## Versioning + future-proofing

- `brand_scene_schema_version` + `brand_scene_module` (e.g. `activewear.v1`) let us evolve compiler/modules without breaking old rows.
- Old rows keep their stored `prompt_template`; re-save runs the current compiler.
- Module registry is open: add a file → register → ship.
- Compiler stages independently swappable — upgrade `lighting.ts` once, every category benefits.

## What we explicitly do NOT add

- No new table.
- No `aspect_ratio` column or picker in Brand Scenes.
- No parallel generation pipeline.
- No per-category React forms (FieldSpec only).
- No client-side prompt assembly at generation time.
- No admin-only privileges granted to users (sort_order < 0, bundle category, owner_user_id flipping all blocked at DB level).

---

## How we execute

Approving this plan starts **Phase 0 only**. I'll stop after the audit and wait. When you write "let's move to next phase", I do Phase 1. Repeat until Phase 8.
