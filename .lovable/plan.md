

# Full Post-Gen Conversion QA Audit — All Pages, All Breakpoints, All Scenarios

## Coverage Matrix

| Page | Route | Layer 1 (Card) | Layer 2 (Drawer) | Layer 3 (Modal) | Credit Gate |
|------|-------|:-:|:-:|:-:|:-:|
| Generate (Workflows) | `/app/generate/:slug` | Yes | Yes | Yes | **BUG — uses `openBuyModal` (old modal)** |
| Freestyle | `/app/freestyle` | Yes | Yes | Yes | Yes (`setNoCreditsModalOpen`) |
| Text-to-Product | `/app/generate/text-to-product` | Yes | Yes | Yes | **BUG — NO credit gate before generation** |
| Product Images | `/app/generate/product-images` | **None** | **None** | **None** | **BUG — uses `openBuyModal` (old modal)** |
| Perspectives | `/app/perspectives` | None | None | Yes | Yes (`setNoCreditsOpen`) |
| Animate Video | `/app/video/animate` | None | None | Yes | Yes (`setNoCreditsOpen`) |
| Brand Models | `/app/models` | None | None | Yes | Yes (inline button → modal) |

---

## Critical Bugs Found

### Bug 1: Generate.tsx — credit gate opens OLD BuyCreditsModal, not NoCreditsModal

**Lines 512, 1157, 1572, 3997, 4007, 4515**: All credit-insufficient paths call `openBuyModal()` which opens the legacy `BuyCreditsModal` (full pricing page modal from CreditContext), NOT the new `NoCreditsModal` with credit packs.

The `NoCreditsModal` IS rendered (line 4526) but `setNoCreditsModalOpen(true)` is never called anywhere in Generate.tsx. It is completely dead code — the modal will never open.

**Impact**: The main workflows page — the most-used generation surface — never shows the enhanced Layer 3 conversion modal. Users see the old full-page pricing modal instead.

**Fix**: Replace all `openBuyModal()` calls in Generate.tsx with `setNoCreditsModalOpen(true)` at credit-gate points. Keep the `openBuyModal` import for `TryOnConfirmModal`'s `onBuyCredits` prop (or convert that too).

### Bug 2: TextToProduct — NO credit check before generation

`handleGenerate()` (line 478) immediately starts enqueuing jobs with zero credit validation. There is no `balance` check, no `creditCost > balance` gate. The `noCreditsModalOpen` state exists but is never set to `true` anywhere in the file.

**Impact**: Free users on Text-to-Product can attempt generation with zero credits. The edge function may reject it server-side, but the UX shows a broken loading state instead of the conversion modal.

**Fix**: Add credit check at the top of `handleGenerate`:
```
if (creditCost > balance) { setNoCreditsModalOpen(true); return; }
```
Requires destructuring `balance` from `useCredits()` (currently only `refreshBalance` and `plan` are used).

### Bug 3: Product Images — no Post-Gen Conversion at all

`ProductImages.tsx` uses `openBuyModal()` (old modal) at line 512. No `NoCreditsModal`, no Layer 1 card, no Layer 2 drawer. This is the primary generation wizard and has zero conversion integration.

**Fix**: Import and wire `NoCreditsModal`. Replace `openBuyModal()` in `handleGenerate` with `setNoCreditsModalOpen(true)`. Layers 1 and 2 are lower priority since the 6-step wizard has a different UX flow, but Layer 3 is essential.

---

## Design & Responsiveness Status (Components)

All three components passed previous rounds. Confirming final state:

| Check | Status |
|-------|--------|
| Layer 1 card: `pl-7 sm:pl-9` chip alignment | Pass |
| Layer 1 card: 3s delayed fade-in animation | Pass |
| Layer 1 card: dismiss button hit target (p-1 + 3.5 icon) | **Minor** — 20px tap target, below 44px mobile minimum |
| Layer 2 drawer: `sm:!max-w-[480px]` override | Pass |
| Layer 2 drawer: `p-0 pt-2` + `p-6 pt-10` close button clearance | Pass |
| Layer 2 drawer: Growth card `-top-2.5` badge with `pt-3` | Pass |
| Layer 2 drawer: chip text `text-[11px] sm:text-[10px]` | Pass |
| Layer 3 modal: `px-5 sm:px-8` mobile padding | Pass |
| Layer 3 modal: `overflow-visible` + `pt-4` for Best Value badge | Pass |
| Layer 3 modal: `w-full sm:w-auto` Maybe Later button | Pass |
| Layer 3 modal: `grid-cols-1 sm:grid-cols-3` pack grid | Pass |
| Layer 3 modal: View Plans link goes to `/app/settings` (not external) | Pass |

### Minor Design Issue: Layer 1 dismiss button tap target

The X button is `p-1` with a 14px icon = ~22px total touch area. On mobile, Apple HIG recommends 44px minimum. Not broken, but harder to tap on small screens.

**Fix**: Change from `p-1` to `p-2` on the dismiss button, or add `min-w-[44px] min-h-[44px]` with flex centering.

---

## Conflict Analysis

| Scenario | Risk | Status |
|----------|------|--------|
| `openBuyModal` (old) vs `NoCreditsModal` (new) | **Both exist simultaneously** | Bug — Generate.tsx and ProductImages.tsx still call old modal |
| Layer 2 Sheet + Layer 3 Dialog open at same time | Theoretically possible | Low risk — different trigger conditions (upsell vs zero credits) |
| `BuyCreditsModal` rendered globally via CreditContext | Always mounted | No conflict — different z-index layers |
| `LowCreditsBanner` + Layer 1 card | Could show simultaneously | Complementary — banner is persistent, card appears after generation |
| Session/localStorage keys across pages | Shared correctly | Pass — `L1_SESSION_KEY` persists across page navigations |

---

## Summary of Required Fixes

| Priority | File | Fix |
|----------|------|-----|
| **Critical** | `src/pages/Generate.tsx` | Replace `openBuyModal()` credit gates with `setNoCreditsModalOpen(true)` |
| **Critical** | `src/pages/TextToProduct.tsx` | Add credit check in `handleGenerate`, destructure `balance` from `useCredits()` |
| **Critical** | `src/pages/ProductImages.tsx` | Import `NoCreditsModal`, add state, replace `openBuyModal()` with modal trigger |
| Minor | `src/components/app/PostGenerationUpgradeCard.tsx` | Increase dismiss button tap target to 44px |

These 3 critical fixes ensure every generation surface uses the enhanced `NoCreditsModal` instead of the legacy `BuyCreditsModal` when credits are insufficient.

