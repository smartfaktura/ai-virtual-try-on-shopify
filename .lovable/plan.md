# Phase 2 — Types & Validation Foundation

Goal: lay down the **TypeScript + Zod foundation** for brand scenes so every later phase (wizard, generation, RLS-aware reads) speaks the same language. **No UI, no behavior change, no DB change.** Pure additive code in a new isolated folder.

---

## What we build

### 1. New isolated folder
```text
src/features/brand-scenes/
  types.ts          // TS interfaces + enums
  schema.ts         // Zod schemas (runtime validation)
  constants.ts      // SCHEMA_VERSION, ID prefix, module list
  index.ts          // public re-exports
  __tests__/
    schema.test.ts  // round-trip + reject-bad-input tests
```

Nothing else in the app imports from here yet. Safe to delete if we abort.

### 2. Core types (mirrors the 6 new DB columns)

- `BrandSceneModule` — union of category modules we'll build wizards for, one at a time:
  `'apparel' | 'footwear' | 'eyewear' | 'bags' | 'fragrance' | 'activewear' | 'accessories' | 'beauty' | 'home'`
- `BrandSceneAnswers` — discriminated union keyed by `module`. Phase 2 ships only the **shared base shape** (aesthetic, palette, mood, lighting, location, framing) + an empty per-module slot. Each category wizard fills its slot in its own future phase.
- `BrandScene` — full row shape matching `product_image_scenes` + brand fields.
- `BrandSceneDraft` — pre-insert shape (no id, no timestamps).

### 3. Zod schemas (`schema.ts`)
- `brandSceneAnswersSchema` — validates JSONB before insert/update.
- `brandSceneDraftSchema` — validates a wizard payload end-to-end.
- Hard rules enforced in Zod (mirrors DB trigger, double safety):
  - `scene_key` starts with `brand-`
  - `category_collection !== 'bundle'`
  - `is_brand_scene === true`
  - `sort_order >= 0`
  - `schema_version === CURRENT_SCHEMA_VERSION` (starts at `1`)

### 4. Constants
- `BRAND_SCENE_SCHEMA_VERSION = 1`
- `BRAND_SCENE_KEY_PREFIX = 'brand-'`
- `BRAND_SCENE_MODULES` array (drives wizard registry later)

### 5. Tests (`__tests__/schema.test.ts`)
- Valid draft passes.
- Missing `brand-` prefix rejected.
- `category_collection: 'bundle'` rejected.
- Wrong schema version rejected.
- Unknown module rejected.

Run via `bunx vitest run src/features/brand-scenes`.

---

## Safety guarantees (saugikliai)

| Rail | How |
|------|-----|
| Zero DB impact | No migration in this phase |
| Zero UI impact | New folder, not imported anywhere |
| Zero edge function impact | Not touched |
| Reversible | `rm -rf src/features/brand-scenes` undoes everything |
| Feature flag still off | `brand_scenes_enabled` stays false |
| Schema versioning baked in | Future shape changes bump `SCHEMA_VERSION`, old rows stay readable |

---

## Out of scope for Phase 2 (explicit)

- No wizard UI, no route, no sidebar entry
- No category-specific question sets (those come one-by-one in later phases, on your signal)
- No insert/update calls to Supabase
- No edits to existing scene hooks/components
- No prompt-engineering logic

---

## Acceptance checklist

- [ ] New folder created, builds clean
- [ ] `bunx vitest run src/features/brand-scenes` passes
- [ ] `rg "from '@/features/brand-scenes'"` returns **0 hits** outside the folder itself
- [ ] No diff in any existing file except possibly `.lovable/plan.md`

After this lands I stop and wait for **"let's move to next phase"** before starting Phase 3 (wizard shell, admin-only behind the feature flag).
