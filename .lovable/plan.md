

# Improve Style/Mood & Scene References — Kling-Optimized Presets with Inline Selection

## What Changes

### 1. Replace Style/Mood presets with Kling 3.0 cinematography-optimized styles

Current presets are generic mood descriptions. Replace with Kling-specific directives that leverage the model's strengths: camera physics, texture descriptors, lighting direction, and temporal motion cues.

**New Style/Mood presets (16 total, grouped by category):**

**Cinematic Film Looks:**
- Cinematic Noir — Deep blacks, chiaroscuro single key light, hard shadows on wet surfaces, film grain, desaturated palette
- Golden Hour Epic — Warm amber backlight, long soft shadows, golden rim highlights, anamorphic lens flare, shallow DOF
- Vintage Film Stock — Warm muted tones, analog 35mm grain, faded highlights, 70s Kodachrome color shift
- Monochrome Fine Art — Black and white, Rembrandt lighting, rich tonal range, skin pores visible, fine art feel

**Commercial / Product:**
- Clean Luxury — Pristine whites, soft even lighting, premium minimalist feel, subtle caustic reflections, macro detail
- Bold Editorial Pop — Vivid punchy saturated colors, strong contrast, hard flash, dynamic energy, fashion editorial
- Soft Diffusion Glow — Pastel tones, soft diffusion filter, dreamy bokeh, luminous highlights, gentle haze

**Atmospheric / Mood:**
- Neon Cyberpunk — Vibrant neon blues and magentas, wet reflective surfaces, dark environment, volumetric haze
- Dramatic Chiaroscuro — Single directional key light, deep rich shadows, painterly contrast, condensation on surfaces
- Ethereal Morning Mist — Cool diffused light, visible breath in cold air, soft fog, desaturated greens
- Natural Documentary — Available handheld light, authentic grain, realistic color, raw unpolished, skin texture visible

**Motion-Specific (Kling strengths):**
- Slow Motion Reveal — Time-stretched movement, fabric ripples, hair flowing, particles suspended, ultra-smooth 30fps
- Dynamic FPV Energy — Fast-paced drone perspective, motion blur on background, subject in sharp focus, high contrast
- Macro Texture Study — Extreme close-up, visible material fibers and pores, shallow DOF, studio ring light
- Liquid & Reflections — Refractive caustics, water droplets, chrome reflections, glass surfaces, wet textures
- Smoke & Atmosphere — Volumetric light rays through haze, floating particles, dramatic backlight, moody atmosphere

### 2. Replace Scene presets with Kling-optimized environment directives

Current scenes are static descriptions. New ones include temporal markers, texture details, and physics cues that Kling 3.0 responds well to.

**New Scene presets (16 total, grouped):**

**Studio:**
- White Infinity Cove — Seamless white cyclorama, soft directional shadows, subtle gradient, clean product isolation
- Dark Editorial Studio — Deep matte black, dramatic single side light, soft reflections on floor, negative space
- Marble & Gold Surface — White marble with gold veining, soft overhead studio light, refractive caustics on surface
- Colored Gel Studio — Smooth color gradient backdrop, dual-color gel lighting (specify colors), controlled shadows

**Natural / Outdoor:**
- Golden Hour Terrace — Warm sunset light on stone terrace, blurred cityscape beyond, long shadows, warm atmospheric haze
- Coastal Morning — Sandy beach tones, soft pre-dawn blue light, gentle ocean movement, sea mist, driftwood textures
- Misty Forest Floor — Morning mist between moss-covered trees, dappled cool light filtering through canopy, organic debris
- Rooftop at Dusk — Urban skyline, last light fading, warm string lights, concrete and metal textures, city glow

**Interior:**
- Modern Loft — Raw exposed brick, large industrial windows, natural side light, hardwood floors, warm ambient
- Luxury Bathroom — Marble surfaces, soft warm vanity light, steam rising, chrome fixtures, water droplets
- Cozy Warm Interior — Soft lamp light, wood textures, linen and wool fabrics, warm color temperature, intimate space
- Minimalist Concrete — Raw concrete walls and floor, cool diffused light, industrial textures, brutalist geometry

**Concept / Creative:**
- Botanical Greenhouse — Lush tropical greenery, dappled sunlight through glass ceiling, humidity visible, organic textures
- Neon Rain Street — Wet asphalt reflecting neon signage, magenta and cyan light pools, urban night, visible raindrops
- Surreal Gradient Void — Smooth infinite color gradient, no visible ground plane, floating subject, dreamy atmosphere
- Desert Golden Sands — Warm orange dunes, harsh directional sunlight, heat haze, textured sand ripples, vast scale

### 3. Add inline quick-select chips (instant selection without Library dialog)

For both Scene References and Style/Mood sections, add a scrollable row of chips directly in the card — users can tap to instantly add a preset without opening the Library dialog. The Library button remains for the full grid view.

**UI structure per section:**
```text
┌──────────────────────────────────────────────┐
│ 🎨 Style / Mood                    [Library] │
│ Upload visual tone or mood references.       │
│                                              │
│ Quick pick:                                  │
│ [Cinematic Noir] [Golden Hour] [Clean Luxury]│
│ [Neon Cyberpunk] [Macro Texture] [→ more]    │
│                                              │
│ [Selected: Cinematic Noir ✕]                 │
│                                              │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │    Drop images or browse                 │ │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└──────────────────────────────────────────────┘
```

- Show first 6 presets as horizontally scrollable chips
- Clicking a chip instantly adds it as a reference (same as picking from Library)
- Already-selected presets show as active/highlighted chips
- Keep the Library button for the full searchable grid dialog

### 4. Improve Library dialog layout

Group presets by category with small section headers in the dialog grid for easier browsing.

## Files to Change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Replace `STYLE_MOOD_PRESETS` and `VIDEO_SCENE_PRESETS` arrays with Kling-optimized versions; add inline quick-pick chip row for scene and style sections; group presets by category in Library dialogs |

