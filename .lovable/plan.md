

# Add "Your Plan" Card + Manage Button for Pro Users

## Problem
Pro users see top-up packs and enterprise CTA, but there's no indication of their current plan details or a way to manage it from the modal.

## Fix

### File: `src/components/app/BuyCreditsModal.tsx`

Add a compact "Your Plan" card between the top-up packs and the Enterprise CTA for Pro users (and also for Starter/Growth paid users). This card shows:

- Plan name + badge
- Monthly credits allocation
- Billing interval (monthly/annual)
- "Manage Plan" button linking to `/app/settings`

**Location**: After the top-up grid (line ~294), before the Enterprise CTA (line ~297), insert a new section visible to all paid users:

```
┌─────────────────────────────────────────┐
│ PRO  Your Plan                          │
│ 4,500 credits/mo · Billed monthly       │
│                         [Manage Plan →] │
└─────────────────────────────────────────┘
```

The "Manage Plan" button calls `handleViewAllPlans()` (already exists on line 122-125) which closes the modal and navigates to `/app/settings`.

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/BuyCreditsModal.tsx` | Add "Your Plan" card with manage button between top-up packs and enterprise CTA for paid users |

