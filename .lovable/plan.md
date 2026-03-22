

# Premium Personalization Hero — Apple-Inspired Refinement

## Problem
The current hero has too much clutter (AI team line, duplicate CTAs, heavy spacing). It doesn't feel premium.

## Changes

### File: `src/components/app/DashboardPersonalizationHero.tsx`

**1. Remove all clutter (lines 155-182)**
Delete: AI team text, "Meet your AI team" link, both CTA buttons. Quick Actions below already handles navigation.

**2. Tighten spacing**
Change container from `space-y-3 mt-4` to `space-y-2 mt-3`.

**3. Refine the pill selector — Apple style**
- Softer label: change "Personalized for:" to lighter weight, tracking-wide uppercase micro-label (`text-xs font-medium uppercase tracking-wider text-muted-foreground/70`)
- Pill: remove `bg-muted`, use transparent background with a subtle border (`border border-border/50`), lighter font weight (`font-normal`), and a smooth `transition-all duration-200`. On hover: `hover:border-border hover:shadow-sm`. This gives a glass-like, understated feel.
- Shrink chevron to `w-3 h-3` with lower opacity

**4. Refine headline text**
- Change from `text-base text-muted-foreground` to `text-[15px] leading-relaxed text-muted-foreground/80 font-light`
- The lighter weight + slightly reduced opacity creates that Apple "whisper" feel where text is present but doesn't compete

**5. Add smooth transition on headline change**
Keep `transition-opacity duration-300` for category switches.

### Result
```text
Welcome back, Tomas 👋
Here's what's happening with your studio.

PERSONALIZED FOR   [ Fashion & Apparel ▾ ]
Create campaign-ready fashion visuals without photoshoots.

[Upload Product] [Generate Images] [Browse Workflows] [Brand Profiles]
```

Two lines total. Whisper-quiet label, understated bordered pill, light headline. Feels like Apple's "Designed for iPhone" badge — present but effortless.

### Summary
- 1 file, remove ~30 lines of clutter, restyle ~5 lines
- No new dependencies

