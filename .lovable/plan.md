

## Analysis: Workflow Attribution in Discover Presets

### Current State

The `discover_presets` table has **no workflow-related columns**. The columns are: `title`, `prompt`, `image_url`, `category`, `model_name`, `scene_name`, `aspect_ratio`, `quality`, `tags`, `sort_order`, `is_featured`. There's no `workflow_id`, `workflow_name`, or `workflow_slug` stored, so currently there's **no way to know** if a Discover image was created via a workflow or freestyle.

### Plan: Add workflow attribution to discover presets

**1. Database migration** — Add two nullable columns to `discover_presets`:
- `workflow_slug text` — stores the workflow slug (e.g. `product-listing`, `lookbook`)
- `workflow_name text` — stores the display name for the label

These are nullable so existing presets are unaffected. When admins add new presets (or via the `describe-discover-metadata` edge function), they can tag which workflow was used.

**2. `src/hooks/useDiscoverPresets.ts`** — Add `workflow_slug` and `workflow_name` to the `DiscoverPreset` interface.

**3. `src/components/app/DiscoverDetailModal.tsx`** — When the preset has a `workflow_slug`:
- Show a small badge/chip below the category label: e.g. "Created with **Product Listing** workflow"
- Add a secondary CTA button: **"Try This Workflow →"** that navigates to `/app/workflows` (or directly to the workflow generate page if we can link by slug)
- This sits alongside the existing "Use Prompt" button, giving users two paths

**4. `src/components/app/DiscoverCard.tsx`** — Optionally show a small "Workflow" badge overlay on cards that have `workflow_slug` set, to visually distinguish them in the grid.

### UI in the Detail Modal (right panel)

```text
COMMERCIAL · Product Listing Workflow
Golden Glow Elixir
5 views

[Generate Prompt from Image]

PROMPT
...

[Use Prompt  →]          ← existing
[Try This Workflow →]    ← new, outline style, links to workflow

[Copy] [Save] [Similar]
```

### What this enables
- Admins populate `workflow_slug` / `workflow_name` when adding presets
- Users browsing Discover see which images came from workflows and can try them directly
- Drives workflow adoption alongside freestyle

