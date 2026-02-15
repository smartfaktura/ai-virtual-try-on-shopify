

## Creative Drops -- Rich Onboarding Empty State

Replace the plain "No schedules yet" card with an engaging, informative onboarding section that explains what Creative Drops is, why it's valuable, and guides the user to create their first schedule.

---

### What Changes

**When user has zero schedules**, instead of the current basic empty state card, show a full onboarding hero section with:

1. **Hero headline and subtitle** -- "Automate Your Visual Content" with a short value prop explaining recurring, hands-off image generation.

2. **Three animated step cards** -- Horizontal row (stacks on mobile) showing the 3-step process:
   - Step 1: "Pick Your Products" -- Select which products get fresh visuals
   - Step 2: "Choose Workflows" -- Pick generation styles (product listing, lifestyle, UGC, etc.)
   - Step 3: "Set & Forget" -- Schedule frequency, and images arrive automatically

   Each card has a numbered circle, icon, title, and short description. Cards use a subtle entrance animation (fade-in + slide-up with staggered delay via CSS).

3. **Benefit chips** -- A row of 3-4 small benefit badges below the steps: "Save 10+ hours/month", "Always-fresh content", "Multi-platform formats", "Brand-consistent"

4. **Primary CTA** -- A prominent "Create Your First Schedule" button that opens the wizard.

5. **The stats bar, tabs, and "Create Schedule" button inside the tab are hidden** when there are zero schedules AND zero drops -- the onboarding section replaces the entire tab area to avoid clutter.

---

### Technical Details

**File: `src/pages/CreativeDrops.tsx`**

- Add a new inline `CreativeDropsOnboarding` component (or section) rendered conditionally when `schedules.length === 0 && drops.length === 0`
- When this condition is true, skip rendering the stats bar and Tabs entirely; show only the onboarding section
- The onboarding section uses existing UI primitives (Card, Button, Badge) with Tailwind animations
- CTA calls `openWizard()` to open the schedule creation wizard
- Once the user creates their first schedule, the onboarding disappears and the normal tabs/stats view takes over

**Animation approach:**
- CSS keyframe animation using Tailwind's `animate-in` utilities already available from `tailwindcss-animate`
- Each step card gets a staggered `animation-delay` via inline style (0ms, 150ms, 300ms)
- Uses `fade-in-0 slide-in-from-bottom-4` classes from the existing tailwindcss-animate setup

**Step card structure:**
```
+---------------------------------------+
|  (1)  Package icon                    |
|  Pick Your Products                   |
|  Select which products get            |
|  fresh visuals each drop.             |
+---------------------------------------+
```

**Layout:**
- Full-width section with centered content, max-w-3xl
- Step cards in a `grid grid-cols-1 sm:grid-cols-3 gap-4`
- Benefit badges in a `flex flex-wrap justify-center gap-2`
- CTA button large size, centered

**No new files created** -- everything is added inline within `CreativeDrops.tsx` since it's page-specific and self-contained.
