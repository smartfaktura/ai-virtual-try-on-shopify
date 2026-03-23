

# Dashboard Polish: Banner Placement, Earn Credits Button, Subtitle Sizing, Remove View All

## Changes

### 1. `src/components/app/DashboardDiscoverSection.tsx`
- **Remove "View all" button** (lines 217-221): Delete the entire `<div className="flex justify-center pt-2">` block with the View all button
- **Increase subtitle size**: Change `text-sm text-muted-foreground mt-0.5` → `text-base text-muted-foreground mt-1.5` on the subtitle "Click any visual to recreate it with your product."

### 2. `src/components/app/RecentCreationsGallery.tsx` (line 191)
- **Increase subtitle size**: Change `text-sm text-muted-foreground mt-0.5` → `text-base text-muted-foreground mt-1.5`

### 3. `src/components/app/DashboardTeamCarousel.tsx` (line 8)
- **Increase subtitle size**: Change `text-sm text-muted-foreground mt-1` → `text-base text-muted-foreground mt-1.5`

### 4. `src/pages/Dashboard.tsx`

**Move FeedbackBanner after Steal This Look (both views)**:

- **New user view** (line 400-401): Move `<FeedbackBanner />` from after DashboardTeamCarousel to right after `<DashboardDiscoverSection />` (after line 329)
- **Returning user view** (line 642-643): Move `<FeedbackBanner />` from end of page to right after `<DashboardDiscoverSection />` (after line 487)

**Add "Earn Credits" button to returning user's header buttons** (line 436-439): Add a 4th button after "My Library":
```tsx
<Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => setEarnCreditsOpen(true)}>
  <Gift className="w-3.5 h-3.5" />
  Earn Credits
</Button>
```

Also add `EarnCreditsModal` and `earnCreditsOpen` state + import `Gift` icon. Need to check if `EarnCreditsModal` is already imported/used.

**Add EarnCreditsModal state + component**: Add `const [earnCreditsOpen, setEarnCreditsOpen] = useState(false);` and render `<EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />` at the bottom of both views.

### Files
- `src/components/app/DashboardDiscoverSection.tsx` — remove View all, bigger subtitle
- `src/components/app/RecentCreationsGallery.tsx` — bigger subtitle
- `src/components/app/DashboardTeamCarousel.tsx` — bigger subtitle
- `src/pages/Dashboard.tsx` — move FeedbackBanner, add Earn Credits button + modal

