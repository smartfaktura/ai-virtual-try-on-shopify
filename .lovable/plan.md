

## Dashboard Polish: AI Team Carousel, Navigation Fix, Credits Fix, Workflow Images

### Issues Identified

1. **Sidebar nav text is nearly invisible** -- inactive items use `text-white/40` which is too dim on the dark (`#0F172A`) sidebar. Hard to read.
2. **Credits show in red** -- the balance (5) uses `text-destructive` because `isEmpty` is `false` but the balance is below the `CRITICAL_THRESHOLD` of 10, triggering the red state. This looks alarming for a new user with starter credits.
3. **Workflow cards use emojis** -- the WorkflowCard has a `workflowIcons` map with emojis like `📢`, `🏷️`, `📱`. These need to be replaced with actual thumbnail images.
4. **No AI Team presence in dashboard** -- the 10 AI team members (Sophia, Amara, Kenji, etc.) only exist on the landing page. Adding them to the dashboard creates brand continuity.

---

### Changes (5 files)

#### 1. Sidebar Navigation Readability (AppShell.tsx)

Fix the dim text problem:
- **Inactive items**: Change from `text-white/40` to `text-white/60` -- significantly more readable while still clearly subordinate to the active state
- **Active items**: Keep `bg-white/[0.1] text-white` (already good)
- **Section labels** ("MAIN", "CONFIGURATION"): Change from `text-sidebar-foreground/25` to `text-sidebar-foreground/35` -- slightly more visible
- **Hover state**: Change from `hover:text-white/70` to `hover:text-white/80` for better feedback

#### 2. Credit Indicator Color Fix (CreditIndicator.tsx)

The credit display shows red because 5 credits is below `CRITICAL_THRESHOLD` (10). Fix the color logic:
- **Default/healthy state**: Use `text-sidebar-foreground` (white) -- clean, no color coding
- **Low state** (below 50): Use `text-amber-400` -- a gentle amber warning
- **Critical state** (below 10): Use `text-amber-300` -- still amber, not red. Red is only for truly empty.
- **Empty state** (0 credits): Keep `text-destructive` (red) -- appropriate only when zero

This way 5 credits shows as amber (gentle nudge) not alarming red.

#### 3. AI Team Carousel for Dashboard (new component: DashboardTeamCarousel.tsx)

Create a compact, horizontal scrolling strip of the AI team members that reuses the same data from `StudioTeamSection`. This is a dashboard-appropriate version -- smaller cards, no large portraits.

Design:
- Small circular avatar (w-12 h-12) with name and role below
- Horizontal scrolling strip with `overflow-x-auto` and `snap-x`
- Each card is a compact column: circle avatar, name (font-semibold text-sm), role (text-xs text-muted-foreground)
- Cards are ~100px wide, showing about 6-7 at once on desktop
- Subtle fade edges on left/right to indicate scrollability
- No navigation arrows needed -- this is a compact strip, not a full carousel

The section heading will be "Your AI Studio Team" with a subtitle like "10 specialists working on every visual you create."

#### 4. Dashboard Layout Integration (Dashboard.tsx)

Add the AI Team carousel after the "Get Started" section in the first-run dashboard:

```
Welcome
  |
Get Started (Onboarding Checklist)
  |
Your AI Studio Team (NEW - compact carousel)
  |
Two Ways to Create
  |
Explore Workflows
```

For the returning user dashboard, place it after the "Quick Create" section and before "Recent Jobs."

#### 5. Workflow Cards with Images Instead of Emojis (WorkflowCard.tsx)

Replace the emoji icons with actual product photography thumbnails from the existing assets:

Map workflow names to showcase/template images:
- "Ad Refresh Set" -> `fashion-blazer-street.jpg` (diverse ad-ready look)
- "Product Listing Set" -> `skincare-serum-marble.jpg` (clean e-commerce)
- "Website Hero Set" -> `fashion-dress-botanical.jpg` (hero-worthy)
- "Lifestyle Set" -> `home-candle-evening.jpg` (lifestyle mood)
- "On-Model Set" -> `fashion-activewear-studio.jpg` (model shoot)
- "Social Media Pack" -> `food-coffee-artisan.jpg` (social-ready)

Design change:
- Remove the emoji `<span>` entirely
- Add a small rounded thumbnail (w-10 h-10 or w-12 h-12, `rounded-lg`, `object-cover`) in its place
- Keep the existing card layout otherwise -- the image replaces the emoji in the same position
- Add a fallback for unknown workflow names using `universal-clean.jpg`

---

### Summary Table

| File | What Changes |
|---|---|
| `src/components/app/AppShell.tsx` | Sidebar nav text: `white/40` to `white/60`, section labels to `/35`, hover to `/80` |
| `src/components/app/CreditIndicator.tsx` | Critical state uses amber instead of red; red only when balance is exactly 0 |
| `src/components/app/DashboardTeamCarousel.tsx` | NEW -- compact horizontal avatar strip of 10 AI team members |
| `src/pages/Dashboard.tsx` | Add DashboardTeamCarousel after onboarding (first-run) and after Quick Create (returning) |
| `src/components/app/WorkflowCard.tsx` | Replace emoji icons with actual product photography thumbnails from assets |

