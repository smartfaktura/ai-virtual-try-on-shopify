

# Sidebar Navigation Grouping

## The Problem
All 8 nav items sit in a single flat list after the CTA button. There's no visual rhythm — your eye has to scan every label linearly. "Brand Models" at the bottom feels disconnected from "Products" even though they're related.

## The Fix
Group items with subtle spacing (no headers, no labels — just breathing room between logical clusters):

```text
[Create Visuals]  ← CTA button
─────────────────
Dashboard

Visual Studio
Create with Prompt

Products
Brand Models
Explore

Library
Video
```

**Three changes in `src/components/app/AppShell.tsx`:**

1. **Reorder `navItems`** to group related items:
   - Dashboard (solo — primary landing)
   - Visual Studio + Create with Prompt (creation tools)
   - Products + Brand Models + Explore (assets & browse)
   - Library + Video (output & media)

2. **Add group breaks** using a `divider` flag on certain items. Before rendering, insert a small `mt-3` spacer when `item.divider` is true — no text, no line, just 12px of air between clusters.

3. **Remove the separator line** (`h-px bg-white/[0.06]`) that currently sits between the CTA and Dashboard — the grouping spacing replaces it.

## Result
The menu will feel structured and scannable without adding any visual clutter like section headers.

## Files Changed
1. `src/components/app/AppShell.tsx` — reorder navItems, add divider spacing between groups, remove old separator

