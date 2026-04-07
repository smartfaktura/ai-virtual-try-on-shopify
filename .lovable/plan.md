

# Fix Analysis + Redesign Trend Watch with Tabs

## Bug: "Failed to analyze post"

Both `analyze-trend-post` and `generate-scene-prompts` edge functions import CORS headers from a path that does not exist in the Deno runtime:

```typescript
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
```

This crashes the function on any non-OPTIONS request. Fix: replace with inline `corsHeaders` constant (matching every other working edge function in the project).

## Redesigned Flow (2-step with review)

### Step 1 — Analyze Post
Click "Analyze Post" in the drawer. The edge function analyzes the image and saves a `reference_analyses` row. The drawer immediately shows the analysis results and a "Create Draft Scene" button. Clicking it auto-creates a `scene_recipes` row (status: `draft`) pre-filled from the analysis.

### Step 2 — Generate Prompt (from Draft Scenes tab)
In the Draft Scenes tab, each card shows a "Generate Prompt" button. This calls `generate-scene-prompts`, which creates `prompt_outputs` and sets the recipe status to `prompt_ready` (moves it to Ready Scenes).

## New Tab Layout on AdminTrendWatch

Three tabs at top: **Accounts Feed** | **Draft Scenes** | **Ready Scenes**

### Accounts Feed tab
Current view — accounts with post grids, unchanged.

### Draft Scenes tab
Cards for `scene_recipes` with `status = 'draft'`. Each card shows:
- Source post thumbnail (from `preview_image_url`)
- Analysis chips: mood, lighting, scene_type, aesthetic_family
- Status badge
- Actions: "Generate Prompt", "Edit", "Delete"

### Ready Scenes tab
Cards for `scene_recipes` with `status = 'prompt_ready'` or `'published'`. Each card shows:
- Source thumbnail
- Analysis summary chips
- Master prompt preview (expandable)
- Actions:
  - **Copy Prompt** — copies master_scene_prompt to clipboard
  - **Add to Product Images** — inserts into `product_image_scenes` table
  - **Add to Freestyle Scenes** — inserts into `custom_scenes` table
  - Status badge (prompt_ready / published)

## Files to change

1. **`supabase/functions/analyze-trend-post/index.ts`** — replace broken CORS import with inline constant
2. **`supabase/functions/generate-scene-prompts/index.ts`** — same CORS fix
3. **`src/pages/AdminTrendWatch.tsx`** — add Tabs component with 3 tabs; move current account grid into first tab; add DraftScenesPanel and ReadyScenesPanel components
4. **`src/components/app/trend-watch/DraftScenesPanel.tsx`** — new component; queries `scene_recipes` where status=draft, shows cards with analysis summary + Generate Prompt button
5. **`src/components/app/trend-watch/ReadyScenesPanel.tsx`** — new component; queries `scene_recipes` where status in (prompt_ready, published) joined with `prompt_outputs`; shows cards with prompt preview + publish actions (copy prompt, add to product_image_scenes, add to custom_scenes)
6. **`src/hooks/useSceneRecipes.ts`** — add `publishToProductImages` and `publishToFreestyle` mutations that insert into the respective tables using data from the recipe + prompt_outputs
7. **`src/components/app/trend-watch/PostDetailDrawer.tsx`** — after analysis shows, add "Create Draft Scene" button that auto-fills recipe from analysis (existing `onCreateScene` handler); remove the separate "Create Scene Recipe" button from the analysis section since it's redundant

