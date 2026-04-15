

# Post-Gen Conversion — Full Platform Audit (Round 8)

## Coverage Matrix (Final State)

| Page | Route | Layer 1 (Card) | Layer 2 (Drawer) | Layer 3 (Modal) | Credit Gate |
|------|-------|:-:|:-:|:-:|:-:|
| Generate (Workflows) | `/app/generate/:slug` | Yes | Yes | Yes | Yes |
| Freestyle | `/app/freestyle` | Yes | Yes | Yes | Yes |
| Text-to-Product | `/app/generate/text-to-product` | Yes | Yes | Yes | Yes |
| Product Images | `/app/generate/product-images` | — | — | Yes | Yes |
| Perspectives | `/app/perspectives` | — | — | Yes | Yes |
| Animate Video | `/app/video/animate` | — | — | Yes | Yes |
| Brand Models | `/app/models` | — | — | Yes | Yes |
| Catalog Studio | `/app/catalog/generate` | — | — | Yes | Yes |
| **Short Film** | `/app/video/short-film` | — | — | **None** | **BUG — toast.error only** |
| **Creative Drops** | wizard component | — | — | **None** | **Uses old `openBuyModal`** |
| **Upscale Modal** | in-page modal | — | — | **None** | **Disabled button, no purchase path** |

## Component Design Audit

All three components pass design, responsiveness, and accessibility checks. No regressions from Round 7:

| Check | Status |
|-------|--------|
| Layer 1: 44px dismiss tap target | Pass |
| Layer 1: chip alignment, 3s fade-in | Pass |
| Layer 2: `sm:!max-w-[480px]`, close clearance, badge | Pass |
| Layer 3: mobile padding, badge overflow, 44px buttons | Pass |
| Layer 3: `grid-cols-1 sm:grid-cols-3` pack grid | Pass |
| Layer 3: View Plans → `/app/settings` (internal) | Pass |

**All components structurally sound. No design fixes needed.**

## Bugs Found

### Bug 1: Short Film — toast error, no NoCreditsModal

`useShortFilmProject.ts` line 749–751: when `balance < totalCredits`, it shows `toast.error("Not enough credits...")` and returns. No modal, no purchase path. The user hits a dead end.

**Fix**: Add `NoCreditsModal` state to `ShortFilm.tsx`. Pass a callback from ShortFilm into the hook (or handle it at the page level by checking balance before calling `startGeneration`).

### Bug 2: Creative Drops Wizard — uses legacy `openBuyModal`

`CreativeDropWizard.tsx` line 1781: calls `creditCtx.openBuyModal()` which opens the old `BuyCreditsModal`. This is a generation surface (Creative Drops generate images) so it should use `NoCreditsModal`.

**Fix**: Import `NoCreditsModal`, add local state, replace `creditCtx.openBuyModal()` with `setNoCreditsOpen(true)`.

### Bug 3: Upscale Modal — no purchase path when insufficient credits

`UpscaleModal.tsx` line 145: button shows "Insufficient credits" but is disabled with no way to purchase. The user is stuck.

**Fix**: When `!hasEnough`, make the button open `NoCreditsModal` instead of being disabled.

## Summary of Required Fixes

| Priority | File | Fix |
|----------|------|-----|
| **Critical** | `src/pages/video/ShortFilm.tsx` | Add `NoCreditsModal` with credit check before `startGeneration` |
| **Critical** | `src/components/app/UpscaleModal.tsx` | Add `NoCreditsModal`, open it when credits insufficient instead of disabled button |
| **Medium** | `src/components/app/CreativeDropWizard.tsx` | Replace `creditCtx.openBuyModal()` with local `NoCreditsModal` |

3 files to modify. All other surfaces pass.

