

# Move Sports After Fragrances in Discover Tabs

## Change
Reorder the `CATEGORIES` array in all 3 Discover files so Sports comes right after Fragrances.

**New order:** All → Fashion → Beauty → Fragrances → **Sports** → Jewelry → Accessories → Home → Food & Drink → Electronics → Health

## Files
- `src/pages/Discover.tsx` (line 26-38)
- `src/pages/PublicDiscover.tsx` (line 46-58)
- `src/components/app/DashboardDiscoverSection.tsx` (line 16-28)

Same change in each: move `{ id: 'sports', label: 'Sports' }` from position 9 to position 4 (after Fragrances).

