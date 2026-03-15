

## Make Scene Popover Bigger on Desktop

The compact popover is currently `sm:w-96` (384px) with `max-h-72` (288px) and a 3-column grid. On desktop there's room to show larger thumbnails.

### Changes — `src/components/app/freestyle/SceneSelectorChip.tsx`

1. **Wider popover on desktop**: Change `sm:w-96` to `sm:w-96 lg:w-[480px]` for more breathing room on large screens.

2. **Taller scroll area**: Change the compact `max-h-72` (288px) to `max-h-72 lg:max-h-96` (384px on desktop) so more scenes are visible without scrolling.

3. **Larger grid gap on desktop**: Add `lg:gap-2` to the compact grid for slightly more spacing between cards.

4. **Slightly larger text on desktop**: Bump scene name from `text-[9px]` to `lg:text-[11px]` in compact mode for readability.

These are purely CSS/class changes — no logic modifications needed.

| File | Change |
|---|---|
| `src/components/app/freestyle/SceneSelectorChip.tsx` | Widen popover, increase max-height, and bump text size at `lg:` breakpoint |

