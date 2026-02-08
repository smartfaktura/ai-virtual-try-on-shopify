

## Team Avatar Hover Popup with Living Videos

### What This Does

When users hover over any static team avatar (on the About page grid or the Final CTA stacked avatars), a polished popup card appears showing:
- The animated "living avatar" video (auto-playing, looped)
- Team member name and role
- Short description of what they do

This creates a delightful discovery moment and ties the static avatars back to the living characters from the Studio Team section.

### Where It Applies

1. **About page** (`/about`) -- The 10 circular team avatars in the "Meet the Team" grid
2. **Final CTA section** -- The 10 stacked overlapping avatars with "Your studio team is ready"

### Design

The hover popup uses Radix HoverCard (already installed) with this layout:

```text
+---------------------------+
|  [Video - aspect 4:5]     |
|  Living avatar playing     |
|                            |
+---------------------------+
|  Name          Role Badge  |
|  Description text...       |
+---------------------------+
```

- Video auto-plays on hover, pauses when popup closes
- Card has rounded corners, border, shadow (matches existing card aesthetic)
- Positioned above or below the avatar depending on space
- Smooth fade-in animation using existing `animate-in` utilities
- Card width: ~220px to keep it compact but readable

### Technical Details

**1. Create shared team data: `src/data/teamData.ts`**

Extract the team member array (names, roles, descriptions, avatar imports, video URLs) into a single shared file. This eliminates the current duplication across `StudioTeamSection.tsx`, `DashboardTeamCarousel.tsx`, `FinalCTA.tsx`, and `About.tsx`.

**2. Create hover card component: `src/components/landing/TeamAvatarHoverCard.tsx`**

A reusable wrapper component that:
- Accepts `children` (the avatar trigger element) and a `member` object
- Uses Radix `HoverCard` from `@radix-ui/react-hover-card`
- Renders the video player + name/role/description inside the popup content
- Video loads with `preload="none"` and starts playing only when the popup opens
- Includes a subtle scale-in + fade animation on open

**3. Update `src/pages/About.tsx`**

- Import shared team data from `teamData.ts` (replacing local array)
- Wrap each avatar `<div>` with `<TeamAvatarHoverCard>`
- The existing circular avatar becomes the hover trigger
- Add descriptions to the team data (currently About only has name + role)

**4. Update `src/components/landing/FinalCTA.tsx`**

- Import shared team data from `teamData.ts`
- Wrap each stacked avatar `<img>` with `<TeamAvatarHoverCard>`
- The overlapping layout stays the same; popup appears on hover

**5. Update `src/components/landing/StudioTeamSection.tsx`**

- Import team data from shared `teamData.ts` instead of defining it locally

**6. Update `src/components/app/DashboardTeamCarousel.tsx`**

- Import team data from shared `teamData.ts` instead of defining it locally

### Hover Card Behavior

- **Open delay**: 200ms (prevents accidental triggers)
- **Close delay**: 150ms (gives time to move to the card if needed)
- **Video**: Starts playing when popup opens, resets when it closes
- **Positioning**: `side="top"` by default with `avoidCollisions` enabled so it flips if near screen edge
- **Mobile**: HoverCard gracefully degrades -- it won't trigger on touch devices (Radix handles this)

### Files Changed

| File | Action | Description |
|---|---|---|
| `src/data/teamData.ts` | New | Shared team member data with avatars, videos, roles, descriptions |
| `src/components/landing/TeamAvatarHoverCard.tsx` | New | Reusable Radix HoverCard with video + info popup |
| `src/pages/About.tsx` | Edit | Use shared data + wrap avatars with hover card |
| `src/components/landing/FinalCTA.tsx` | Edit | Use shared data + wrap avatars with hover card |
| `src/components/landing/StudioTeamSection.tsx` | Edit | Import from shared data instead of local array |
| `src/components/app/DashboardTeamCarousel.tsx` | Edit | Import from shared data instead of local array |

