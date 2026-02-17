

## Fix Pricing Display Issues in Buy Credits Modal

### Problems Identified

1. **Wrong image estimates in features**: Starter shows "~50 images/mo" in features but the hero metric correctly shows "~100 images/mo" (500 credits / 5). Same issue for Growth ("~150" vs correct "~300") and Pro ("~450" vs correct "~900"). The features list uses a 1:10 ratio while the modal hero metric correctly uses 1:5.

2. **Redundant image info**: The modal already calculates and displays image estimates as the hero metric (e.g., "~100 images/mo" with "500 credits/mo" below). The first feature line duplicates this with incorrect values.

3. **"Current" badge overflow**: When "MOST POPULAR" and "CURRENT" badges appear on the same row as the plan name (Growth), they overflow the card width.

4. **"SAVE 17%" not visible**: When Annual is selected, the toggle button has a green/primary background, and the "SAVE 17%" badge uses green text on a green-tinted background -- nearly invisible against the active state.

---

### Fix 1: Remove redundant image-count features from plan data

**File**: `src/data/mockData.ts`

Remove the first feature (image estimate) from Starter, Growth, and Pro plans since the modal already shows this as a calculated hero metric. Replace with a meaningful differentiating feature.

| Plan | Remove | Replace With |
|---|---|---|
| Starter | `~50 images/mo` | `Standard quality` |
| Growth | `~150 images/mo` | `High quality default` |
| Pro | `~450 images/mo` | `Highest quality default` |

This eliminates the redundancy and the incorrect numbers in one step.

### Fix 2: Fix "Current" badge overflow

**File**: `src/components/app/BuyCreditsModal.tsx`

Change the badge row to wrap instead of overflow:

```typescript
<div className="flex items-center gap-2 mb-3 flex-wrap">
```

### Fix 3: Fix "SAVE 17%" visibility

**File**: `src/components/app/BuyCreditsModal.tsx`

When Annual is the active (selected) toggle, the badge colors blend into the primary background. Change the badge to use white/contrast colors when inside the active state:

```typescript
<span className="inline-flex rounded-full bg-white/25 text-white text-[9px] font-bold px-1.5 py-0.5 leading-none">
  SAVE 17%
</span>
```

### Fix 4: Also fix the Landing page pricing

**File**: `src/components/landing/LandingPricing.tsx`

The landing page reads the same features from `pricingPlans` and also independently calculates `credits / 10` for a secondary line. Update that calculation to use `/5` to match the corrected ratio:

```typescript
// Line ~82: change from /10 to /5
Math.round(plan.credits / 10)  -->  Math.round(plan.credits / 5)
```

---

### Files Modified

| File | Change |
|---|---|
| `src/data/mockData.ts` | Remove redundant image-count features from Starter, Growth, Pro |
| `src/components/app/BuyCreditsModal.tsx` | Add `flex-wrap` to badge row; fix SAVE 17% badge contrast |
| `src/components/landing/LandingPricing.tsx` | Fix image estimate ratio from `/10` to `/5` |

