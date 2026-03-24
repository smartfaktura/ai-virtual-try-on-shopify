

# Fix Quick-Start Presets: Carousel, Thumbnails & Hint Banner

## Issues

1. **Wrong scene thumbnails** — presets use `mockTryOnPoses[poseId].previewUrl` which shows a generic model in the scene, not matching the named model. Some model IDs are wrong (e.g., `model_040` is "Ethan" not "Luna" — Luna doesn't exist)
2. **Desktop shows all 11 presets in a wrapped grid** — cluttered, should be a scrollable carousel with arrows
3. **Hint banner** is grey/muted — should be dark blue accent to stand out

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx`

**Fix thumbnails**: Use the **model's** `previewUrl` (headshot/portrait) as the thumbnail instead of the pose preview. The scene name is already in the subtitle text — the thumbnail should show WHO the model is since that's more recognizable. Find the model from `mockModels` and use `model.previewUrl`.

**Fix wrong model mappings**:
- "Pilates Studio Glow" — change `model_040` (Ethan) to `model_054` (Natalie) or another female fitness-appropriate model. Update subtitle to match.

**Convert to scrollable carousel on desktop**:
- Remove `lg:flex-wrap lg:overflow-visible lg:justify-center` 
- Keep horizontal scroll for all breakpoints
- Add left/right arrow buttons on desktop (hidden on mobile) using ChevronLeft/ChevronRight icons, positioned at carousel edges
- Use a `ref` + `scrollBy()` for smooth scrolling on arrow click
- Add left fade gradient too (show only when scrolled past start)
- Show ~4-5 chips at a time on desktop

### 2. `src/pages/Freestyle.tsx` (~line 996-1016)

**Change hint banner to dark accent**:
- Background: `bg-primary text-primary-foreground` (dark blue) instead of `bg-accent border-border/60`
- Sophia avatar ring: `ring-primary-foreground/30` 
- "Add your product" button: `text-primary-foreground font-bold` with white text
- Close button: `text-primary-foreground/60`
- This makes the banner pop visually against the light page background

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — model thumbnails, fix Luna, scrollable carousel with arrows
- `src/pages/Freestyle.tsx` — dark blue hint banner

