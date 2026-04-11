

# Move Earn Credits, Brand Profiles & Settings into User Menu

## What Changes

**File: `src/components/app/AppShell.tsx`**

1. **Remove from sidebar nav:**
   - Remove `{ label: 'Earn Credits', icon: Gift, path: '#earn-credits' }` from `navItems`
   - Remove the entire `configItems` array and its "Configuration" header + render block (lines ~64-67, ~215-221)

2. **Add to user dropdown menu** (the popup that appears when clicking the user avatar at the bottom):
   - Add "Brand Profiles" button (Palette icon) → navigates to `/app/brand-profiles`
   - Add "Earn Credits" button (Gift icon) → opens `earnCreditsOpen` modal
   - Keep existing "Account settings" button (already there)
   - Order: Account settings → Brand Profiles → Earn Credits → (admin items) → Sign out

This keeps all three features one click away via the person menu, while shortening the sidebar by 3 items + 1 section header.

## Files Changed

1. **`src/components/app/AppShell.tsx`** — remove items from sidebar, add buttons to user dropdown

