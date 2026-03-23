

# Fix Metric Cards: Modern Tooltips, Remove Grey Borders, Fix Text Overflow

## Issues from screenshots
1. Tooltip uses old-style `?` icon — replace with modern branded popover showing team avatar + explainer
2. Last two cards ("Continue Last", "Top Style") have grey left accent border — remove it
3. Text overflows on smaller screens (suffix text wraps badly, value text too large on mobile)

## Changes

### 1. `src/components/app/MetricCard.tsx` — Full rework

**Remove grey left border**: Delete the `hasAction ? 'border-l-2 border-l-primary/30' : ''` conditional styling.

**Replace old tooltip with branded popover**: Instead of Radix Tooltip with a plain `(i)` icon, use a Popover that shows:
- Team member avatar (small, 20px rounded)
- Team member name in bold
- Explainer text below

Change `tooltip?: string` prop to `tooltip?: { text: string; memberName: string; avatar: string }` to support branded tooltips.

The trigger is a small, modern `(i)` circle icon — but styled cleanly (no question mark, just a subtle info circle with `opacity-40` that becomes `opacity-70` on hover).

**Fix text overflow**:
- Value: `text-xl sm:text-2xl` instead of `text-2xl` — scales down on mobile
- Suffix: `text-[9px] sm:text-[10px]` with `max-w-[60px] sm:max-w-none` and `leading-tight`
- Description: keep `line-clamp-2` but add `text-xs sm:text-sm`

### 2. `src/pages/Dashboard.tsx` (lines 494-542) — Update tooltip props

Pass branded tooltip objects instead of plain strings:

```tsx
tooltip={{ text: "Based on €30 average cost per professional product photo", memberName: "Omar", avatar: avatarOmar }}
```

Map each card to a relevant team member:
- Cost Saved → Omar (Visual CRO Strategist)
- Time Saved → Max (Platform Optimization Engineer)
- Credits Remaining → Kenji (Campaign Art Director)
- Continue Last → Sophia (E-commerce Photographer)
- Top Style → Sienna (Brand Identity Guardian)

Import the avatar URLs from `landingAssets`.

### Files
- `src/components/app/MetricCard.tsx` — branded tooltip popover, remove grey border, fix text overflow
- `src/pages/Dashboard.tsx` — pass branded tooltip objects with team avatars

