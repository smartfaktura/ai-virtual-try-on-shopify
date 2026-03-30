

# Landing Page Performance Audit — Findings & Fixes

## Critical Issues

### 1. `LandingPricing` calls `useCredits()` — crashes without CreditProvider (BUG)
`LandingPricing` (line 4, 15) imports and calls `useCredits()`, but `CreditProvider` was moved inside `/app/*` routes. On the landing page, this component is lazy-loaded inside `<Suspense>` — when it mounts, `useCredits()` will throw because there's no provider. This is a **runtime crash** for the pricing section.

**Fix**: Remove the `useCredits` dependency. For unauthenticated users, default `currentPlan` to `'free'` and `subscriptionStatus` to `'none'`. Use a try/catch or optional context pattern, or simply conditionally read credits only when `user` exists.

---

### 2. Hero images (showcase 2 & 3) bypass CDN optimization (HIGH impact)
16 images for Ring and Headphones showcases are served as raw PNGs from `/images/hero/` — uncompressed, no CDN transform. These are likely 500KB-2MB each. Showcase 1 (Crop Top) correctly uses `getLandingAssetUrl()` + `getOptimizedUrl()`.

**Fix**: Upload Ring and Headphones hero assets to the `landing-assets/hero/` storage bucket, then update paths in `HeroSection.tsx` lines 41-65 to use `h()` helper (which already calls `getLandingAssetUrl`).

---

### 3. `ProductCategoryShowcase` loads ALL category images eagerly (HIGH impact)
Each `CategoryCard` has `loading="eager"` on its `ShimmerImage` (line 85). With 4 categories × 5-9 images each = ~30 images all marked eager. Plus the crossfade preload effect loads the next image immediately via `new Image()`. The first visible image per card should be eager; the rest should not preload until the card cycles.

**Fix**: Set `loading="lazy"` on the base `ShimmerImage`. The crossfade `new Image()` preload already handles the next frame — no need for `loading="eager"` on either layer.

---

### 4. `StudioTeamSection` auto-plays 10 videos simultaneously (HIGH impact)
Each team member card renders a `<video autoPlay muted loop playsInline preload="metadata">`. Even with `preload="metadata"`, 10 concurrent video elements create significant bandwidth and GPU overhead. The carousel only shows ~3-4 cards at a time.

**Fix**: Use `IntersectionObserver` on each card to only set `autoPlay` / start playback when visible. Pause videos that scroll out of view.

---

## Medium Issues

### 5. `SignupSlideUp` imports Supabase client on every landing page load (MEDIUM)
Even though the popup only shows after 60% scroll, the component is eagerly rendered in `PageLayout` (used by `/try`) and directly on the landing page it's not present — but it imports `supabase` at the top level.

**Fix**: This only affects `/try` (PageLayout). Low priority — the supabase client is already loaded for AuthProvider anyway.

### 6. Inline `<style>` tags rendered in component bodies (LOW)
`HeroSection` (line 225, 536), `ProductCategoryShowcase` (line 177), and `HowItWorks` (line 104) inject `<style>` tags with keyframes directly in JSX. These are re-injected on every render and cause minor style recalc.

**Fix**: Move all keyframe definitions to `index.css` or a shared CSS file.

### 7. `ShimmerImage` eager cache check creates throwaway `Image()` on every mount (LOW)
Line 39-43 of `shimmer-image.tsx` creates `new Image()` and sets `.src` on every component mount to check browser cache. For pages with 30+ ShimmerImage instances, this is 30+ synchronous Image object creations during render.

**Fix**: This is an intentional tradeoff for shimmer-flash prevention. No change needed — impact is minimal per instance.

---

## Minor / Cosmetic

### 8. `font-weight: 700` (bold) not preloaded
The font preload (index.html line 22) loads Inter wght range but only one specific file. The page uses `font-extrabold` (800) on h1 which may cause a brief FOIT/FOUT for bold text.

### 9. Background blur on hero gradient
Line 212: `blur-3xl` creates a large GPU-composited layer. Already optimized compared to `backdrop-blur`, just noting it.

---

## Recommended Fix Priority

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Fix LandingPricing useCredits crash | Critical (bug) | Low |
| 2 | Hero images → CDN (Ring + Headphones) | High | Medium (needs upload) |
| 3 | CategoryCard images: remove `loading="eager"` | High | Low |
| 4 | StudioTeam: pause off-screen videos | High | Medium |
| 5 | Move inline keyframes to CSS | Low | Low |

Fixes 1, 3, and 5 are pure code changes. Fix 2 requires uploading ~16 images to storage. Fix 4 requires adding IO-based video play/pause logic.

### Technical detail for Fix 1
```tsx
// LandingPricing.tsx — safe fallback when outside CreditProvider
const creditContext = useSafeCredits(); // or inline:
let currentPlan = 'free';
let subscriptionStatus: string = 'none';
try {
  const ctx = useCredits();
  currentPlan = ctx.plan;
  subscriptionStatus = ctx.subscriptionStatus;
} catch {
  // Outside CreditProvider — use defaults
}
```

Or better: make `useCredits` return defaults when no provider exists (change context default value).

