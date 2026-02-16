

## Redesign Buy Credits Modal with CRO Best Practices

### Overview

Redesign the Buy Credits modal to maximize annual subscription conversions, show clear value per plan, update feature lists to match the agreed gating strategy, and apply conversion rate optimization techniques.

### Agreed Feature Gating

| Feature | Free | Starter | Growth | Pro |
|---|---|---|---|---|
| All generation workflows | Yes | Yes | Yes | Yes |
| Freestyle Studio | Yes | Yes | Yes | Yes |
| Virtual Try-On | Yes | Yes | Yes | Yes |
| Bulk Generation | Yes | Yes | Yes | Yes |
| High Quality (Pro Model) | Yes | Yes | Yes | Yes |
| Video Generation | -- | -- | -- | Yes |
| Creative Drops | -- | -- | -- | Yes |
| Brand Profiles | 1 | 3 | 10 | Unlimited |
| Product Library | 5 | 25 | 100 | Unlimited |
| Priority Queue | -- | -- | Yes | Yes |
| API Access | -- | -- | -- | -- |

### CRO Changes to BuyCreditsModal

**1. Default to Annual billing**
- Change initial state from `'monthly'` to `'annual'`
- Users see the cheaper price first; those who want monthly will switch

**2. Savings anchoring**
- When annual is selected, show crossed-out monthly price: `~~$39~~ $31/mo`
- Add a savings callout line under the toggle: "You're saving up to 17% with annual billing" in primary color
- When monthly is selected, show nudge: "Switch to annual and save up to 17%"

**3. Per-credit cost on plan cards**
- Show `X.X cents/credit` below the price to make subscription value obvious vs top-up packs (which are 4.6-7.5 cents/credit)
- Starter annual: 6.2 cents/credit, Growth annual: 4.2 cents/credit, Pro annual: 3.2 cents/credit -- clearly better than any top-up

**4. Value-oriented features**
- Replace redundant "X credits/month" first feature with concrete image estimate: "~50 images/mo"
- Replace generic feature lists with what differentiates each tier (see data changes below)

**5. Improved CTAs**
- "Get Starter", "Get Growth", "Get Pro" instead of generic "Upgrade"/"Downgrade"
- Current plan still shows "Current Plan" (disabled)

**6. Top Up tab nudge**
- Add a subtle banner above packs: "Subscriptions start at 6.2 cents/credit -- lower than any top-up" with a "View Plans" link that switches tab
- Change pack CTA from "Purchase" to "Add 200 Credits", "Add 500 Credits", etc.

---

### Data Changes (src/data/mockData.ts)

Update feature arrays to reflect agreed gating and lead with value:

**Free:**
```
- '20 credits (one-time bonus)'
- 'All workflows'
- '1 Brand Profile'
- '5 products'
- 'Community support'
```

**Starter ($39/mo):**
```
- '~50 images/mo'
- 'All workflows'
- '3 Brand Profiles'
- '25 products'
- 'Email support'
```

**Growth ($79/mo):**
```
- '~150 images/mo'
- 'Priority queue'
- '10 Brand Profiles'
- '100 products'
- 'Priority support'
```

**Pro ($179/mo):**
```
- '~450 images/mo'
- 'Video Generation'
- 'Creative Drops'
- 'Priority queue'
- 'Unlimited Brand Profiles and products'
- 'Dedicated support'
```

---

### Modal UI Changes (src/components/app/BuyCreditsModal.tsx)

**Balance header**: Keep as-is (already clean).

**Billing toggle**: 
- Default to annual
- Add dynamic savings text below toggle

**Plan cards**: 
- Add crossed-out monthly price when annual selected
- Add per-credit cost line
- Replace first feature with image estimate
- Update CTA labels to "Get [PlanName]"

**Top Up tab**:
- Add subscription nudge banner at top
- Change CTA text to "Add X Credits"

---

### Files Modified

| File | Changes |
|---|---|
| `src/data/mockData.ts` | Update feature arrays for all plans to match agreed gating |
| `src/components/app/BuyCreditsModal.tsx` | Default annual, savings anchor, crossed-out prices, per-credit cost, improved CTAs, top-up nudge banner |

### CRO Principles Applied

- **Anchoring**: Annual is the default; monthly is the "expensive" option shown with strikethrough
- **Loss aversion**: "Save $X/yr" makes switching to monthly feel costly
- **Value framing**: "~50 images/mo" is more tangible than "500 credits/mo"
- **Social proof**: "Most Popular" badge on Growth stays
- **Specificity**: Per-credit cost comparison makes subscriptions clearly superior to top-ups
- **Action-oriented CTAs**: "Get Growth" is more decisive than "Upgrade"
- **Cross-sell**: Top-up tab nudges toward subscriptions with concrete cost comparison

