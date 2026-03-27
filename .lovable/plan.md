

# Add Brand Models & Video Generation to Pricing Plans

## Changes

### 1. Update `PricingPlan` type (`src/types/index.ts`)
- Change `features` from `string[]` to `Array<string | { text: string; badge?: string }>` to support feature labels like "NEW"

### 2. Update `pricingPlans` data (`src/data/mockData.ts`)

**Growth plan** — add `{ text: 'Brand Models', badge: 'NEW' }` to features
**Pro plan** — add `{ text: 'Brand Models', badge: 'NEW' }` to features, change `'Video Generation (coming soon)'` to `'Video Generation'`
**All plans (Free, Starter, Growth, Pro)** — add `'Video Generation'` to features (since user wants it on all workflows)

### 3. Update `PlanCard` rendering (`src/components/app/PlanCard.tsx`)
- In the features `.map()`, handle both string and object features:
  ```tsx
  {typeof feature === 'string' ? feature : (
    <span className="flex items-center gap-1.5">
      {feature.text}
      {feature.badge && (
        <Badge className="text-[9px] px-1.5 py-0 bg-primary/15 text-primary">
          {feature.badge}
        </Badge>
      )}
    </span>
  )}
  ```

### 4. Update `LandingPricing` if it renders features independently
- Apply the same string/object feature rendering logic

This ensures both `/pricing` and the homepage pricing section stay in sync since they share the same `pricingPlans` data source.

