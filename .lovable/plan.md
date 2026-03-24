

# Freestyle Empty State: Quick-Start Preset Chips

## Problem
When a user has no freestyle generations and lands on the empty state, they see a generic "Freestyle Studio" message with no guidance on what to actually do. They don't know what combinations work or how to start.

## Solution
Replace the empty state (lines 934-946) with a **Quick-Start Presets** section — a horizontally scrollable row of preset chips (both desktop and mobile) that, when tapped, auto-fill the prompt, model, and scene. After applying a preset, show a **hint banner** above the prompt panel telling the user to just add their product.

## Preset Chips Design

Each chip is a small card with:
- A scene thumbnail image (rounded, ~48×48)
- A short label like "Lifestyle Scene", "Editorial Studio", "Beach Vibes"
- Muted subtitle like "Freya · Urban Walking"

~5-6 presets using existing models and scenes from `mockData.ts`:

| Label | Scene | Model | Prompt |
|-------|-------|-------|--------|
| Lifestyle Scene | Urban Walking (pose_003) | Freya | "Lifestyle street style photoshoot, golden hour, natural movement" |
| Studio Clean | Studio Front (pose_001) | Zara | "Clean studio product photography, white backdrop, professional lighting" |
| Editorial Moody | Editorial Moody (pose_019) | Sienna | "Moody editorial fashion shoot, dramatic lighting, dark atmosphere" |
| Beach Vibes | Beach Sunset (pose_015) | Olivia | "Beach sunset lifestyle photoshoot, warm coastal light, relaxed vibe" |
| Café Morning | Coffee Shop Casual (pose_014) | Hannah | "Morning café lifestyle shoot, natural window light, cozy atmosphere" |

## Hint Banner
After a preset is applied, a banner appears above the prompt bar:
```
✓ Your scene is ready — Add your product to generate visuals →
```
With a CTA that opens the product picker. Dismisses on click or after adding a product.

## Changes

### 1. New component: `src/components/app/freestyle/FreestyleQuickPresets.tsx`
- Define `QUICK_PRESETS` array with label, scene poseId, model modelId, prompt text, thumbnail (scene's previewUrl)
- Render a horizontal scroll row of preset chips
- `onSelect(preset)` callback that returns the preset data
- Chips: rounded-xl cards with scene image thumbnail + label + model name subtitle
- Horizontal scroll with `overflow-x-auto snap-x` on mobile, centered flex-wrap on desktop

### 2. Update `src/pages/Freestyle.tsx`
- Import `FreestyleQuickPresets`
- Replace the desktop empty state (lines 934-946) with the presets component (show on both mobile and desktop when no generations)
- On preset select: set `prompt`, `selectedModel` (find from mockModels), `selectedScene` (find from mockTryOnPoses), and show a hint state
- Add `presetHint` state — when true, render a banner above the prompt panel saying "Your scene is ready → Add your product to generate visuals"
- Clear hint when product is selected or user dismisses it

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — new component
- `src/pages/Freestyle.tsx` — integrate presets into empty state, add hint banner logic

