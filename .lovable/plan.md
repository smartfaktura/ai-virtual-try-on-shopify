## Tennis Editorial — Enhanced Film Grain, Cinematic Color & Anti-Unnatural Pose Safeguards

### What's changing

Each of the 6 Tennis Editorial scenes gets two upgrades to the film grading section and a new anti-pose safeguard block:

### 1. Enhanced Film Grain (specific per scene)

Current grain directives are generic ("render organic grain"). Replacing with scene-specific grain recipes that describe the physical film stock behavior:

| Scene | Film Grain Recipe |
|---|---|
| **Tennis Court Baseline** | Kodak Vision3 500T tungsten film pushed +1 stop — heavy clumped grain in shadow areas with visible silver-halide clusters, finer grain in highlights. Grain density shifts with luminance: deep shadows show coarse irregular clumps ~3-4px equivalent, mid-tones show medium organic texture ~1-2px, highlights stay nearly clean. Color grain channels should separate slightly — green channel sharper, red/blue softer — creating subtle chromatic grain variation. |
| **Clay Court Warm-Up** | Fuji Superia 400 warm consumer film — pronounced warm-toned grain with golden-amber bias in the grain texture itself. Grain clumps irregularly in the warm mid-tones, creating a tactile hand-printed feel. Shadow grain compresses into muddy warm brown clusters. The grain should feel like a slightly underexposed scan with scanner dust artifacts barely visible. |
| **Net Approach Portrait** | Kodak Portra 400 pulled -1/3 — ultra-fine grain in the highlights and skin tones (this is a portrait, grain must not destroy facial detail), with characterful medium grain emerging in the shadow channels and dark fabric areas. The grain should have a slightly cool bias matching the teal shadow push. Barely visible on the brightest skin, pronounced in the dark net mesh and court shadows behind. |
| **Tennis Club Lounge** | Kodak Gold 200 overexposed +1 — warm halation bloom on highlights with golden grain structure. Grain is visible and tactile across the entire image, heavier in mid-tones than shadows (Gold characteristic). The grain clumps should feel like a well-scanned drugstore print — nostalgic, imperfect, with slight color-noise shifting between frames. |
| **Racket & Gear Flat Lay** | Kodak Ektar 100 medium-format — extremely fine, tight grain structure appropriate for a well-lit product shot. Grain is uniform and barely visible but present enough to feel analogue. No clumping. The grain adds subtle surface texture without competing with fabric weave detail. |
| **Stadium Court Hero** | Kodak Vision3 250D daylight motion picture film — cinematic grain with strong presence in the crushed shadow areas and dark mid-tones. The grain has a slightly cool desaturated quality matching broadcast film. Heavy, gritty clusters in the darkest 20% of the image, transitioning to clean tight grain in the highlights on the model. This is sports broadcast grain — raw, editorial, not polished. |

### 2. Cinematic Color Grading Enhancement

Adding specific color science directives per scene:

- **Baseline**: Add split-toning — warm amber in highlights, cool slate-blue in shadows. Specify a slight S-curve contrast with lifted blacks and soft-rolled highlights.
- **Clay Court**: Add complementary color harmony — warm terracotta dominant with desaturated teal-green in shadows. Specify analog color-crossover in the mid-tones.
- **Net Approach**: Add skin-tone protection — lock skin luminance channel while pushing teal into shadow chrominance only. Specify highlight rolloff mimicking Arri Alexa sensor behavior.
- **Club Lounge**: Add vintage color fade — desaturate overall by 10-15%, push golden warmth into whites, let blacks drift to warm brown. Specify halation radius around backlit edges.
- **Flat Lay**: Add studio color precision — neutral white balance with micro-warm shift (+3 Kelvin), clean shadows with no color contamination. Maintain fabric color accuracy above all.
- **Stadium Hero**: Add broadcast LUT feel — punchy mid-tone contrast, teal-orange complementary split, skin warmth isolated from environment desaturation. Specify blue-hour ambient color.

### 3. Anti-Unnatural Pose Safeguard Block

Adding a new `POSE AUTHENTICITY (CRITICAL)` section to each on-model scene (5 scenes, skip Flat Lay) with:

- Explicit list of forbidden poses: no squatting, no yoga poses, no fashion model hand-on-hip, no standing with racket raised overhead like a trophy (unless Stadium Hero), no sitting cross-legged on court, no lying down, no jumping unless mid-serve
- Positive guidance: every pose must be a position a real tennis player assumes during play, warm-up, or changeover
- Scene-specific pose lock: each scene names the EXACT tennis moment being captured (e.g., "forehand preparation", "volley approach", "changeover rest") and states the model must be in THAT moment, not any other

### Scope
- 6 `UPDATE` statements via insert tool (data only)
- Film grading sections rewritten with scene-specific film stock recipes
- New pose safeguard block added to 5 on-model scenes
- All other prompt sections (court geometry, camera position, product dynamics) preserved unchanged
