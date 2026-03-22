

# Update Onboarding: New Categories, Reorder Steps, Improve Copy

## Changes

### File: `src/pages/Onboarding.tsx`

**1. Update `PRODUCT_CATEGORIES` array (lines 28-37)**

Replace with 11 new categories:
```typescript
const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'supplements', label: 'Health & Supplements' },
  { id: 'any', label: 'Any Product' },
];
```

**2. Swap step 2 and step 3 order**

Currently: Step 1 (Profile) → Step 2 (Referral) → Step 3 (Categories)

New order: Step 1 (Profile) → Step 2 (Categories) → Step 3 (Referral / "How did you find us?")

Swap the JSX blocks for step 2 and step 3, and update the `canProceed()` logic accordingly. Categories become step 2, referral becomes step 3 (last question before "Get Started").

**3. Update subtitle copy (categories step)**

Change `"Select all that apply — this helps us personalize your experience"` to something like:
`"Pick the categories you work with — we'll tailor your dashboard and recommendations"`

This makes it clearer what the personalization does.

## Summary
- 1 file changed
- 11 categories replacing 8
- Steps reordered so "How did you find us?" is last
- Better subtitle copy for the categories step

