

# Pass Product Categories to Resend Audience

## Problem
Currently, when syncing contacts to the Resend audience (onboarding, settings, auth), the `product_categories` field is not included in the `properties` payload. This prevents segmenting email campaigns by category (e.g., "Fashion subscribers", "Beauty + Jewelry").

## Changes

### 1. `src/pages/Onboarding.tsx` (~line 109-114)
Add `product_categories` to the properties object:
```tsx
properties: {
  plan: 'free',
  credits_balance: 60,
  has_generated: false,
  signup_date: user.created_at || new Date().toISOString(),
  product_categories: selectedCategories.join(', '),
},
```

### 2. `src/pages/Settings.tsx` — two places

**Content Preferences save** (~line 70-82): After saving categories to the profile, also fire a Resend sync with the updated categories. This requires fetching the current `marketing_emails_opted_in` value to pass `opted_in`.

**Notification Settings save** (~line 196-208): Add `product_categories` by reading the `cats` state from `ContentPreferencesSection`. However, since `cats` lives in a separate component, the simpler approach is to fetch `product_categories` from the profile before syncing:
```tsx
properties: {
  plan,
  credits_balance: balance,
  has_generated: true,
  signup_date: user.created_at || new Date().toISOString(),
  product_categories: profileCategories.join(', '),
},
```

To keep it clean: add a small query in the Settings `handleSave` to fetch `product_categories` from the profile, then include it in properties.

### 3. `src/pages/Auth.tsx` (~lines 106-118, 125-137)
No change needed — at signup time, categories haven't been selected yet (that happens in onboarding).

## Notes
- Resend custom properties are strings, so arrays are joined with commas
- "any" category maps to "All Products" in the joined string for clarity
- No backend/edge function changes needed — `sync-resend-contact` already forwards `properties` as-is to the Resend API

