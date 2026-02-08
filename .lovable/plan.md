

## Workflow-Specific Generation Engine

### The Problem

Right now every workflow (Website Hero Set, Flat Lay Set, Seasonal Campaign Set, etc.) runs through the **exact same generation pipeline** with the same steps, same prompt engineering, and same output. The only differentiation is a `uses_tryon` boolean and some default ratios. A "Flat Lay Set" produces the same kind of images as a "Product Listing Set" because nothing workflow-specific reaches the AI.

### The Solution

Give each workflow its own **generation config** — a structured JSON object stored in the database that controls:
- Which UI steps to show (and which to skip)
- Workflow-specific prompt engineering instructions
- Fixed settings (aspect ratios, image counts, compositions)
- Variation strategies (how each image in a set differs from the others)

This means each workflow becomes a truly unique experience without needing 10 separate pages.

### Architecture Overview

```text
+------------------+     +---------------------+     +---------------------+
|   workflows      |     |  NEW: workflow       |     |  generate-workflow  |
|   table (DB)     |---->|  generation_config   |---->|  edge function      |
|                  |     |  (JSONB column)      |     |  (NEW)              |
+------------------+     +---------------------+     +---------------------+
                                                              |
                                                     Uses workflow-specific
                                                     prompt templates,
                                                     variation strategies,
                                                     and composition rules
```

### What Changes

**1. Database: Add `generation_config` JSONB column to `workflows` table**

A new column that stores workflow-specific generation settings as structured JSON. Each workflow gets its own config tailored to its unique outcome.

Example configs for key workflows:

| Workflow | Key Config Highlights |
|---|---|
| Website Hero Set | Forces 16:9 ratio, adds negative space instructions, generates 3 layouts (text-left, text-right, centered) |
| Flat Lay Set | Forces 1:1 ratio, overhead camera angle, arranges product with styled props |
| Seasonal Campaign Set | Generates 4 variations (spring/summer/autumn/winter), each with season-specific scenery |
| Before & After Set | Generates paired images: "before" (plain/clinical) and "after" (glowing/premium) |
| Social Media Pack | Generates images across 3 ratios (1:1, 4:5, 16:9) in one batch |
| Selfie / UGC Set | Adds phone-camera perspective, casual lighting, authentic feel |
| Product Listing Set | Clean white/light backgrounds, e-commerce framing, multiple angles |
| Lifestyle Set | Contextual real-world environments, lifestyle scenarios |
| Ad Refresh Set | High-energy compositions, bold backgrounds, ad-optimized framing |
| Virtual Try-On Set | Uses try-on pipeline with model/pose selection (existing flow) |

The JSON structure for each config:

```text
{
  "prompt_template": "...",       // Workflow-specific prompt blueprint
  "system_instructions": "...",   // AI system-level instructions
  "fixed_settings": {
    "aspect_ratios": ["16:9"],    // Lock or suggest ratios
    "quality": "high",            // Force quality level
    "composition_rules": "..."    // Framing/composition guidance
  },
  "variation_strategy": {
    "type": "seasonal" | "multi-ratio" | "angle" | "paired" | "layout",
    "variations": [...]           // Per-image variation instructions
  },
  "ui_config": {
    "skip_template": true,        // Skip template selection step
    "skip_mode": true,            // Skip mode selection step
    "show_scene_picker": false,   // Custom UI toggles
    "custom_settings": [...]      // Workflow-specific settings to show
  },
  "negative_prompt_additions": "..."  // Extra negatives for this workflow
}
```

**2. New Edge Function: `generate-workflow`**

A single, smart edge function that replaces the generic `generate-product` call when a workflow is active. It:

- Receives the `workflow_id` along with the generation request
- Fetches the workflow's `generation_config` from the database
- Builds a **workflow-specific prompt** using the config's `prompt_template` and `variation_strategy`
- Applies per-image variation instructions (e.g., "Image 1: Spring setting with cherry blossoms, Image 2: Summer setting with golden sunlight...")
- Applies composition rules and negative prompts specific to the workflow
- Returns generated images tagged with their variation metadata

**3. Frontend: Update `Generate.tsx` to be workflow-config-aware**

The Generate page will read the workflow's `generation_config` and dynamically:

- **Skip steps** that the workflow doesn't need (e.g., Flat Lay doesn't need template selection — it IS the template)
- **Lock settings** the workflow controls (e.g., Website Hero locks aspect ratio to 16:9)
- **Show workflow-specific UI** (e.g., Seasonal Campaign shows a season picker; Before and After shows before/after toggle)
- **Display variation previews** so users see what each image in the set will be (e.g., "Image 1: Spring, Image 2: Summer...")

**4. Frontend: New hook `useGenerateWorkflow`**

A new React hook that calls the `generate-workflow` edge function, passing the workflow config along with the user's selections. This replaces `useGenerateProduct` when a workflow is active.

### Step-by-Step Changes

| # | File | Action | Description |
|---|---|---|---|
| 1 | Database migration | **New** | Add `generation_config JSONB` column to `workflows` table |
| 2 | Database migration | **New** | Populate `generation_config` for all 10 existing workflows with tailored configs |
| 3 | `supabase/functions/generate-workflow/index.ts` | **New** | Smart edge function that builds workflow-specific prompts and handles variation strategies |
| 4 | `src/hooks/useGenerateWorkflow.ts` | **New** | React hook to call the new edge function |
| 5 | `src/pages/Workflows.tsx` | **Edit** | Update Workflow type to include `generation_config` |
| 6 | `src/pages/Generate.tsx` | **Edit** | Read `generation_config` from active workflow; conditionally skip steps, lock settings, show variation previews |

### Example: How "Seasonal Campaign Set" Would Work

**Before (current)**: User picks Seasonal Campaign → same generic flow → picks a template → gets 4 identical-looking product shots.

**After (with this change)**:
1. User picks Seasonal Campaign from Workflows hub
2. Generate page loads, sees `generation_config.ui_config.skip_template: true` — skips template step entirely
3. Shows a **season preview panel** listing: "Spring, Summer, Autumn, Winter"
4. User clicks Generate
5. `generate-workflow` edge function builds 4 distinct prompts:
   - Image 1: "Product surrounded by cherry blossoms, soft pink ambient light, spring garden..."
   - Image 2: "Product in bright golden sunlight, beach sand texture, summer vibes..."
   - Image 3: "Product on fallen maple leaves, warm amber tones, autumn forest..."
   - Image 4: "Product on frosted surface, cool blue tones, winter snowflakes..."
6. Results show 4 clearly different seasonal images

### Example: How "Website Hero Set" Would Work

1. User picks Website Hero Set
2. Aspect ratio auto-locked to 16:9, template step skipped
3. Shows layout options: "Text Left", "Text Right", "Centered"
4. `generate-workflow` builds prompts with explicit negative space and text placement zones
5. Results: 3 wide-format hero banners, each with different product/text arrangements

### What This Does NOT Change

- The Freestyle Studio remains completely independent (its own edge function, its own page)
- Virtual Try-On flow remains as-is (model/pose selection) — the try-on workflows will simply pass through to the existing `generate-tryon` function
- Brand Profile integration remains the same
- Credit calculation stays the same

### Migration Safety

The `generation_config` column will be nullable with a default of `NULL`. Workflows without a config will continue to use the current generic flow, so there is zero risk of breaking existing behavior. The new path only activates when `generation_config` is present and non-null.

