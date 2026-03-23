

# Team Carousel: Static Avatars, Bigger, Less Spacing, Move After Workflows

## Changes

### 1. `src/components/app/DashboardTeamCarousel.tsx`

- **Remove video loading** — always render `<img>` instead of `<video>`, using the static avatar for every member
- **Bigger avatars** — increase from `w-16 h-16 sm:w-20 sm:h-20` to `w-20 h-20 sm:w-24 sm:h-24`
- **Less spacing** — reduce gap from `gap-6` to `gap-4`, reduce card width from `w-[100px] sm:w-[120px]` to `w-[90px] sm:w-[110px]`
- **Reduce section spacing** — `space-y-4` → `space-y-3`

### 2. `src/pages/Dashboard.tsx`

**Move `<DashboardTeamCarousel />` from before workflows to after workflows** in both the new-user and returning-user views:

- **New user (line 328-329)**: Remove from current position (before "Two Ways to Create"). Place it after the "Explore Workflows" section (after line 391), before `<FeedbackBanner />`.
- **Returning user (line 482-483)**: Remove from current position (before "Create"). Place it after the "Create" section (after line 520), before "Recent Jobs".

### Files
- `src/components/app/DashboardTeamCarousel.tsx` — static images only, bigger avatars, tighter spacing
- `src/pages/Dashboard.tsx` — reorder sections in both views

