
## Goal
Evolve the existing **Short Film** workflow into a **Commerce Video Engine** — intent-aware, category-aware, fidelity-first — without breaking the current 6-step wizard, drafts, queue/polling, audio pipeline, or live projects.

This is a **large, multi-phase upgrade**. I'll deliver it in 4 phases inside this loop, then leave Phase 4 (deeper analytics/audio polish) as a clearly-scoped follow-up if budget runs out. All work stays additive and backward-compatible.

## Architecture overview

```
                   ┌──────────────────────────┐
   Wizard step ──▶ │   Content Intent (NEW)   │ ──┐
                   │  + platform, pace,       │   │
                   │  soundMode, productPri,  │   │
                   │  ending, clarityFirst    │   │
                   └──────────────────────────┘   │
                                                  ▼
   Film Type ──▶  ┌────────────────────────────────────────┐
   Category ──▶  │     Unified Canonical Schema (NEW)     │
   References ─▶ │  enums, types, migration & normalize   │
                 └────────────────────────────────────────┘
                                  │
                ┌─────────────────┼──────────────────┐
                ▼                 ▼                  ▼
        Intent-aware       Category modules    Reference/Continuity
        AI Director        (per category)      Engine (extended)
                │
                ▼
        Adaptive Story Structures + Adaptive Duration
                │
                ▼
        Prompt Builder (P1/P2/P3 priority, fidelity-first)
                │
                ▼
        Pre-flight Validator (score 0–100, warnings)
                │
                ▼
        Existing queue / Kling v3 / audio pipeline (unchanged)
                │
                ▼
        Project + shot-level analytics (NEW)
```

## Phase 1 — Foundation (additive, zero breakage)

**Files (new):**
- `src/types/commerceVideo.ts` — single source-of-truth schema: `ContentIntent`, `Platform`, `SoundMode`, `PaceMode`, `ProductPriority`, `EndingStyle`, `ProductCategoryKey`, `ProductFidelity`, extended `ShotPlanItem` fields (`clarity_first`, `branding_accuracy_priority`, `material_accuracy_priority`, `shape_accuracy_priority`, `text_legibility_priority`, `continuity_lock`, `reference_strategy`).
- `src/lib/commerceVideo/contentIntents.ts` — intent options, labels, defaults, friendly UI labels ("PDP Video", "Creator Style", etc.).
- `src/lib/commerceVideo/migrate.ts` — `migrateLegacyDraft(draft)` → fills `contentIntent: 'product_showcase'` (or smarter map from filmType), normalizes old enums, logs `[migrate]` events.
- `src/components/app/video/short-film/ContentIntentStep.tsx` — new wizard step UI (intent grid + platform pill + pace + sound + productPriority + ending + clarityFirst toggle + audience/offer text).

**Files (extended):**
- `src/types/shortFilm.ts` — extends `ShortFilmStep` to include `'content_intent'`; adds optional `contentIntent`, `platform`, `paceMode`, etc. on settings (all optional → backward compatible).
- `src/hooks/useShortFilmProject.ts` — inserts `'content_intent'` into `steps` array between `film_type` and `references`; `loadDraft` runs `migrateLegacyDraft`; `saveDraft` writes new fields; old drafts auto-default.
- `src/pages/video/ShortFilm.tsx` — renders new step.
- `src/components/app/video/short-film/ShortFilmStepper.tsx` — labels new step "Intent".

## Phase 2 — Smart planning

**Files (new):**
- `src/lib/commerceVideo/storyStructures.ts` — adds 14 new structures (`reveal_detail_finish`, `clean_pdp_hero_detail_context`, `hook_demo_benefit_cta`, `ugc_hook_reaction_demo_cta`, etc.). Each entry: `bestFitIntents`, `recommendedShotCount`, `durationRangeSec`, `minProductVisiblePct`, `characterPolicy`, `voPolicy`, `ctaPolicy`.
- `src/lib/commerceVideo/categoryModules.ts` — 12 modules (fashion_apparel, footwear, beauty_skincare, makeup, fragrance, jewelry, accessories, home_decor, food_beverage, supplements, electronics, general_product). Each: preferred shot roles, scene types, camera motions, mandatory coverage, negatives, continuity rules, pacing bias, ending tendencies.
- `src/lib/commerceVideo/clarityFirst.ts` — `applyClarityFirst(plan)` — boosts product-visible time, swaps abstract framing for stable motion, ensures hero + detail shots, locks ending to `product_close`/`clean_brand_close`.
- `src/lib/commerceVideo/endingPlanner.ts` — `pickEnding({intent, platform, soundMode, clarityFirst, offerContext, userOverride})`.
- `src/lib/commerceVideo/durationPlanner.ts` — adaptive `planDuration({intent, platform, shotCount, pace, category, clarityFirst})` → e.g. social hook 4–6s, brand mood 10–15s. Falls back to current proportional scaling.

