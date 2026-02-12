

## Upgrade Product Listing Set Wizard with Visual Scene Previews

The current wizard shows the 8 scene variations as plain text cards (label + instruction text). We'll transform this into a visually rich experience with AI-generated background preview thumbnails for each scene.

### Overview

1. Create a new edge function that generates preview images for each scene variation (background-only, no product)
2. Store preview URLs in the workflow's `generation_config` alongside each variation
3. Redesign the "What You'll Get" section with visual scene cards
4. Improve overall wizard flow polish for Product Listing Set

---

### 1. New Edge Function: `generate-scene-previews`

Creates AI-generated background/scene thumbnails for each variation in a workflow's `generation_config`. Each image shows the environment without a product (e.g., clean white studio, marble surface, dark moody backdrop).

- Accepts `workflow_id`
- Reads the `variation_strategy.variations` from DB
- For each variation, generates a small scene preview image using Gemini Flash
- Uploads each to `workflow-previews/{workflow_id}/scene-{index}.png`
- Updates the `generation_config` JSONB to add a `preview_url` field to each variation
- Returns the updated variation list with URLs

**Scene preview prompts** will describe the background/environment only (no product), e.g.:
- "Hero White": "Clean white photography studio background, soft diffused lighting, minimal shadows, professional e-commerce backdrop"
- "Marble Surface": "Elegant white marble surface with subtle veining, soft directional light, premium product photography backdrop"
- etc.

### 2. Update Variation Type

Add an optional `preview_url?: string` field to the `WorkflowVariationItem` type in `src/types/workflow.ts`.

### 3. Redesign the Settings Step UI (lines 1290-1335 of Generate.tsx)

Transform the current 2-column text grid into a visually rich scene selector:

- **Visual cards**: Each variation shows a square background preview image with the label overlaid at the bottom
- **Grid layout**: `grid-cols-2 sm:grid-cols-4` for a compact 4-column grid on desktop (8 scenes fit in 2 rows)
- **Selection state**: Selected cards have a primary border + checkmark badge in corner; unselected are slightly dimmed
- **Hover effect**: Slight scale-up on hover with the instruction text appearing as a tooltip
- **Fallback**: If no `preview_url` exists, show a gradient placeholder with an icon representing the scene type
- **"Select All / Deselect All"** toggle for convenience

### 4. Add a "Generate Previews" Admin Action

A small utility button (only visible if previews are missing) that triggers the edge function to generate all 8 scene previews. This runs once and the URLs persist in the DB.

### 5. Overall Wizard Polish for Product Listing Set

- Add a workflow-specific header illustration showing the 8-scene concept
- Show "No People" badge prominently in the workflow info banner
- Change the variation description text to be more user-friendly (shorter, benefit-oriented)
- Add aspect ratio badge on each visual card (1:1 or 4:5)

---

### Files Changed

- **New**: `supabase/functions/generate-scene-previews/index.ts` -- edge function to generate and store scene background previews
- **Edit**: `src/types/workflow.ts` -- add `preview_url` to `WorkflowVariationItem`
- **Edit**: `src/pages/Generate.tsx` -- redesign the workflow settings step with visual scene cards
- **No DB migration needed** -- preview URLs are stored inside the existing `generation_config` JSONB

### Technical Flow

```text
Admin triggers "Generate Previews"
  --> Edge function reads 8 variations from DB
  --> For each: generates background-only image via Gemini Flash
  --> Uploads to workflow-previews/{id}/scene-{i}.png
  --> Updates generation_config.variation_strategy.variations[i].preview_url
  --> UI re-fetches workflow data and displays visual cards
```

