

# Post-Gen Conversion — Full Platform Audit (Round 9)

## Coverage Matrix (Current State)

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
| Short Film | `/app/video/short-film` | — | — | Yes | Yes |
| Creative Drops | wizard component | — | — | Yes | Yes |
| Upscale Modal | in-page modal | — | — | Yes | Yes |

**All 11 generation surfaces now use `NoCreditsModal` for credit gates.**

## Component Design Audit

| Check | Status |
|-------|--------|
| Layer 1: 44px dismiss tap target (p-2.5 + min-w/min-h) | Pass |
| Layer 1: chip alignment pl-7 sm:pl-9 | Pass |
| Layer 1: 3s delayed fade-in | Pass |
| Layer 2: sm:!max-w-[480px] width override | Pass |
| Layer 2: p-0 pt-2 + inner pt-10 close clearance | Pass |
| Layer 2: "Most Popular" badge -top-2.5 with pt-3 | Pass |
| Layer 3: px-5 sm:px-8 mobile padding | Pass |
| Layer 3: overflow-visible + pt-4 for "Best Value" badge | Pass |
| Layer 3: grid-cols-1 sm:grid-cols-3 pack layout | Pass |
| Layer 3: min-h-[44px] on all buttons | Pass |
| Layer 3: View Plans → /app/settings (internal) | Pass |

## Remaining Items (Minor — No User Impact)

### 1. Residual toast in useShortFilmProject.ts (dead code)

`useShortFilmProject.ts` line 749–751 still has `toast.error("Not enough credits...")` + return. Since `ShortFilm.tsx` now intercepts at the page level before calling `startGeneration()`, this code path is unreachable. It serves as defense-in-depth but the toast will never fire.

**Recommendation**: Remove the toast and early return from the hook to avoid confusion. Low priority — no user-facing impact.

### 2. `openBuyModal` still used in non-generation contexts (correct behavior)

These surfaces correctly use the legacy `openBuyModal` because they are navigation/info surfaces, not credit gates:

- `CreditIndicator.tsx` (sidebar) — opens pricing modal for browsing plans
- `LowCreditsBanner.tsx` — persistent banner with "Top up" button
- `Dashboard.tsx` — credit balance card click
- `BrandModels.tsx` UpgradeHero — "Upgrade to Growth" button for plan-gated feature

No changes needed for these.

## Verdict

**The Post-Gen Conversion system is fully functional across all generation surfaces.** All credit gates open `NoCreditsModal`. All three conversion layers (Card, Drawer, Modal) pass design and accessibility checks at desktop, tablet, and mobile breakpoints.

Only one optional cleanup remains: removing the dead toast in `useShortFilmProject.ts`.

| Priority | File | Fix |
|----------|------|-----|
| Optional | `src/hooks/useShortFilmProject.ts` | Remove redundant toast.error + return at line 749–751 (dead code — page-level gate already prevents this path) |