**Files (extended):**
- `src/lib/shortFilmPlanner.ts` — `generateShotPlan` accepts new context; preset planner becomes intent-aware. Auto-selects structure if user doesn't override. Existing call signature preserved with optional 2nd arg.
- `supabase/functions/ai-shot-planner/index.ts` — accepts `contentIntent`, `platform`, `paceMode`, `productPriority`, `clarityFirst`, `category`, `audienceContext`, `offerContext` in payload. System prompt rewritten to be intent-aware (separate guidance blocks per intent, removes "always sell" bias, makes VO conditional on `soundMode`/intent). Returns `ShotPlanItem`s with new fidelity fields.

## Phase 3 — Fidelity, references, prompt priority

**Files (new):**
- `src/lib/commerceVideo/productFidelity.ts` — `buildProductFidelity({category, productName, hasPackagingRef, hasLogo})` → returns `mustPreserveAttributes`, `*Sensitivity` flags. Auto-raises strictness for hero/packaging/detail/PDP/showcase shots.
- `src/lib/commerceVideo/continuityEngine.ts` — extends current single-ref logic. Per-shot `referenceStrategy` (mapped reference type per shot role). Continuity controls: `keepSameModel`, `keepSameOutfit`, `keepSameEnvironment`, `keepSameLightingFamily`, `keepSameProductState`. Reference type enum (`main_hero`, `front`, `side`, `back`, `top`, `bottom`, `texture`, `packaging`, `opened`, `closed`, `in_hand`, `on_body`, `scale_reference`, `ingredient_reference`, `variant_reference`, `brand_model`, `brand_scene`).

**Files (extended):**
- `src/components/app/video/short-film/ReferenceUploadPanel.tsx` — adds reference type tagging (extends current role concept with the canonical 17-type enum). Continuity toggle group.
- `src/lib/shortFilmPromptBuilder.ts` — major refactor of `buildShotPrompt`:
  - **P1 (never truncate)**: product identity lock, must-preserve, role objective, framing, reference tokens, category hard constraints, continuity, intent guidance, clarity-first constraints.
  - **P2**: camera/subject motion, user notes, pace, product priority.
  - **P3 (truncate first)**: tone flavor, lens mood, lighting nuance, color grading.
  - Token budget enforcement that drops P3 → P2 (never P1).

## Phase 4 — Validation, analytics, audio polish

**Files (new):**
- `src/lib/commerceVideo/preflight.ts` — `validateProject({intent, shots, references, category, settings})` → returns `{score: 0-100, errors: [], warnings: [], suggestions: []}`. Scores hero clarity, detail coverage, ending suitability, fidelity risk, reference adequacy, VO/visual alignment, duration fit, platform fit.
- `src/components/app/video/short-film/PreflightPanel.tsx` — shown on Review step; warnings non-blocking, errors block.
- `src/lib/commerceVideo/analytics.ts` — `logProjectMetadata`, `logShotMetadata`, `logNormalizationEvent` → writes to `video_projects.settings_json.commerce_telemetry` (no schema change needed initially).

**Files (extended):**
- `src/components/app/video/short-film/ShotPlanEditor.tsx` & `ShotCard.tsx` — expose per-shot `clarity_first`, `preservation_strength`, `branding_accuracy_priority`, continuity lock badges, reference assignment dropdown.
- `src/components/app/video/short-film/ShortFilmReviewSummary.tsx` — shows preflight score + intent + platform + ending style.
- `src/hooks/useShortFilmProject.ts` — soundMode handling: `silent_first`/`caption_first`/`music_only`/`no_voiceover` properly disable VO generation; existing `audioLayers` mapped from soundMode for backward compat.

## Backward compatibility guarantees

- All new fields are **optional**. Drafts without them get `migrateLegacyDraft` defaults (intent → `product_showcase`).
- `video_projects` / `video_shots` table schemas **unchanged** — new data lives inside existing JSONB columns (`draft_state_json`, `settings_json`, `strategy_json`).
- Existing `generateShotPlan`, `buildShotPrompt`, `useShortFilmProject` keep their public signatures; new params are optional.
- Old projects in `processing` continue to recover via current logic.
- Pricing untouched — flat 40 credits per generation stays.

## Out of scope (this pass)

- Renaming the `short_film` workflow_type in DB (kept as umbrella).
- New DB tables — telemetry initially in JSONB.
- Per-platform aspect-ratio auto-switching (planner suggests, user still confirms in Settings step).
- Caption/on-screen-text rendering (only metadata generated; rendering is a future feature).

## Risk & mitigation

- **Risk**: AI planner regression. **Mitigation**: feature-flag intent-aware path on contentIntent presence; fall back to current planner if absent.
- **Risk**: prompt builder over-constrains and Kling rejects. **Mitigation**: P1/P2/P3 budget; logged truncation events; pre-existing 512-char smart-truncation kept.
- **Risk**: UI overload on the new step. **Mitigation**: progressive disclosure — only `contentIntent` + `platform` are required; rest collapsed under "Advanced".

## Definition of done

The 12 acceptance criteria from your brief — explicitly verified during build with a `/app/video/short-film` smoke test, plus an old-draft load test to confirm migration.
