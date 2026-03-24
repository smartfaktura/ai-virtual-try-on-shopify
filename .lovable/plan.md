

# Branded Quick-Start Presets with Team Avatar

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx` — Replace presets, add team avatar

**Remove**: Lifestyle Scene (`preset_lifestyle`), Beach Vibes (`preset_beach`)

**Keep**: Studio Clean, Editorial Moody, Café Morning

**Add 8 new presets** with creative branded names mapped to closest existing scenes:

| Label | Scene (poseId) | Model | Prompt |
|-------|---------------|-------|--------|
| Canon G7X Dining | pose_014 (Coffee Shop Casual) | Hannah | "Canon G7X style dining scene, warm natural light, intimate atmosphere" |
| Skatepark Golden Hour | pose_022 (Basketball Court) | Freya | "Skatepark golden hour photoshoot, warm sunset light, urban energy" |
| Industrial Light Play | pose_023 (Industrial Underpass) | Sienna | "Industrial location, dramatic directional light, raw concrete textures" |
| Earthy Woodland Product | pose_029 (Autumn Park) | Olivia | "Earthy woodland setting, warm natural tones, organic textures, soft light" |
| Amber Glow Studio | pose_001 (Studio Front) | Zara | "Amber warm studio glow, golden-toned studio lighting, rich atmosphere" |
| Pilates Studio Glow | pose_025 (Gym & Fitness) | Luna (model_040) | "Bright pilates studio, soft diffused light, clean minimal fitness space" |
| Elevator Chic | pose_005 (Editorial Dramatic) | Sienna | "Luxury elevator editorial, reflective surfaces, dramatic overhead light" |
| Natural Light Loft | pose_030 (Warehouse Loft) | Zara | "Spacious loft with floor-to-ceiling windows, natural light flooding in" |

**Header with team avatar**: Replace plain text header with a team member avatar (Amara — Lifestyle Scene Photographer) + branded intro:
```
[Amara avatar] Amara picked these for you
```
Small `text-[10px]` subtitle: "Tap a scene to get started"

### 2. `src/pages/Freestyle.tsx` — Branded hint banner with avatar

Replace the current plain hint banner (lines 994-1011) with a branded version featuring a team avatar:

```
[Sophia avatar] Your scene is set — [Add your product →]
```

Use `brandedToast` style inline avatar (w-5 h-5 rounded-full) from the team data. Import Sophia's avatar from `TEAM_MEMBERS`.

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — new presets, team avatar header
- `src/pages/Freestyle.tsx` — branded hint banner with Sophia avatar

