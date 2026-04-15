

# Freestyle Card — Visual Selection Thumbnails with Real Assets

## What changes

**File: `src/components/app/FreestylePromptCard.tsx` — Enhanced rewrite**

### 1. Better prompt text
Change from generic "Shoot my crop top on a court, studio, and café" to a more specific, product-aware prompt:
```
"Shoot my white crop top, editorial style, urban street and café"
```
Short enough to type quickly, feels like a real user prompt.

### 2. Replace icon-only pills with visual thumbnail pills
After typing completes, instead of plain text pills with icons, show small circular/rounded thumbnail images with labels — similar to how other workflow cards show recipe items. Each pill gets a real image from existing landing-assets storage:

- **Scene** → `poses/pose-lifestyle-coffee.jpg` (café scene)
- **Model** → `models/model-female-slim-asian.jpg` (first model in list)
- **Product** → `workflows/workflow-tryon-product-flatlay.png` (the crop top product)
- **Generate** → keeps the Zap icon pill (no image, it's an action)

Pill layout:
```
[ 🖼 Scene ] [ 🖼 Model ] [ 🖼 Product ] [ ⚡ Generate ]
```

Each image pill: small `20×20` (mobile) or `24×24` (desktop) rounded-full image + label text. Compact enough to fit 4 across on any screen.

### 3. Image loading
- Use `getOptimizedUrl()` with `quality: 50` for tiny thumbnails (same pattern as `workflowAnimationData.tsx`)
- Import `getLandingAssetUrl` and `getOptimizedUrl` from existing utils
- Define asset URLs as constants at module level (no runtime fetching)

### 4. Animation timing stays the same
- Typewriter types the new prompt text
- Send icon appears
- Pills fade in sequentially with thumbnails
- Hold → fadeout → restart
- No changes to the state machine logic

### 5. Pill markup change
Replace the current icon-only `<span>` pills with:
```tsx
<span className="inline-flex items-center gap-1 rounded-full border ...">
  <img src={step.image} className="w-5 h-5 rounded-full object-cover" />
  <span>{step.label}</span>
</span>
```
For "Generate" (no image), keep the Zap icon as before.

### 6. Responsive sizing
- Desktop: `w-6 h-6` images, `text-xs` labels, `px-2 py-0.5` pills
- Mobile compact: `w-5 h-5` images, `text-[10px]` labels, `px-1.5 py-0.5` pills
- `flex-wrap justify-center` ensures natural wrapping on narrow screens

### What stays the same
- Card structure, aspect ratios, content area, CTA button — all unchanged
- State machine phases and timing constants — unchanged
- IntersectionObserver pause/resume — unchanged

