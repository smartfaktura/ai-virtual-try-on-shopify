

# Polish Pricing Popup — Sharpen Hierarchy & Reduce Friction

Both `NoCreditsModal.tsx` (FreePlanSection) and `BuyCreditsModal.tsx` (Plans tab) need the same refinements. The screenshot is from BuyCreditsModal but the changes apply to both modals' plan card layouts.

## Changes

### 1. Both modals — New plan card structure (deduplicated, tighter)

Replace the current card content (which shows credits/images twice — once as metrics and again as bullets) with a cleaner layout:

**Per card:**
- Plan name + descriptor line (e.g. "Best to start" / "Best value for growing brands" / "Best for high-volume production")
- Price block
- Metrics block: images/mo, credits/mo, price-per-credit with value label ("Better than Free" / "Better value" / "Best value")
- Only 2 differentiating bullets (not the repeated credits/images/price ones):
  - Starter: Bulk generations, Up to 100 products
  - Growth: Faster generation queue, Brand Models NEW
  - Pro: Fastest generation queue, Brand Models NEW
- CTA with varied labels: "Start with Starter" / "Get Growth" / "Choose Pro"

### 2. Growth card — visually stronger
- Slightly darker border (`border-primary` instead of `border-primary/60`)
- Subtle tinted background (`bg-primary/[0.03]`)
- Elevated shadow (`shadow-md shadow-primary/5`)
- "Most Popular" badge already exists — keep it

### 3. Header improvements

**BuyCreditsModal** (free user on Plans tab):
- Add contextual line below the balance header: "Pick a plan to keep creating with better value as you scale"

**NoCreditsModal** FreePlanSection:
- Already has headline. Add a subtitle: "Better value as you scale — all plans include 1,000+ scenes"

### 4. Reassurance line at bottom
Add below plan cards in both modals:
> "All paid plans include product visuals, freestyle creation, and 1,000+ scenes"

With "Compare all features" and "Contact Sales" links.

### 5. Vertical rhythm cleanup
- More top padding inside cards (`pt-6`)
- Tighten space between price and metrics
- Increase space before CTA (`mt-auto` already, but add `pt-3` separator)
- Align CTA buttons at same vertical baseline via `flex-col` with `flex-1` on content area

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/NoCreditsModal.tsx` | Rewrite `FreePlanSection` cards: deduplicate bullets, add descriptor, value labels, varied CTAs, Growth visual emphasis, reassurance footer |
| `src/components/app/BuyCreditsModal.tsx` | Rewrite Plans tab cards with same structure; add contextual subtitle for free users; add reassurance line; improve Growth card styling |

## Constants (shared across both files)

```typescript
const PLAN_DESCRIPTORS: Record<string, string> = {
  starter: 'Best to start',
  growth: 'Best value for growing brands',
  pro: 'Best for high-volume production',
};

const PLAN_VALUE_LABELS: Record<string, string> = {
  starter: 'Better than Free',
  growth: 'Better value',
  pro: 'Best value',
};

const PLAN_CTA_LABELS: Record<string, string> = {
  starter: 'Start with Starter',
  growth: 'Get Growth',
  pro: 'Choose Pro',
};

const PLAN_DIFFERENTIATORS: Record<string, { text: string; badge?: string }[]> = {
  starter: [
    { text: 'Bulk generations' },
    { text: 'Up to 100 products' },
  ],
  growth: [
    { text: 'Faster generation queue' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
  pro: [
    { text: 'Fastest generation queue' },
    { text: 'Brand Models', badge: 'NEW' },
  ],
};
```

