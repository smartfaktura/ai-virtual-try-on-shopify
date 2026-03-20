

# Fix: Creative Drops Step 2 — Reorder Sections, Add Framing, Enlarge Models

## Problems
1. **Wrong order**: Currently shows Workflow → Campaign Mode → Images → Aspect Ratios → Scenes → Models. Should be: Workflow → Campaign Mode → Models → Scenes → Aspect Ratios → Framing → Summary.
2. **No framing selector**: Workflows page has multi-framing support but Creative Drops lacks it entirely.
3. **Model circles too small**: `w-12 h-12` (48px) circles are hard to see and select — should be larger cards like scenes.
4. **"Images per Product" in Curated mode** is auto-calculated but shown before scenes/models — confusing since it depends on selections below it.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Reorder Step 2 sections** (lines 940-1476)

New order within the config panel:
1. Campaign Mode (Curated / Mix) — stays at top
2. **Models** (moved up — pick who wears it first)
3. **Scenes** (moved after models)
4. Pose / Scene Library
5. Custom Settings (UGC Mood, Flat Lay Aesthetic)
6. **Aspect Ratios** (moved down)
7. **Framing** (new — multi-select, same as Workflows page)
8. Freestyle Prompts
9. **Credit Summary** (moved to bottom, now includes framing in the matrix)

**B. Add Framing multi-selector** (new section)

Add state: `selectedFramings: Set<string>` (default: `new Set(['auto'])`)

Import and render `FramingMultiSelector` from `@/components/app/FramingSelector`. Only show for workflows that use models (`needsModels`). Hidden in Mix mode (framing = auto).

**C. Update `computedImageCount`** to include framing count:
```
framingCount = selectedFramings.has('auto') ? 1 : selectedFramings.size
total = scenes × models × formats × framingCount
```

**D. Enlarge model cards** (line 1279-1304)

Change model grid from tiny circles to proper cards matching scene card style:
- Grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` (same as scenes)
- Each card: square image with rounded corners, name below, selection border — same pattern as scene cards
- Replace `w-12 h-12 rounded-full` with `aspect-square w-full rounded-xl`

**E. Update Credit Summary** to show framing in the formula breakdown.

**F. Include `selectedFramings` in save logic** — store in `sceneConfig` alongside other settings.

## Summary
- 1 file changed
- Sections reordered: Models → Scenes → Ratios → Framing → Summary
- Framing multi-selector added (reusing existing component)
- Model cards enlarged from 48px circles to full scene-card-style grid
- Credit formula updated to include framing multiplier

