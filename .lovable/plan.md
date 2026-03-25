

# Animate Image Redesign — Category-Aware Ecommerce Motion Engine

## What Changes

The current generic style+camera UI is replaced with a category-aware system: Upload → AI detects product category and scene type → system recommends motion goals → user picks one → backend builds a rich action-aware prompt. Minimal prompting, maximum commercial quality.

---

## Technical Plan

### Phase 1 — Core Data Layer (no DB migration needed)

**1. New data definitions file: `src/lib/videoMotionRecipes.ts`**

Central registry of all categories, scene types, and motion goals. Contains:
- 10 product categories with metadata (Fashion & Apparel, Beauty & Skincare, Fragrances, Jewelry, Accessories, Home & Decor, Food & Beverage, Electronics, Sports & Fitness, Health & Supplements)
- 11 scene types (studio_product, on_model, lifestyle_scene, hand_held, flat_lay, macro_closeup, interior_room, action_scene, food_plated, device_on_desk, talking_portrait)
- Per-category motion goal arrays (3-5 goals each with id, title, description, recommended badge logic)
- Per-category default preservation rules and motion behaviors
- Camera motion options (static, slow_push_in, gentle_pan, camera_drift, premium_handheld, orbit)
- Subject motion options (minimal, natural_pose_shift, action_motion, hand_object_interaction, hair_fabric, auto)
- Realism levels, loop styles
- A function `getMotionGoalsForCategory(category, sceneType)` that returns the relevant goals
- A function `getDefaultPreservation(category, sceneType)` that returns default toggle states

This file is pure data, ~300 lines. All the category-specific recipes from the user's spec live here.

---

### Phase 2 — Extended AI Analysis

**2. Update `supabase/functions/analyze-video-input/index.ts`**

Extend the tool-calling schema to return ecommerce-aware fields:
- `category`: one of the 10 product categories (snake_case)
- `scene_type`: one of the 11 scene types
- `subject_type`: descriptive string (e.g. "athlete_with_object", "skincare_bottle")
- `has_person`: boolean
- `interactive_object`: string or null (e.g. "basketball", "wine_glass")
- `recommended_motion_goals`: string[] (up to 3 goal IDs from the registry)
- `recommended_camera_motion`: string
- `recommended_subject_motion`: string
- `recommended_realism`: string
- `recommended_loop_style`: string
- `risk_flags`: existing flags plus `identity_sensitive`, `product_detail_sensitive`, `background_should_stay_static`

Keep backward compatibility — old fields still returned. The system prompt gets updated to understand ecommerce product categories.

**3. Update `VideoAnalysis` type in `src/lib/videoStrategyResolver.ts`**

Add the new fields as optional properties so old analysis results don't break.

---

### Phase 3 — New UI Components

**4. `src/components/app/video/ProductContextSelector.tsx`**

Two chip rows:
- Category chips (auto-detected, user-editable) — 10 options
- Scene Type chips (auto-detected, user-editable) — 11 options
- Shows "Auto-detected" badge on AI-suggested values
- Compact: uses horizontal scroll on mobile

**5. `src/components/app/video/MotionGoalSelector.tsx`**

Displays 3-5 motion goal cards based on selected category + scene type. Each card shows:
- Title (e.g. "Realistic Sports Action")
- One-line description
- "Recommended" badge on the AI's top pick
- Selected state

Dynamically reads from the recipe registry. When category changes, goals update.

**6. `src/components/app/video/MotionRefinementPanel.tsx`**

Collapsible section (default collapsed) with:
- Camera Motion chips (6 options)
- Subject Motion chips (6 options)
- Realism Level chips (3 options)
- Loop Style chips (4 options)
- Motion Intensity chips (existing: low/medium/high)

**7. `src/components/app/video/PreservationRulesPanel.tsx`**

4 toggle switches:
- Preserve scene composition
- Preserve product details
- Preserve subject identity
- Preserve outfit / styling

Defaults auto-set based on category+scene type from the recipe registry.

**8. Rename existing text field**

The "Additional Direction" textarea becomes "Specific Motion Note (optional)" with placeholder: "Example: one realistic basketball dribble, controlled body movement, background stays static"

---

### Phase 4 — Pipeline Rewiring

**9. Rewrite `src/hooks/useVideoProject.ts`**

New `AnimateParams` interface:
```typescript
interface AnimateParams {
  imageUrl: string;
  // Product Context
  category: string;
  sceneType: string;
  // Motion Goal
  motionGoalId: string;
  // Refinements
  cameraMotion: string;
  subjectMotion: string;
  realismLevel: string;
  loopStyle: string;
  motionIntensity: 'low' | 'medium' | 'high';
  // Preservation
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  // Settings
  aspectRatio: '1:1' | '16:9' | '9:16';
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient';
  // Optional
  userPrompt?: string;
}
```

