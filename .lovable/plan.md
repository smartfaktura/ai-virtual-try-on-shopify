

# Backend Motion Strategy Engine — Deep Logic Upgrade

## What This Changes

The backend pipeline for Animate Image gets upgraded from a prompt-phrase-substitution system into a true motion decision engine. The UI stays as-is except for passing scene type to MotionGoalSelector. All 12 issues from the review are addressed.

---

## Technical Plan

### Phase 1 — Scene-Aware Motion Matrix, Action Resolver, Auto Resolution, Scene Normalization

**1. Rewrite `src/lib/videoMotionRecipes.ts`**

Add a `CATEGORY_SCENE_MOTION_MATRIX` — a nested map of `category → sceneType → goalId[]` that defines which goals are valid/recommended per combination. Example:

```text
fashion_apparel:
  on_model: [subtle_fashion_pose, fabric_movement, editorial_walk_start, hand_adjustment]
  flat_lay: [premium_campaign_reveal, fabric_movement]
  studio_product: [premium_campaign_reveal, luxury_product_reveal]
  action_scene: [editorial_walk_start, fabric_movement]
  ...
sports_fitness:
  action_scene: [realistic_sports_action, controlled_athlete, object_interaction]
  studio_product: [product_in_action, premium_campaign_reveal]
  on_model: [controlled_athlete, object_interaction]
  ...
jewelry:
  macro_closeup: [sparkle_detail, macro_shine]
  on_model: [worn_jewelry_pose, hand_movement_showcase]
  ...
```

Cover all 10 categories × relevant scene types. Fallback: if no matrix entry, return the full category goal list.

Update `getMotionGoalsForCategory(category, sceneType?)` to accept optional `sceneType` and filter/rank goals from the matrix.

Add `getDefaultPreservation(category, sceneType?)` to also be scene-aware (e.g. `action_scene` enables identity preservation regardless of category).

**2. New file: `src/lib/videoActionResolver.ts`**

Core new module. Exports:

```typescript
interface ResolvedAction {
  main_action: string;           // e.g. "single_dribble", "subtle_fabric_sway"
  action_verb: string;           // e.g. "dribble", "sway", "rotate", "shimmer"
  action_style: string;          // e.g. "controlled", "gentle", "micro"
  primary_moving_elements: string[]; // e.g. ["body", "ball"] or ["hands", "product"]
  resolved_subject_motion: string;   // resolved "auto" → concrete value
}

function resolveMainAction(params: {
  category: string;
  sceneType: string;
  motionGoalId: string;
  subjectMotion: string;
  interactiveObject: string | null;
  hasPerson: boolean;
  subjectType: string | null;
  userPrompt?: string;
  sceneComplexity: 'low' | 'medium' | 'high';
}): ResolvedAction
```

Logic structure:

- **Action resolution**: A lookup table maps `(category, motionGoalId, interactiveObject)` → `(main_action, action_verb, action_style)`. Examples:
  - `(sports_fitness, realistic_sports_action, "basketball")` → `("single_dribble", "dribble", "controlled")`
  - `(sports_fitness, realistic_sports_action, "tennis_ball")` → `("controlled_ball_interaction", "bounce", "controlled")`
  - `(fashion_apparel, fabric_movement, null)` → `("subtle_fabric_sway", "sway", "gentle")`
  - `(beauty_skincare, hand_held_beauty, null)` → `("controlled_hand_rotation", "rotate", "controlled")`
  - `(jewelry, sparkle_detail, null)` → `("micro_light_shift", "shimmer", "micro")`
  - `(food_beverage, steam_atmosphere, null)` → `("steam_rise", "rise", "gentle")`
  - Fallback: generic `("product_reveal", "reveal", "controlled")`

- **Primary moving elements resolution**: Based on `(hasPerson, category, subjectMotion, interactiveObject, sceneType)`:
  - hand_held + beauty → `["hands", "product"]`
  - action_scene + sports + ball → `["body", "ball"]`
  - macro_closeup + jewelry → `["jewelry_surface", "light_reflection"]`
  - on_model + fashion + hair_fabric → `["body", "hair", "fabric"]`
  - interior_room + home_decor → `["ambient_light", "atmosphere"]`

- **Auto subject motion resolution**: When `subjectMotion === "auto"`:
  - no person + studio_product → `"minimal"`
  - person + on_model + fashion → `"natural_pose_shift"`
  - person + action_scene + sports → `"action_motion"`
  - hand_held + any → `"hand_object_interaction"`
  - macro_closeup → `"minimal"`
  - person + lifestyle → `"natural_pose_shift"`
  - Fallback: `"minimal"`

**3. Normalize scene type in `src/lib/videoStrategyResolver.ts`**

Add a `normalizeSceneType()` function that maps `ecommerce_scene_type` and legacy `scene_type` to the canonical scene type ID. Apply it at the top of `resolveVideoStrategy()`.

Also update `VideoAnalysis` interface: keep `ecommerce_scene_type` but add a comment that `scene_type` (legacy) should not be used for motion logic.

**4. Update `src/hooks/useVideoProject.ts`**

After resolving strategy, call `resolveMainAction()` and attach results to the strategy object before prompt building. Pass `resolved_subject_motion`, `main_action`, `primary_moving_elements` into the prompt builder.

---

### Phase 2 — Richer Strategy, Realism/Loop Logic, User Note Handling

