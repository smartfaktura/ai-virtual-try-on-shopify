

# Add "Campaign Mode" Selector to Creative Drops Workflow Step

## What the User Wants
When selecting a workflow like Virtual Try-On or Mirror Selfie, the user wants a clear choice between:
1. **Curated** — manually pick specific models, scenes, settings
2. **Mix** — system auto-randomizes models and scenes for maximum diversity based on the selected products

Currently, the "Random / Diverse" toggles exist separately for scenes and models buried in the config panel. The user wants a top-level, prominent choice before diving into details.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Add Campaign Mode selector (after workflow is selected, before config panel)**

When a workflow is selected and it has scenes/models, show a two-card selector:

```text
┌─────────────────────┐  ┌─────────────────────┐
│  🎨 Curated         │  │  🔀 Mix             │
│  Pick models &      │  │  Auto-diverse mix   │
│  scenes manually    │  │  of all models &    │
│                     │  │  scenes             │
└─────────────────────┘  └─────────────────────┘
```

- **Curated**: Shows the full config panel (scenes grid, models grid) — current behavior
- **Mix**: Auto-sets `isRandomModelsFlag = true` and `isRandomScenesFlag = true`, collapses the manual selection panels, shows a simple summary card: "System will automatically select diverse models and scenes for each image"

**B. State: Add `campaignMode: 'curated' | 'mix'`** (default: `'curated'`)

When user switches to "Mix":
- Set `isRandomModelsFlag = true`, `isRandomScenesFlag = true`
- Hide scene/model grids (they're irrelevant in mix mode)
- Show a compact summary instead

When user switches to "Curated":
- Set `isRandomModelsFlag = false`, `isRandomScenesFlag = false`
- Show full scene/model grids as current

**C. Simplify the config panel in Mix mode**
When `campaignMode === 'mix'`, only show:
- Images per Product count
- Aspect Ratios
- Workflow-specific settings (UGC Mood, Flat Lay Aesthetic)
- Credit Summary
- A summary card: "Auto Mix: System picks diverse models & scenes for each product"

Hide: Scene grid, Model grid, Pose picker (since they're all randomized)

**D. For workflows without models (Product Listing Set)**
Don't show the campaign mode selector — go straight to config since there's nothing to "mix".

## What's NOT Changing
- Backend/save logic — `isRandomModelsFlag` and `isRandomScenesFlag` already exist and are saved
- Credit calculation — unchanged
- Workflow selection cards — unchanged
- Steps 0, 1, 3 — unchanged

## Summary
- 1 file modified, ~40 lines added
- Prominent "Curated vs Mix" choice replaces buried Random toggles
- Mix mode auto-enables all randomization and hides manual selection UI

