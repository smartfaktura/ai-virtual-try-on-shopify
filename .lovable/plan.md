## Plan — Fix Fresh Scenes preview modal overflow on mobile

### Root cause

In `src/components/app/DashboardFreshScenes.tsx` (line 198), the modal uses:

```
<DialogContent className="max-w-5xl p-0 overflow-hidden border-0 bg-background shadow-2xl">
```

No `max-h` and no inner scroll. On mobile the stacked image (`max-h-[55vh]`) + the long right column (eyebrow, title, subtitle, "What you get" list, divider, meta dl, two CTAs) exceeds 100vh, so the dialog runs off the bottom of the screen. Because the wrapper sets `overflow-hidden`, content below the viewport is simply clipped — exactly what the screenshot shows (no close button, body cut off).

### Fix — single file, `src/components/app/DashboardFreshScenes.tsx`

1. **DialogContent** (line 198): change to `max-w-5xl p-0 overflow-hidden border-0 bg-background shadow-2xl max-h-[92dvh] sm:max-h-[90vh]` and add a wrapping scroller. Simplest: drop `overflow-hidden` from the outer DialogContent and put `overflow-y-auto max-h-[92dvh]` on the inner grid container (line 200) so the image + right column scroll together inside the dialog. Keep the rounded corners by leaving `overflow-hidden` on DialogContent and instead putting `overflow-y-auto` on the inner grid `<div>`.
2. **Image cell** (line 201): tighten the mobile image height so the title/CTAs are visible without scrolling. Change `md:aspect-[4/5] md:h-[80vh] md:w-auto` → keep desktop classes, and change the `<img>` max height from `max-h-[55vh] md:max-h-none` to `max-h-[42vh] md:max-h-none`. This gives roughly half the screen to the image and half to the structured copy + CTAs on a typical phone.
3. **Right column** (line 208): reduce mobile padding `p-6 md:p-10` → `p-5 md:p-10` and gap `gap-6` → `gap-5 md:gap-6` so the dividers, bullet list, meta rows, and CTAs fit more comfortably above the fold.

### Out of scope

Desktop layout (≥ md) is unchanged — only mobile spacing and the scroll container. No data, query, taxonomy, or routing changes.

### Risk

None — purely CSS. `dvh` falls back gracefully (we still set `sm:max-h-[90vh]`).