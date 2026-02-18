

## Mobile-First Dashboard Optimization for New Users

### Problems (from screenshot)
1. **Onboarding checklist steps** are cramped on mobile -- text wraps awkwardly, titles break across lines ("Upload Your / First Product"), CTA buttons are squeezed alongside text
2. **Thumbnails hidden** on mobile (`hidden sm:block`) -- no visual interest in the steps
3. **"Two Ways to Create" cards** are text-heavy with no visual differentiation on mobile
4. **Workflow cards** use `aspect-[4/5]` which is very tall on mobile -- takes too much vertical space per card in single-column layout
5. **"What You Can Create" gallery** scrolls horizontally but items are small on mobile

### Plan

**1. Redesign OnboardingChecklist for mobile** (`src/components/app/OnboardingChecklist.tsx`)

Switch from a horizontal row layout to a **stacked vertical layout on mobile** for each step:
- Remove `hidden sm:block` from thumbnails -- show them on mobile too
- On mobile: stack vertically -- step number + title on top, description below, CTA button full-width at bottom
- Make the CTA button full-width on mobile (`w-full sm:w-auto`)
- Shorten CTA text on mobile (e.g. "Products" instead of "Go to Products") using responsive text or truncation
- Increase padding and spacing between steps for breathing room

**2. Improve "Two Ways to Create" for mobile** (`src/pages/Dashboard.tsx`)

- Add a small preview image or visual element (icon background with gradient) to each card for visual appeal on mobile
- Reduce description text length on mobile with `line-clamp-2`
- Add subtle gradient or colored accent to differentiate the two cards visually

**3. Optimize workflow cards for mobile** (`src/pages/Dashboard.tsx`)

- Change aspect ratio to `aspect-[3/4]` on mobile for less vertical consumption
- Ensure the animated thumbnails render properly at smaller sizes
- Make the "Create Set" button a proper touch target (min-h-[44px])

**4. Improve gallery for mobile** (`src/components/app/RecentCreationsGallery.tsx`)

- Increase card width on mobile from `w-[180px]` to `w-[160px]` (slightly smaller but showing more cards)
- This is already reasonable; minor tweaks only

### Technical Details

**File: `src/components/app/OnboardingChecklist.tsx`**
- Change step layout from `flex items-center gap-4` to `flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4`
- Remove `hidden sm:block` from thumbnail div -- always show preview images
- Make CTA button `w-full sm:w-auto` on mobile
- Add `text-left` alignment for mobile stacked layout
- Wrap title + description in a container that takes `flex-1 min-w-0`

**File: `src/pages/Dashboard.tsx`**
- In DashboardWorkflowCard: change `aspect-[4/5]` to `aspect-[4/3] sm:aspect-[4/5]` for shorter cards on mobile
- In "Two Ways to Create": keep the existing layout, just ensure buttons have `min-h-[44px]` touch targets
- Add responsive spacing: `space-y-6 sm:space-y-8` for the main container
- Ensure workflow card button has `min-h-[44px] rounded-xl` for premium mobile feel

