

# Apple-Style Sidebar Navigation

## Inspiration
Apple's sidebar navigation uses **tiny uppercase section labels** (like "Discover", "Library", "Store") to group items — not spacing gaps or dividers. Items are compact with minimal padding, and section labels act as quiet visual anchors that make scanning instant.

## Current Problem
The sidebar uses `mt-3` spacer gaps between groups with no labels. This creates ambiguous whitespace — your brain has to figure out *why* there's a gap. It reads as "broken" rather than "organized."

## The Fix

Replace divider spacing with small uppercase section labels:

```text
[Create Visuals]  ← CTA button

  WORKSPACE
  Dashboard

  CREATE
  Visual Studio
  Create with Prompt

  ASSETS
  Products
  Brand Models
  Explore

  MEDIA
  Library
  Video
```

## Changes in `src/components/app/AppShell.tsx`

1. **Replace flat `navItems` array** with a grouped structure:
   ```ts
   const navGroups = [
     { label: 'Workspace', items: [Dashboard] },
     { label: 'Create', items: [Visual Studio, Create with Prompt] },
     { label: 'Assets', items: [Products, Brand Models, Explore] },
     { label: 'Media', items: [Library, Video] },
   ];
   ```

2. **Render section labels** — tiny `text-[10px] uppercase tracking-widest text-white/25 font-semibold` labels above each group. When sidebar is collapsed, labels are hidden and a subtle `h-px bg-white/[0.06]` separator replaces them.

3. **Tighten item padding** — reduce from `py-3` to `py-2.5` for a denser, Apple-like feel. Each group gets `mt-4` spacing (first group `mt-0`).

4. **Remove the `divider` property** from individual items — grouping is now structural.

## Result
Clean, scannable sidebar where section labels guide the eye like Apple's macOS Finder sidebar — minimal but structured.

## Files Changed
1. `src/components/app/AppShell.tsx` — restructure navItems into navGroups, render section labels, tighten padding

