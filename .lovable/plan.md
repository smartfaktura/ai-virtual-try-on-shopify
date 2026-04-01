

# Rename "Creative Drops" → "Content Calendar" — Frontend Only

Same approach as the Workflows→Templates rename. All route paths (`/app/creative-drops`, `/features/creative-drops`) stay unchanged. Only user-facing labels and copy change.

---

## Files and Changes

### 1. Sidebar & Navigation
**`src/components/app/AppShell.tsx`**
- `'Creative Drops'` → `'Content Calendar'`

### 2. Main Page
**`src/pages/CreativeDrops.tsx`**
- Page title: `'Creative Drops'` → `'Content Calendar'`
- Subtitle: update copy to match (e.g. "Schedule recurring content and receive fresh assets on autopilot.")

### 3. Global Generation Bar
**`src/components/app/GlobalGenerationBar.tsx`**
- `'View in Creative Drops'` → `'View in Content Calendar'`

### 4. Studio Chat Suggestions
**`src/components/app/StudioChat.tsx`**
- `'How do Creative Drops work?'` → `'How does the Content Calendar work?'`

### 5. Drop Detail Modal
**`src/components/app/DropDetailModal.tsx`**
- Label `'Creative Drop'` → `'Content Calendar'`

### 6. Dashboard Tip Card
**`src/components/app/DashboardTipCard.tsx`**
- `'Schedule monthly Creative Drops…'` → `'Schedule monthly content drops…'` or similar

### 7. Upcoming Drops Card
**`src/components/app/UpcomingDropsCard.tsx`**
- No "Creative Drop" label visible, but verify — likely fine as-is

### 8. Landing Page Components
**`src/components/landing/CreativeDropsSection.tsx`**
- `'Schedule monthly Creative Drops…'` → `'Schedule your Content Calendar…'`
- Button: `'Set Up Monthly Creative Drops'` → `'Set Up Your Content Calendar'`

**`src/components/landing/LandingFAQ.tsx`**
- `'What are Creative Drops?'` → `'What is the Content Calendar?'`
- Answer text: update accordingly

**`src/components/landing/LandingPricing.tsx`**
- `'Creative Drops included on Growth and above'` → `'Content Calendar included on Growth and above'`

**`src/components/landing/LandingFooter.tsx`**
- `'Creative Drops'` → `'Content Calendar'`

**`src/components/landing/FeatureGrid.tsx`**
- `'Recurring Creative Drops tied to…'` → `'Recurring content drops tied to…'`

**`src/components/landing/HowItWorks.tsx`**
- `'schedule Creative Drops'` → `'schedule your Content Calendar'`

### 9. Feature Pages
**`src/pages/features/CreativeDropsFeature.tsx`**
- SEO title, badge, hero heading, all body copy: `'Creative Drops'` → `'Content Calendar'`
- `'Why Creative Drops?'` → `'Why Content Calendar?'`
- CTA: `'Set up your first Creative Drop'` → `'Set up your Content Calendar'`

**`src/pages/features/BrandProfilesFeature.tsx`**
- 2 references: `'Creative Drop'` → `'Content Calendar'`

### 10. Help Center & Changelog
**`src/pages/HelpCenter.tsx`**
- `'What are Creative Drops?'` → `'What is the Content Calendar?'`
- Answer text updated

**`src/pages/Changelog.tsx`**
- `'Creative Drops & Bulk Generation'` → `'Content Calendar & Bulk Generation'`
- `'Creative Drops — automated content delivery'` → `'Content Calendar — automated content delivery'`

### 11. Admin Status
**`src/pages/AdminStatus.tsx`**
- MetricCard title: `'Creative Drops'` → `'Content Calendar'`

### 12. Live Chat Knowledge
**`supabase/functions/studio-chat/index.ts`**
- All `'Creative Drops'` → `'Content Calendar'` in system prompt, page context map, pricing descriptions, and CTA buttons

---

## What stays unchanged
- All URL routes (`/app/creative-drops`, `/features/creative-drops`)
- All database table names (`creative_drops`, `creative_schedules`)
- All query keys (`['creative-drops']`, `['creative-schedules']`)
- All edge function names (`trigger-creative-drop`, `complete-creative-drop`, etc.)
- All internal variable names and component file names
- The word "drop" when used generically (e.g. "Your drop arrives", "Drop triggered") — these still make sense contextually

## Summary
~18 files, purely string/label changes. No logic, routes, or backend changes.

