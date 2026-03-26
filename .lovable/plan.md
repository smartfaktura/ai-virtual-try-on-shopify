

# Animate Video Page — Polish Pass

## Audio Status
The audio generation flow is correct end-to-end:
- UI: `audioMode === 'ambient'` → `withAudio: true`
- Hook: `body.with_audio = true` sent to edge function
- Edge function: `klingBody.sound = body.with_audio ? "on" : "off"` (correct Kling API parameter)

No fix needed for audio. It should generate audio when "Ambient" is selected.

## Changes

### 1. Remove all emojis from category chips
In `src/lib/videoMotionRecipes.ts`, replace emoji icons in `PRODUCT_CATEGORIES` with Lucide icon component names (strings), then update `ProductContextSelector.tsx` to render Lucide icons instead of emoji text.

Categories and their replacement icons:
- Fashion & Apparel: `Shirt`
- Beauty & Skincare: `Sparkles`
- Fragrances: `Flower2`
- Jewelry: `Gem`
- Accessories: `Watch`
- Home & Decor: `Lamp`
- Food & Beverage: `UtensilsCrossed`
- Electronics: `Smartphone`
- Sports & Fitness: `Dumbbell`
- Health & Supplements: `Pill`

### 2. Motion Refinement — default open
In `src/components/app/video/MotionRefinementPanel.tsx`, change `useState(false)` to `useState(true)` on line 51.

### 3. Add tooltip info cards to settings
Add informational tooltips to settings that may be unclear. Use a modern 2026 pattern: a small `Info` icon next to each label that triggers a tooltip with a brief explanation.

Components that need tooltips:
- **Camera Motion**: "Controls how the virtual camera moves during the video. Affects framing but not the subject."
- **Subject Motion**: "Defines how the main subject moves. 'Auto' uses AI analysis to pick the best motion type."
- **Realism Level**: "Higher realism enforces stricter motion limits and preservation. Stylized allows more creative freedom."
- **Loop Style**: "Controls whether the video loops seamlessly. Seamless Loop constrains motion to cyclic patterns."
- **Motion Intensity**: "How much overall movement appears. Higher intensity means more dramatic motion but may reduce stability."
- **Preservation Rules** (section-level): "Toggle which elements the AI should protect from changing during motion. Critical for brand consistency."
- **Preserve Scene Composition**: "Keeps background, layout, and overall framing stable."
- **Preserve Product Details**: "Protects logos, labels, textures, and product geometry from distortion."
- **Preserve Subject Identity**: "Maintains facial features and body proportions. Important for on-model shots."
- **Preserve Outfit / Styling**: "Keeps clothing details, colors, and accessories consistent."
- **Aspect Ratio**: "Match your output channel. 9:16 for Reels/TikTok, 1:1 for feed posts, 16:9 for ads and web."
- **Duration**: "Longer videos use more credits but allow more complex motion sequences."
- **Audio**: "Ambient adds AI-generated background sound matched to the scene. Silent produces video only."
- **Specific Motion Note**: "Add precise instructions like 'one basketball dribble' or 'gentle fabric sway at the hem'. Overrides may be softened if they conflict with preservation settings."

Implementation: Create a small reusable `InfoTooltip` component using the existing `Tooltip` from shadcn. Style with a subtle `text-muted-foreground/50` `Info` icon (14px) that shows a clean tooltip on hover. Apply to `MotionRefinementPanel`, `PreservationRulesPanel`, Settings section in `AnimateVideo.tsx`, and the motion note label.

## Files to modify
- `src/lib/videoMotionRecipes.ts` — remove emoji strings, use icon name strings
- `src/components/app/video/ProductContextSelector.tsx` — render Lucide icons instead of emoji
- `src/components/app/video/MotionRefinementPanel.tsx` — default open + add tooltips to each row
- `src/components/app/video/PreservationRulesPanel.tsx` — add tooltips to each toggle
- `src/pages/video/AnimateVideo.tsx` — add tooltips to settings section labels and motion note
- Create `src/components/app/video/InfoTooltip.tsx` — small reusable tooltip component

