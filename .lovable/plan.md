

## Redesign FreestyleShowcaseSection to Match App UI and VOVV.AI Branding

The current showcase animation uses generic gradient placeholders and simplified chips that don't reflect the actual Freestyle app experience. The section also uses a plain `bg-background` that doesn't match the warm stone / elevated branding of other landing sections.

### Changes

**`src/components/landing/FreestyleShowcaseSection.tsx`** — Full rewrite

#### 1. Match the actual Freestyle app UI structure
- Redesign the animated demo to mirror the real prompt panel: textarea area at top, divider, chips row below, divider, generate button bar at bottom — matching `FreestylePromptPanel.tsx`
- Chips should show **thumbnail images** when selected (like the real app chips do) — a small round avatar for model, a square thumbnail for product, and scene thumbnail
- Add a **Product** chip (with `Package` icon) that animates to show a product thumbnail + name (e.g., "Cropped Tee")
- Keep Model and Scene chips, but show real thumbnails from `getLandingAssetUrl()` when activated
- Remove the generic "Style" and "Ratio" chips — they don't match what the app prominently shows

#### 2. Show real images instead of gradient placeholders
- Use `getLandingAssetUrl()` for product input image, model thumbnail, scene thumbnail
- Use `getLandingAssetUrl()` for the 3 result images — reference existing hero output images (e.g., `hero-output-studio.jpg`, `hero-output-park.jpg`, `hero-output-coffee.jpg`)
- Result cards should use `ShimmerImage` with proper aspect ratio and labels

#### 3. Animation sequence (matching real workflow)
1. **Typewriter** types the prompt (0-3s)
2. **Product chip** activates — shows product thumbnail + "Cropped Tee" (3s)
3. **Model chip** activates — shows model avatar + "Sofia" (4s)
4. **Scene chip** activates — shows scene thumbnail + "Rooftop" (5s)
5. **Generate button** lights up and pulses (6s)
6. **Progress bar** appears at top of panel (6.5s)
7. **3 result images** appear staggered below with real photos (7.5s+)
8. Loop after ~12s

#### 4. Brand-consistent section styling
- Change section background from `bg-background` to the warm stone pattern used elsewhere: `bg-[#faf9f8]` or use the subtle radial gradient glow
- Add subtle top/bottom border like other showcase sections
- Use the same badge/pill styling as `ProductCategoryShowcase` and `ModelShowcaseSection` for the section label
- Ensure the heading typography uses the tight tracking (`tracking-tight`) consistent with other sections

#### 5. Panel design improvements
- Remove the fake macOS window chrome (red/yellow/green dots) — it looks generic and doesn't match VOVV.AI's clean aesthetic
- Instead use a minimal header bar with "Freestyle Studio" label + sparkle icon, matching the app's actual top bar
- Panel should use `rounded-2xl border border-border/60 bg-card shadow-xl` (keep this)
- Add the progress bar animation at the top of the panel during "generating" phase (like the real app's `h-[2px] bg-primary animate-pulse-slide`)

#### 6. Result images section
- Show results in a 3-column grid below the panel (not inside it) to give them more space
- Each result card: `ShimmerImage` + small label overlay at bottom
- Staggered fade-in animation on reveal

### Files changed
- `src/components/landing/FreestyleShowcaseSection.tsx` — full rewrite with real assets, app-matching UI, branded styling

