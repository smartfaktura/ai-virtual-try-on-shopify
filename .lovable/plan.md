

# Add "Lifestyle" Category After Beauty in Discover Tabs

## Change
Add `{ id: 'lifestyle', label: 'Lifestyle' }` after Beauty in the `CATEGORIES` array in all 3 Discover files.

**New order:** All → Fashion → Beauty → **Lifestyle** → Fragrances → Sports → Jewelry → Accessories → Home → Food & Drink → Electronics → Health

## Files
- `src/pages/Discover.tsx`
- `src/pages/PublicDiscover.tsx`
- `src/components/app/DashboardDiscoverSection.tsx`

Insert `{ id: 'lifestyle', label: 'Lifestyle' }` at index 3 (after Beauty, before Fragrances) in each file's `CATEGORIES` constant.

