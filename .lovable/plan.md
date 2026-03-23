

# Dashboard Discover: 4:3 Cards, 3 Rows, Personalized Default, Repositioned

## Summary
- Show discover images in 4:3 aspect ratio (landscape) on the grid; detail modal keeps original size
- Show 3 rows of items: 15 on desktop (5x3), 16 on mobile (2x8 rows)
- Personalize default category based on user's onboarding `product_categories` preference
- Move Discover section right after "Get Started" (new user) / right after metrics (returning user)
- Rename section to "Find & Recreate"

## Changes

### 1. `src/components/app/DiscoverCard.tsx`

Add optional `aspectRatioOverride` prop. When provided, use it instead of the hardcoded `"3/4"` on `ShimmerImage`:

```tsx
interface DiscoverCardProps {
  // ...existing
  aspectRatioOverride?: string;
}
```

Pass `aspectRatio={aspectRatioOverride ?? "3/4"}` to `ShimmerImage`. The dashboard will pass `"4/3"` while the full Discover page keeps the default portrait ratio.

### 2. `src/components/app/DashboardDiscoverSection.tsx`

**Rename title**: "Discover" → "Find & Recreate"

**Item count**: Change `.slice(0, 10)` → `.slice(0, 16)` so we get 3 full rows on desktop (5x3=15, 16th hidden by grid) and 8 rows on mobile (2x8=16).

**Grid**: Keep `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2`.

**Pass `aspectRatioOverride="4/3"`** to each `DiscoverCard` so images render landscape in the dashboard grid.

**Personalized default category**: Fetch user's `product_categories` from the profiles table and default `selectedCategory` to their first preference instead of `'all'`:

```tsx
const { user } = useAuth();
const { data: profile } = useQuery({
  queryKey: ['dashboard-profile-cats', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('product_categories')
      .eq('user_id', user!.id)
      .maybeSingle();
    return data;
  },
  enabled: !!user,
  staleTime: 10 * 60 * 1000,
});

// Set initial category from user preference
const defaultCategory = useMemo(() => {
  const cats = profile?.product_categories as string[] | null;
  if (cats?.length && cats[0] !== 'any') {
    const match = CATEGORIES.find(c => c.id === cats[0]);
    if (match) return match.id;
  }
  return 'all';
}, [profile]);

const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const activeCategory = selectedCategory ?? defaultCategory;
```

### 3. `src/pages/Dashboard.tsx`

**New user view**: Move `<DashboardDiscoverSection />` from after "Explore Workflows" (line 392) to right after the "Get Started" `OnboardingChecklist` section (after line 324).

**Returning user view**: Move `<DashboardDiscoverSection />` from after "Create" (line 524) to right after `<LowCreditsBanner />` and metrics row (after line 481), before `<RecentCreationsGallery />`.

### Files
- `src/components/app/DiscoverCard.tsx` — add `aspectRatioOverride` prop
- `src/components/app/DashboardDiscoverSection.tsx` — rename to "Find & Recreate", 16 items, pass 4:3 ratio, personalized default category
- `src/pages/Dashboard.tsx` — reposition section in both views

