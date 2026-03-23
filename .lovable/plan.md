

# Dashboard Layout Adjustment

## What You Want

```text
Welcome back, Tomas 👋
{dynamic headline}
[ ✨ Start a Campaign ]
Virtual Try-On · Product Editorial · Catalog Generation

--- separate section below ---

Personalized for [Fashion & Apparel ▾]   |   [Upload Product] [Generate Images] [Browse Workflows] [Brand Profiles]
```

## Changes

### 1. `src/lib/categoryConstants.ts` - Update headlines with `-` not `—`

All headlines become: "Create/Launch your first [category] campaign in seconds - no photoshoot needed."

### 2. `src/components/app/DashboardPersonalizationHero.tsx` - Slim down to just headline + CTA

Remove the "Personalized for" pill from this component. Keep only:
- Dynamic headline text
- "Start a Campaign" button (navigates to `/app/workflows`)
- Helper text: `Virtual Try-On · Product Editorial · Catalog Generation`

### 3. `src/pages/Dashboard.tsx` - Restructure layout

Move quick actions and "Personalized for" pill into their own row below the header section:

```tsx
{/* Header section */}
<div>
  <h1>Welcome back, {firstName} 👋</h1>
  <DashboardPersonalizationHero />  {/* headline + CTA only */}
</div>

{/* Separate row: Personalized pill + Quick Actions */}
<div className="flex flex-wrap items-center gap-4">
  <PersonalizedForPill />  {/* extracted pill selector */}
  <DashboardQuickActions />
</div>
```

The "Personalized for" pill selector will be extracted into a small inline component (or kept in `DashboardPersonalizationHero` and exported separately). It will sit on the same line as the quick action buttons, visually separated.

### Files
- `src/lib/categoryConstants.ts` - update headline strings
- `src/components/app/DashboardPersonalizationHero.tsx` - remove pill, add CTA, export pill separately
- `src/pages/Dashboard.tsx` - restructure: header block, then pill + quick actions row below

