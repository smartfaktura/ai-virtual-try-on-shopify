

# Auto-Analyze + Auto-Draft + Better Analysis + Tab Counts

## Problem
1. "Analyze Post" shows analysis results but requires a second "Create Draft Scene" click — should do both in one step
2. The AI analyzer prompt is too generic for image generation — needs much more detail (depth of field, texture, reflections, color grading, etc.)
3. Draft Scenes tab has no count badge showing how many drafts exist

## Changes

### 1. Auto-create draft scene after analysis — `PostDetailDrawer.tsx`
- When "Analyze Post" is clicked, after analysis completes, automatically call `onCreateScene(analysis, post)` 
- Remove the separate "Create Draft Scene" button (or keep it for re-creating from existing analysis)
- Change button label to "Analyze & Create Draft"
- The drawer closes and switches to Draft Scenes tab automatically (already handled by `handleCreateScene`)

### 2. Enhance the analyzer prompt — `analyze-trend-post/index.ts`
Add more fields to the analysis schema critical for image generation:
- `depth_of_field` (shallow/medium/deep)
- `color_grading` (warm tones, cool desaturated, etc.)
- `texture_detail` (glossy, matte, rough, etc.)
- `reflections` (none, subtle, prominent)
- `contrast_level` (low/medium/high)
- `saturation_level` (desaturated/natural/vibrant)
- `key_visual_elements` (array — specific notable elements)
- `negative_space` (minimal/moderate/generous)
- `product_placement` (centered, rule-of-thirds, etc.)
- `background_detail` (textured fabric, bokeh, gradient, solid, etc.)

Also improve the system prompt to be more specific about extracting image-generation-relevant signals: exact lighting setup, surface interactions, color grading nuances, depth of field behavior.

### 3. Add migration for new analysis columns — SQL migration
Add the new columns to `reference_analyses` table to persist the enhanced data.

### 4. Show draft count on tab — `AdminTrendWatch.tsx`
- Use `useSceneRecipes` data (already loaded) to count drafts: `recipes.filter(r => r.status === 'draft').length`
- Display as badge: `Draft Scenes (3)`
- Same for Ready: `Ready Scenes (5)`

### 5. Wire auto-create in `useReferenceAnalysis.ts`
- Return the analysis data from `onSuccess` so the caller can chain the draft creation

## Files to modify
- `supabase/functions/analyze-trend-post/index.ts` — enhanced schema + better prompt
- `src/components/app/trend-watch/PostDetailDrawer.tsx` — auto-create draft after analyze
- `src/pages/AdminTrendWatch.tsx` — tab count badges, pass auto-create handler
- `src/hooks/useReferenceAnalysis.ts` — return analysis from mutation
- **Migration** — new columns on `reference_analyses`

