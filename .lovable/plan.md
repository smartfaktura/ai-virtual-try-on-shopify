

# Conversion-Optimized Pricing Popup — UX Copy & Reassurance

## Problem
The headline is generic marketing copy ("Unlock your visual potential") that doesn't match the user's mental state (they ran out of credits). CTAs are inconsistent across cards. No safety reassurance ("Cancel anytime") creates hesitation before clicking.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx`

**1. Header copy (lines 135-140)**
- Replace "Unlock your visual potential" → **"You're out of credits"**
- Replace "Pick a plan that fits your creative ambitions" → **"Choose a plan to keep creating"**
- Add a third line: `text-xs text-muted-foreground` — **"More credits = lower cost per image"**

**2. Growth descriptor (line 375)**
- Replace "Best value for growing brands" → **"Most popular for consistent content"**

**3. Consistent CTAs (lines 378-382)**
- `starter: 'Get Starter'`
- `growth: 'Get Growth'`
- `pro: 'Get Pro'`

**4. Add "Cancel anytime" reassurance (after line 509)**
- Insert before the "All paid plans include..." line:
- `text-xs text-muted-foreground font-medium` — **"Cancel anytime · No commitment"**

### File: `src/components/app/NoCreditsModal.tsx`

**5. Same descriptor + CTA updates (lines 23-38)**
- Growth descriptor → "Most popular for consistent content"
- CTAs → `Get Starter` / `Get Growth` / `Get Pro`

**6. Subtitle (line 78)**
- Replace "Pick a plan that fits your creative ambitions" → **"Choose a plan to keep creating"**

**7. Add "Cancel anytime" (after line 206)**
- Insert before "All paid plans include..." — **"Cancel anytime · No commitment"**

### File: `src/components/app/UpgradeValueDrawer.tsx`
- Same CTA label consistency if present

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Header copy, Growth descriptor, consistent CTAs, cancel reassurance |
| `NoCreditsModal.tsx` | Subtitle, Growth descriptor, consistent CTAs, cancel reassurance |
| `UpgradeValueDrawer.tsx` | Consistent CTAs if applicable |

