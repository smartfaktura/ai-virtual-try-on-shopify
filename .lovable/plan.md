# Fix Orbit pricing + Motion Refinement label legibility

## Bug found

The camera-motion grid uses id **`orbit`** (`src/lib/videoMotionRecipes.ts:260`), but the premium list everywhere checks for **`product_orbit`**. Result:

- No `PRO · 2×` badge on the Orbit tile
- Frontend `estimateCredits` never doubles for Orbit
- Backend `enqueue-generation` never doubles for Orbit
- Only Premium Handheld was actually doubled

The id `product_orbit` doesn't exist in `CAMERA_MOTIONS` at all — it was a stale name. We replace it with `orbit` everywhere (no backward-compat needed because no row in the DB could have matched it).

## Changes

### 1. Pricing — use the real id

`src/config/videoCreditPricing.ts`
```ts
const PREMIUM_MOTION_RECIPES = ['orbit', 'premium_handheld'];
```

`supabase/functions/enqueue-generation/index.ts`
```ts
if (["orbit", "premium_handheld"].includes(motion)) cost *= 2;
```
Redeploy `enqueue-generation`.

### 2. AnimateVideo override select

The per-image override `<select>` already uses `isPremiumCameraMotion` — no change needed; it will now correctly tag Orbit with ` — PRO · 2×`.

### 3. Motion Refinement label legibility

`src/components/app/video/CameraMotionGrid.tsx` — tile labels currently render as `text-[10px] text-muted-foreground` (gray on white card, low contrast, too small). Fix:

- Bump base size: `text-[10px]` → `text-[11px]`
- Tighten weight + color for non-active: `text-muted-foreground` → `text-foreground/80 font-medium`
- Active state already bold/foreground — keep as is
- Add slightly more vertical padding: `py-1.5` → `py-2`

PRO badge also gets a small contrast/readability bump:
- Larger text: `text-[9px]` → `text-[10px]`
- Tighter padding stays, but use full `bg-foreground` (not 90% alpha) for crisp contrast over varied video previews
- Add subtle ring for definition: `ring-1 ring-background/40`

## Files

- `src/config/videoCreditPricing.ts` — swap `product_orbit` → `orbit`
- `supabase/functions/enqueue-generation/index.ts` — swap `product_orbit` → `orbit`, redeploy
- `src/components/app/video/CameraMotionGrid.tsx` — label + badge typography
