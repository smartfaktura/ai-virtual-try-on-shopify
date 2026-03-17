

## Modernize Library Empty State Icon and Add Button Icons

### Changes

**1. `src/pages/Jobs.tsx` (~line 331-335)**
- Replace the generic `Image` icon with `Sparkles` — matches the app's creative/AI identity and feels more modern
- Add `icon` property to each action object: `Layers` for "Explore Workflows" (matches sidebar), `Sparkles` for "Freestyle Generation" (matches sidebar)

**2. `src/components/app/EmptyStateCard.tsx`**
- Extend the `actions` type to accept an optional `icon` (ReactNode) per action
- Render the icon inside the Button before the label text
- Apply to both the `teamMember` and default action rendering paths

### Result
- The placeholder icon becomes a subtle sparkle instead of a dated image-frame icon
- Both CTA buttons get leading icons matching the sidebar nav (Layers, Sparkles)