Pipeline flow:
1. Create project (store all new fields in `settings_json`)
2. Insert input
3. Run analysis → return enriched analysis with category, goals
4. Resolve strategy (now category-aware)
5. Build prompt (now action-aware)
6. Create shot record
7. Submit to Kling

New: After analysis, expose `analysisResult` so the UI can pre-fill the form. The pipeline becomes **two-phase**:
- Phase A: `analyzeImage(imageUrl)` — runs analysis, returns suggestions
- Phase B: `generateFromAnalysis(params)` — user has confirmed settings, runs strategy → prompt → Kling

This split lets the user see AI suggestions before generating.

**10. Rewrite `src/lib/videoStrategyResolver.ts`**

New `ResolverInput` adds: `category`, `sceneType`, `motionGoalId`, `cameraMotion`, `subjectMotion`, `realismLevel`, `loopStyle`, `preserveProductDetails`, `preserveIdentity`, `preserveOutfit`.

Strategy logic becomes category-driven:
- Maps category + motionGoalId to `workflow_strategy` (e.g. `fashion_apparel_subtle_pose`)
- Maps category to `prompt_template_family` (e.g. `fashion_apparel_motion`)
- Sets preservation flags from user toggles
- Sets motion intensity and model route based on category defaults

**11. Rewrite `src/lib/videoPromptTemplates.ts`**

Replace the 7 generic template families with 10 category-specific families plus a fallback:
- `fashion_apparel_motion`
- `beauty_skincare_reveal`
- `fragrance_premium_reveal`
- `jewelry_macro_motion`
- `accessories_showcase`
- `home_decor_ambient`
- `food_beverage_motion`
- `electronics_clean_reveal`
- `sports_fitness_action`
- `health_supplements_reveal`

Each template builds prompts from ALL dimensions:
```
[User note]. Create a [realism] [loop_style] [category] video.
[Motion goal description]: [subject motion phrase].
Primary moving elements: [from analysis].
Camera: [camera motion].
Preserve: [identity/outfit/product/background per toggles].
[Category-specific negative prompt]
```

The `BuiltPrompt` gains a new field: `result_label` (e.g. "Realistic basketball dribble with slow push-in") for better result naming.

---

### Phase 5 — Redesigned AnimateVideo Page

**12. Rewrite `src/pages/video/AnimateVideo.tsx`**

New page flow:

```
Upload → [AI analyzes, shows spinner] → Form appears pre-filled:
  Section: Product Context (category + scene type, auto-detected)
  Section: Recommended Motion Goals (3-5 cards, top one pre-selected)
  Section: Motion Refinement (collapsed, camera/subject/realism/loop)
  Section: Preservation Rules (4 toggles, category-defaults)
  Section: Settings (aspect ratio, duration, audio)
  Section: Specific Motion Note (optional textarea)
  [Generate button + credit estimate]
```

Key behaviors:
- After upload, show "Analyzing your image..." state
- When analysis returns, auto-fill category, scene type, motion goals, refinements, preservation toggles
- When user changes category, motion goals update dynamically
- Motion refinement section starts collapsed to keep UI clean
- Generate button triggers Phase B of the pipeline

---

### Phase 6 — Remove Deprecated Components

**13. Deprecate `StylePresetSelector.tsx`** — replaced by ProductContextSelector + MotionGoalSelector
**14. Keep `MotionPresetSelector.tsx`** as the Camera Motion part inside MotionRefinementPanel (rename label)

---

## Files to Create
- `src/lib/videoMotionRecipes.ts` — category/goal data registry
- `src/components/app/video/ProductContextSelector.tsx`
- `src/components/app/video/MotionGoalSelector.tsx`
- `src/components/app/video/MotionRefinementPanel.tsx`
- `src/components/app/video/PreservationRulesPanel.tsx`

## Files to Modify
- `supabase/functions/analyze-video-input/index.ts` — extended schema
- `src/lib/videoStrategyResolver.ts` — category-aware strategy
- `src/lib/videoPromptTemplates.ts` — 10 category template families
- `src/hooks/useVideoProject.ts` — two-phase pipeline, new params
- `src/pages/video/AnimateVideo.tsx` — full UI redesign

## No Database Migration Needed
All new fields stored in existing JSONB columns (`settings_json`, `strategy_json`, `analysis_json`).

