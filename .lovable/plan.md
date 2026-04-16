

# Layer 3 Modal — Unified for All Users with Personalized Copy

## Current problem
- Free users get **redirected** to a generic `BuyCreditsModal` — the personalized L3 headline ("Build your full fashion visual set") and subline ("You've created 3 images so far…") are never shown
- Admin preview for "Free User" also triggers the redirect, making it impossible to preview
- Paid users see the L3 copy but the modal could be more compelling

## Changes — `NoCreditsModal.tsx`

### 1. Remove free-user redirect
Delete the `useEffect` that calls `openBuyModal()` and the `if (isFree) return null` guard. All users now see the same modal with the personalized L3 header.

### 2. Conditional content body
- **Free users** → Show 3 subscription plan cards (Starter / Growth / Pro) using `pricingPlans` data. Each card: plan name, price, credits count, CTA button. Growth highlighted as recommended.
- **Paid users** → Keep the existing credit top-up packs grid (no change)

### 3. Layout

```text
┌─────────────────────────────────────────────┐
│  ✦  Build your full fashion visual set      │  ← L3 headline (category-aware)
│  You've created 3 images so far. Brands...  │  ← L3 subline (generation-aware)
├─────────────────────────────────────────────┤
│  [Starter $39]  [Growth $79★]  [Pro $179]   │  ← Free users: plan cards
│   500 credits    1,500 credits  4,500 creds  │
│   [Get Starter]  [Get Growth]  [Get Pro]     │
│                                             │
│  ── OR for paid users: ──                   │
│  [100 credits]  [500 credits★]  [1000 creds]│  ← Credit top-up packs
├─────────────────────────────────────────────┤
│  ⚡ Upgrade to Growth for 3× more credits   │  ← Upgrade nudge (starter/growth only)
├─────────────────────────────────────────────┤
│                            [Maybe Later]     │
└─────────────────────────────────────────────┘
```

### 4. Admin preview fix
No changes needed in `AdminConversion.tsx` — removing the redirect means the "Free User" dropdown naturally renders the modal with plan cards.

## Single file change
`src/components/app/NoCreditsModal.tsx`

