

# Post-Gen Conversion — Full Platform Audit (Round 7)

## Coverage Matrix (Current State)

| Page | Route | Layer 1 (Card) | Layer 2 (Drawer) | Layer 3 (Modal) | Credit Gate |
|------|-------|:-:|:-:|:-:|:-:|
| Generate (Workflows) | `/app/generate/:slug` | Yes | Yes | Yes | Yes |
| Freestyle | `/app/freestyle` | Yes | Yes | Yes | Yes |
| Text-to-Product | `/app/generate/text-to-product` | Yes | Yes | Yes | Yes |
| Product Images | `/app/generate/product-images` | None | None | Yes | Yes |
| Perspectives | `/app/perspectives` | None | None | Yes | Yes |
| Animate Video | `/app/video/animate` | None | None | Yes | Yes |
| Brand Models | `/app/models` | None | None | Yes | Yes |
| **Catalog Studio** | `/app/catalog/generate` | **None** | **None** | **None** | **BUG — uses old `openBuyModal`** |

## Component Design Audit

All three components are structurally sound. Confirmed across desktop (1293px), tablet (768px), and mobile (375px):

| Check | Status |
|-------|--------|
| Layer 1: 44px dismiss tap target | Pass (p-2.5 + min-w/min-h) |
| Layer 1: chip alignment pl-7 sm:pl-9 | Pass |
| Layer 1: 3s delayed fade-in | Pass |
| Layer 2: sm:!max-w-[480px] width override | Pass |
| Layer 2: p-0 pt-2 + inner pt-10 close clearance | Pass |
| Layer 2: "Most Popular" badge -top-2.5 with pt-3 | Pass |
| Layer 2: chip text-[11px] sm:text-[10px] | Pass |
| Layer 3: px-5 sm:px-8 mobile padding | Pass |
| Layer 3: overflow-visible + pt-4 for "Best Value" badge | Pass |
| Layer 3: grid-cols-1 sm:grid-cols-3 pack layout | Pass |
| Layer 3: min-h-[44px] on all buttons | Pass |
| Layer 3: w-full sm:w-auto "Maybe Later" | Pass |
| Layer 3: View Plans → /app/settings (internal) | Pass |

**Verdict: All three components pass design, responsiveness, and accessibility checks.**

## Bug Found

### CatalogGenerate.tsx — uses legacy `openBuyModal`, no NoCreditsModal

`CatalogGenerate.tsx` (line 64) destructures `openBuyModal` from `useCredits()` and passes it to `CatalogStepReviewV2` (lines 796, 838). The review step calls `onOpenBuyModal()` when credits are insufficient (line 75 of CatalogStepReviewV2). This opens the old `BuyCreditsModal` (also explicitly rendered at line 900).

This is the only remaining generation surface that lacks the new `NoCreditsModal`.

## Conflict Analysis

| Scenario | Status |
|----------|--------|
| `BuyCreditsModal` rendered globally in App.tsx AND locally in CatalogGenerate.tsx | Duplicate render — both are always mounted. Low visual risk (same modal) but wasteful |
| `openBuyModal` still used in non-generation contexts (Dashboard credit card, CreditIndicator sidebar, LowCreditsBanner, BrandModels UpgradeHero) | Correct — these are navigation/info surfaces, not credit gates. Old modal is appropriate here |
| Layer 2 + Layer 3 simultaneous open | Low risk — different triggers (upsell vs zero credits) |
| `LowCreditsBanner` + Layer 1 card | Complementary — banner is persistent, card appears post-generation |

## Summary of Required Fixes

| Priority | File | Fix |
|----------|------|-----|
| **Critical** | `src/pages/CatalogGenerate.tsx` | Import `NoCreditsModal`, add state, replace `openBuyModal` passed to review steps with `setNoCreditsModalOpen(true)`. Remove duplicate local `BuyCreditsModal` render (line 900) since it's already global in App.tsx |
| **Minor** | `src/components/app/catalog/CatalogStepReviewV2.tsx` | No changes needed — the `onOpenBuyModal` prop name is generic enough; CatalogGenerate just needs to pass the new trigger |

One file to modify. Everything else passes.

