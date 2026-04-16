

# Pricing Update — Text, CTAs, New Badge, and New `/app/pricing` Page

## Summary

Update plan feature text and CTA wording across all pricing surfaces (mockData, NoCreditsModal, BuyCreditsModal, UpgradeValueDrawer, LandingPricing, Settings, PlanCard). Add a new detailed `/app/pricing` page with comparison table, accordions, and mobile-first layout.

---

## 1. Update Plan Feature Text (`src/data/mockData.ts`)

Replace all `features` arrays with the new bullet sets:

| Plan | New Features |
|------|-------------|
| **Free** | `20 credits / month`, `~4 images`, `1000+ scenes`, `Freestyle creation`, `Up to 5 products` |
| **Starter** | `500 credits / month`, `~100 images`, `$0.078 per credit`, `Bulk generations`, `Up to 100 products` |
| **Growth** | `1,500 credits / month`, `~300 images`, `$0.053 per credit`, `Faster generation queue`, `{text: 'Brand Models', badge: 'NEW'}` |
| **Pro** | `4,500 credits / month`, `~900 images`, `$0.040 per credit`, `Fastest generation queue`, `{text: 'Brand Models', badge: 'NEW'}` |
| **Enterprise** | `Custom credit volume`, `Dedicated support`, `Custom integrations`, `Custom shot generation`, `Automated workflows` |

Also update `ctaText` values:
- Free → `Get Started Free`
- Starter → `Choose Starter`
- Growth → `Choose Growth`
- Pro → `Choose Pro`
- Enterprise → `Contact Sales`

## 2. Update CTA Wording Across Components

### `NoCreditsModal.tsx`
- Add subline under header: "Unlock more credits to keep creating"
- Change CTA buttons from `p.ctaText` to `Choose {plan.name}`
- Growth shown with "Most Popular" emphasis (already highlighted)

### `BuyCreditsModal.tsx` (Plans tab)
- CTA labels: use `Choose {name}` for higher plans, `Downgrade to {name}` for lower, `Current Plan` for current
- Footer: keep "Need more? Contact Sales"

### `UpgradeValueDrawer.tsx`
- CTA: `Choose {name}` for recommended, `Start with {name}` for others

### `LandingPricing.tsx`
- Logged-out CTAs use new `ctaText` from data (already wired)
- Logged-in: `Upgrade to {name}` / `Downgrade to {name}` / `Current Plan` (already correct)

### `PlanCard.tsx` (Settings)
- Already uses upgrade/downgrade logic — no change needed beyond data update

### `Settings.tsx`
- Add subtle intro line under "Choose Your Plan": `"Built for ongoing brand-ready visual production"`

## 3. Update Modal Feature Lists

### `NoCreditsModal.tsx` — `MODAL_PLAN_FEATURES`
```
starter: ['$0.078 per credit', 'Up to 100 products']
growth:  ['$0.053 per credit', {text: 'Brand Models', badge: 'NEW'}]
pro:     ['$0.040 per credit', 'Unlimited products & profiles']
```
(Already matches — no change needed)

### `UpgradeValueDrawer.tsx` — `DRAWER_PLAN_FEATURES`
Same content — already matches. No change.

## 4. New Page: `/app/pricing`

Create `src/pages/AppPricing.tsx` — a detailed pricing breakdown page for logged-in users.

### Structure:
1. **Header**: "Choose the right plan for your visual production" + subtext about credits
2. **Billing toggle**: Monthly / Annual with save badge
3. **Short plan cards** (reuse `PlanCard` component in compact mode)
4. **Value comparison strip**: horizontal table showing Plan / Credits / Images / Price per credit
5. **Expandable detailed features**: Accordion per plan with full feature list (scenes, freestyle, bulk, queue, brand models, video, upscale, product limits)
6. **Enterprise section**: "Need more scale?" with Contact Sales CTA
7. **Dynamic personalization**: Subtle intro line based on user context, fallback to generic

### Mobile behavior:
- Cards stack vertically
- Growth shown first (reorder array)
- Full-width CTA buttons
- Accordion comparison instead of table
- Max 3 bullets on compact cards, expandable for detail

### Routing:
- Add `<Route path="/pricing" element={<AppPricing />} />` inside protected `/app/*` routes in `App.tsx`
- Lazy import the component

## 5. Files Changed

| File | Change |
|------|--------|
| `src/data/mockData.ts` | Replace all plan features + ctaText |
| `src/components/app/NoCreditsModal.tsx` | Add subline, update CTA to "Choose {name}" |
| `src/components/app/BuyCreditsModal.tsx` | Update CTA labels to "Choose {name}" pattern |
| `src/components/app/UpgradeValueDrawer.tsx` | Update CTA text |
| `src/components/landing/LandingPricing.tsx` | Text updates flow from data — no structural changes |
| `src/pages/Settings.tsx` | Add intro line under "Choose Your Plan" |
| `src/pages/AppPricing.tsx` | **NEW** — Full detailed pricing page |
| `src/App.tsx` | Add route for `/app/pricing` |

## 6. Technical Notes

- **Price per credit**: Static values derived from `monthlyPrice / credits` — already calculated inline in BuyCreditsModal
- **Image estimate**: `credits / 5` (≈5 credits per image) — already used in BuyCreditsModal and LandingPricing
- **Brand Models availability**: Growth + Pro plans (feature badge already in data)
- **Queue priority**: Text-only ("Faster" for Growth, "Fastest" for Pro)
- **Annual pricing**: 20% discount already baked into `annualPrice` field
- No database changes needed
- No new dependencies

