

# Revamp Changelog Page

## What Changes

### 1. Rewrite release data with real timeline
Replace the current `releases` array with an accurate, engaging changelog:

**Recent (shown by default):**
- **March 20, 2026** — Layout switcher for Workflows (rows/2-col/3-col), Help Center FAQ rewrite, Team page mobile fix, favicon audit
- **March 10, 2026** — Freestyle Studio enhancements (Brand Profile chips, style presets, negative prompts chip), Workflow animated thumbnails, compact workflow cards
- **February 2026** — AI video generation (5s/10s clips), Mobile upload via QR code, 40+ model library with filtering
- **January 2026** — Creative Drops with scheduling, Bulk generation, Credit pack purchasing, Dashboard redesign

**Older (collapsed by default):**
- **December 2025** — Brand Profiles, Virtual Try-On, Pose library (20+ poses)
- **October 2025** — Launch: product upload, 4 workflows, template library, jobs library, auth
- **Summer 2025** — Early development: core architecture, AI pipeline prototyping, initial design system

### 2. Add "Show full history" toggle
- Use React `useState` to track `showAll` (default `false`)
- Show only the first 4 releases by default (2026 entries)
- A "View full history" button at the bottom expands to show all entries
- When expanded, show "Show less" to collapse back

### 3. Keep the existing timeline UI structure
No layout/design changes — same hero, same timeline dots, same badge system. Just better data and the collapsible cutoff.

### File
`src/pages/Changelog.tsx` — rewrite `releases` array, add `useState` for show/hide, slice releases conditionally, add toggle button.

