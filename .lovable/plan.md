

# Missing Design Fixes

After reviewing all files against the original requirements, here are the design issues that weren't implemented:

## 1. PlanCard (Settings) — Wrong CTA emphasis
The current plan button uses `variant="default"` (strongest visual weight), but per the spec it should be `secondary`/disabled. Higher plans should get the strongest emphasis, lower plans should be `outline` (visually weaker).

**File**: `src/components/app/PlanCard.tsx` line 127
- Change: `variant={isCurrentPlan ? 'default' : 'outline'}` → use upgrade/downgrade logic: `default` for higher plans, `outline` for lower/current.

## 2. LandingPricing — Missing price-per-credit line
The public `/pricing` page shows credits and image estimates but no price-per-credit line like "$0.053 per credit". The prompt explicitly requested this.

**File**: `src/components/landing/LandingPricing.tsx` ~line 122-126
- Add: `{price > 0 && credits > 0 && <p className="text-[10px]">${(price/credits).toFixed(3)} per credit</p>}`

## 3. AppPricing — Non-reactive mobile detection
Line 173 uses `typeof window !== 'undefined' && window.innerWidth < 640` which doesn't respond to resizes. Should use `useIsMobile()` hook.

**File**: `src/pages/AppPricing.tsx`
- Import `useIsMobile`, replace the inline check.

## 4. Detailed features accordion — Brand Models missing NEW badge
In the `DETAILED_FEATURES` constant (lines 42/54), "Brand Models" is a plain string. Should render with a NEW badge like the plan cards do.

**File**: `src/pages/AppPricing.tsx`
- Change `DETAILED_FEATURES` Growth/Pro entries to use `{ text: 'Brand Models', badge: 'NEW' }` objects and update the render logic to handle mixed types.

## 5. NoCreditsModal cards — Missing ~images and price-per-credit
The popup plan cards show credits but not the `~images/mo` estimate or the price-per-credit line that the wireframe shows (e.g., "~300 images", "$0.053 per credit").

**File**: `src/components/app/NoCreditsModal.tsx` ~line 166-171
- Add image estimate (`Math.round(credits/5)`) and price-per-credit display below the credits pill.

## 6. UpgradeValueDrawer — No annual billing toggle
The drawer only shows monthly prices with no toggle, unlike the NoCreditsModal which now has one.

**File**: `src/components/app/UpgradeValueDrawer.tsx`
- Not explicitly required but inconsistent. Will skip unless you want it.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/PlanCard.tsx` | Fix CTA variant: `default` for upgrades, `outline` for downgrades, `secondary` for current |
| `src/components/landing/LandingPricing.tsx` | Add price-per-credit line below image estimate |
| `src/pages/AppPricing.tsx` | Use `useIsMobile()` hook; add NEW badge to Brand Models in accordion |
| `src/components/app/NoCreditsModal.tsx` | Add ~images estimate + price-per-credit to plan cards |

