
## Admin preview page for new loading animations

Build a sandbox page at `/app/admin/loading-lab` so you can see and compare the proposed `BrandLoader`, `DotPulse`, and `ShimmerBar` primitives **before** rolling them across the app. Nothing else changes — existing `Loader2` usages stay untouched until you approve the rollout.

### New files

**1. `src/components/ui/brand-loader.tsx`**
- `<BrandLoader fullScreen?, label?, hints? />`
- Centered monogram "V" (Inter 600, primary color) inside a 64px ring.
- Soft orbiting arc using `conic-gradient(from 0deg, transparent, hsl(var(--primary)/0.55), transparent 35%)` masked to a 1px ring, rotated by new `orbit` keyframe (1.6s linear infinite).
- "V" gently breathes (1 → 1.04, 2s ease-in-out).
- Optional rotating hint phrases under the mark (fade through every 2s).
- `fullScreen` prop centers it on `min-h-screen bg-background`.

**2. `src/components/ui/dot-pulse.tsx`**
- `<DotPulse size?: 'sm' | 'md', className? />`
- Three dots (4px sm / 6px md) using `currentColor` so it adapts to dark sidebar contexts.
- Staggered `dot-wave` keyframe (opacity 0.3↔1, scale 0.8↔1, 0.9s) with 0/160/320ms delays.

**3. `src/components/ui/shimmer-bar.tsx`**
- `<ShimmerBar visible />`
- Fixed 2px bar at top using existing `pulse-slide` keyframe in `index.css`.

**4. `src/pages/admin/LoadingLab.tsx`**
- Admin-only page rendering each primitive inside labeled cards:
  - **BrandLoader** — boxed 360×280 preview + a "Show full-screen" button that toggles a 4s overlay.
  - **DotPulse** — sm + md side by side, plus dark-bg sample (sidebar context), plus inside a button and chip.
  - **ShimmerBar** — toggle button that triggers a 3s top bar.
  - **Side-by-side comparison**: today's `Loader2 animate-spin` next to `<DotPulse />` so the upgrade is obvious.
  - **Reduced-motion note**: short paragraph explaining the `prefers-reduced-motion` fallback (static ring, opacity-only pulse).

### Edits

**`src/index.css`** — add 3 keyframes inside `@layer utilities`:
- `@keyframes orbit` — `0%→360deg rotate`
- `@keyframes breathe` — `1 → 1.04 scale`
- `@keyframes dot-wave` — opacity + scale wave
- `@media (prefers-reduced-motion: reduce)` block disabling orbit + dot-wave (keeps a soft opacity pulse).

**`src/App.tsx`** (or wherever admin routes live) — add a single route:
```tsx
<Route path="/app/admin/loading-lab" element={<LoadingLab />} />
```
Wrapped in the existing admin guard pattern used by other `/app/admin/*` pages (`useIsAdmin` check, redirect on non-admin).

### Validation

- Visit `/app/admin/loading-lab` as admin → see all three primitives live, side-by-side with current `Loader2` for comparison.
- Toggle full-screen `BrandLoader` and `ShimmerBar` to feel the motion in real layout.
- macOS "Reduce motion" enabled → orbit/dots stop spinning, only opacity pulses (verify in System Settings).
- Non-admin users hitting the route → redirected like other admin pages.

### Untouched until you approve rollout

- All existing `Loader2` usages, `Auth.tsx` pulsing "V", `ProtectedRoute.tsx`, skeletons, and submit-button spinners.
- No call-site swaps in this step — the lab is purely a preview surface so you can sign off on the look first.

### Next step (after approval, separate task)

Once you confirm the lab feels right, swap `Auth.tsx` + `ProtectedRoute.tsx` to `<BrandLoader fullScreen />` and replace inline `Loader2` in non-button contexts with `<DotPulse />`. Save a `mem://style/loading-system` rule so future loaders default to these.
