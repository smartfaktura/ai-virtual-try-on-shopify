

## Show All Plan Features in Buy Credits Modal

### Problem
The modal truncates features to 3 per plan (`p.features.slice(0, 3)`), so every plan looks identical — all showing the same "Batch generation, Freestyle, All Models & Scenes." The differentiating features (Try-On, Creative Drops, Video, product limits, Brand Profiles) are hidden.

### Solution

**`src/components/app/BuyCreditsModal.tsx`** (line 298) — One change:
- Remove `.slice(0, 3)` so all features render, matching the landing page

```tsx
// Before
{p.features.slice(0, 3).map((f, i) => (

// After
{p.features.map((f, i) => (
```

This will show 5–7 features per plan, making tier differentiation clear: Free (1 profile, 1 product) → Starter (Try-On, 3 profiles, 10 products) → Growth (Creative Drops, Priority queue, 100 products) → Pro (Video, Unlimited everything).

### Files changed
- `src/components/app/BuyCreditsModal.tsx` — remove `.slice(0, 3)` on features list

