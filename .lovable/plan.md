

# Missing Items from Pricing Update

## What was already done
- ✅ mockData.ts — features + ctaText updated
- ✅ Brand Models NEW badge on Growth/Pro
- ✅ NoCreditsModal — subline + "Choose {name}" CTAs
- ✅ BuyCreditsModal — Choose/Downgrade CTA logic
- ✅ UpgradeValueDrawer — Choose/Start with CTAs
- ✅ LandingPricing — renders badge from data
- ✅ Settings — intro line added
- ✅ AppPricing — new page with all sections
- ✅ App.tsx — route registered

## What's missing

### 1. NoCreditsModal — Mobile Growth-first reorder
The user's wireframe clearly shows Growth card appearing first on mobile. Currently `subscribablePlans` renders Starter → Growth → Pro in fixed order. Need to reorder on mobile so Growth appears first.

### 2. NoCreditsModal — Missing "Compare all features" + "Contact Sales" footer links
The user's prompt specifies footer should have "Compare all features →" (linking to `/app/pricing`) and "Contact Sales →". Currently the footer only has "Maybe Later".

### 3. NoCreditsModal — Missing billing toggle (Monthly/Annual)
The user's wireframe shows `[Monthly] [Annual -20%]` toggle inside the popup. Currently the modal only shows monthly prices with no toggle.

### 4. AppPricing — Missing SEO/PageHeader wrapper
The page renders raw content without the app shell's `PageHeader` component. Should add a proper page header for consistency.

### 5. CompetitorComparison component — Not integrated anywhere
The plan mentioned price-per-credit value messaging. The existing `CompetitorComparison.tsx` component exists but isn't used in any pricing surface. Could be added to `/app/pricing` to reinforce value.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/NoCreditsModal.tsx` | Add mobile Growth-first reorder, billing toggle, footer links |
| `src/pages/AppPricing.tsx` | Add PageHeader for app shell consistency |

## Technical Details

**Mobile reorder** — Same pattern as AppPricing: sort `subscribablePlans` so `highlighted` plan comes first on `< sm` viewports.

**Billing toggle** — Add `useState<'monthly' | 'annual'>` state, show toggle above plan cards, pass correct `stripePriceIdMonthly` vs `stripePriceIdAnnual` to checkout. Show annual price as `Math.round(annualPrice / 12)` with "SAVE 20%" badge.

**Footer links** — Add "Compare all features" as `<a href="/app/pricing">` and "Contact Sales" next to "Maybe Later" button.