**5. Expand `VideoStrategy` in `src/lib/videoStrategyResolver.ts`**

Add new fields:
```typescript
main_action: string;
action_verb: string;
action_style: string;
primary_moving_elements: string[];
scene_type_normalized: string;
user_note_conflict: boolean;
```

**Realism level effects** — in `resolveVideoStrategy()`:
- `ultra_realistic`: `allow_scene_expansion = false`, cap intensity to `medium` max, set `validation_level = 'strict'`
- `slightly_stylized`: `allow_scene_expansion = true`, allow high intensity, looser validation

**Loop style effects**:
- `short_repeatable`: cap intensity to `medium`, prefer contained single action
- `seamless_loop`: cap intensity to `low`, constrain to cyclic motions, set a flag `cyclic_motion = true`
- `one_natural`: allow full intensity range, no loop constraints

**CFG scale adjustment by realism**:
- `ultra_realistic`: category CFG + 0.1
- `slightly_stylized`: category CFG - 0.05

**6. User note conflict detection**

In `resolveVideoStrategy()`, add simple conflict detection:
- If user note contains motion-contradicting keywords ("spin quickly", "fast rotation", "zoom out") while preservation is strict or realism is ultra, set `user_note_conflict = true`
- Store the flag in strategy — prompt builder can deprioritize the note

**7. Update `src/hooks/useVideoProject.ts`**

Pass `main_action`, `primary_moving_elements`, and `user_note_conflict` through to prompt builder. Log richer strategy object.

---

### Phase 3 — Category-Specific Prompt Builder

**8. Rewrite `src/lib/videoPromptTemplates.ts`**

Replace the single unified template with category-specific prompt assembly functions.

New architecture:
```typescript
// Shared primitives
function buildCameraClause(motion: string): string
function buildPreservationClause(strategy: VideoStrategy): string
function buildStabilityClause(elements: string[], strategy: VideoStrategy): string

// Category-specific assemblers
function buildSportsPrompt(input): string
function buildFashionPrompt(input): string
function buildJewelryPrompt(input): string
function buildFoodPrompt(input): string
function buildElectronicsPrompt(input): string
function buildBeautyPrompt(input): string
// ... etc, plus a generic fallback

// Main entry dispatches by family
function buildVideoPrompt(input): BuiltPrompt
```

Each category assembler emphasizes different things:
- **Sports**: body realism, grounded athletic motion, object physics, action verb injection ("one controlled [action_verb] of the [interactive_object]")
- **Jewelry**: micro-motion, reflection language, detail preservation, minimal movement
- **Fashion**: fabric motion language, silhouette preservation, identity protection
- **Food**: freshness cues, steam/condensation/pour, composition stability
- **Electronics**: hard geometry preservation, screen proportions, controlled reveal
- **Beauty**: hand control precision, gloss/finish emphasis, luxury feel

**Action-aware prompt language** — instead of `"realistic tennis_ball motion"`, generate:
- `"one controlled realistic basketball dribble while maintaining grounded athletic stance"`
- `"subtle hand-led product rotation presenting the label"`
- `"soft realistic fabric sway at the sleeve and hem while preserving garment silhouette"`
- `"micro reflective shimmer across the jewelry surface with stable metal geometry"`

**User note handling**: If `user_note_conflict` is true, append note at end with "Additional note: " prefix instead of leading. If false, merge at the beginning as before.

**Negative prompt strengthening by realism**:
- `ultra_realistic`: append extra terms: `"CGI look, artificial motion, animation feel"`
- `slightly_stylized`: remove some strict terms

**9. Evaluate structured camera control**

In `src/lib/videoStrategyResolver.ts`, for specific camera motions, prepare a `camera_control_config` object:
- `orbit` → `{ type: "simple", config: { horizontal: 10, zoom: 0 } }`
- `slow_push_in` → `{ type: "simple", config: { zoom: 3 } }`
- Others: remain prompt-only for now

Add to strategy: `camera_control_config?: { type: string; config: Record<string, number> }`.

In `useVideoProject.ts`, if `strategy.camera_control_config` exists, pass it to `generateVideo.startGeneration()` as `cameraControl`. This enables structured Kling camera control for orbit and push-in while keeping prompt text for the rest.

---

### UI Change (minimal)

**10. Update `MotionGoalSelector.tsx` and `AnimateVideo.tsx`**

Pass `sceneType` to `MotionGoalSelector` → pass to `getMotionGoalsForCategory(category, sceneType)`. This is the only UI change needed — goals will now dynamically filter by scene type.

---

## Files to Create
- `src/lib/videoActionResolver.ts` — action resolver + primary elements + auto resolution

## Files to Modify
- `src/lib/videoMotionRecipes.ts` — add scene-aware matrix, update `getMotionGoalsForCategory` signature
- `src/lib/videoStrategyResolver.ts` — normalize scene type, realism/loop logic, expanded strategy, camera control config, user note conflict
- `src/lib/videoPromptTemplates.ts` — category-specific prompt assemblers, action-aware language
- `src/hooks/useVideoProject.ts` — integrate action resolver, pass richer data through pipeline
- `src/components/app/video/MotionGoalSelector.tsx` — accept `sceneType` prop
- `src/pages/video/AnimateVideo.tsx` — pass `sceneType` to MotionGoalSelector

## No Database Migration Needed
All new fields stored in existing JSONB columns.

