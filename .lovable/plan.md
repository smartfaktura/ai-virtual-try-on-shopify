

## Simplify Freestyle Showcase — Visual-First Layout

The current two-column layout has too much competing content: a large headline, paragraph, 4-bullet list, and CTA button on the left, plus a busy animated demo with typing text on the right. It's hard to parse at a glance.

### New approach: Stacked, visual-first layout

Instead of side-by-side text vs. animation, restructure as a **centered section** where the animation IS the hero — with minimal text above it.

### Layout

```text
┌──────────────────────────────────────────────┐
│          ✨ FREESTYLE STUDIO (badge)         │
│                                              │
│    Your Creative Studio. No Limits.          │
│    One line subtitle below                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  [Prompt bar with typed text]          │  │
│  │  [Product] [Model] [Scene]  [Generate] │  │
│  └────────────────────────────────────────┘  │
│                                              │
│     ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│     │ Result 1│ │ Result 2│ │ Result 3│     │
│     └─────────┘ └─────────┘ └─────────┘     │
│                                              │
│          [ Try Freestyle Free ✨ ]           │
└──────────────────────────────────────────────┘
```

### Changes to `FreestyleShowcaseSection.tsx`

1. **Remove the 2-column grid** — switch to a single centered column
2. **Remove the bullet list** — it repeats the subtitle; unnecessary clutter
3. **Remove the long paragraph** — replace with a single concise subtitle line
4. **Keep the badge, heading, and CTA** — but center-align them above and below the demo
5. **Flatten the demo panel** — make it a single horizontal bar (prompt + chips + generate button in one row) instead of a stacked card, more like a toolbar. This reads faster
6. **Keep the animation logic unchanged** — same typewriter, chip activation, progress bar, and result reveal timing
7. **Results stay as a 3-column grid** below the prompt bar, with the same staggered reveal
8. **Move CTA button below the results** — centered, as a clear final action

This makes the animation the centerpiece, removes text overload, and lets users instantly understand "type prompt → pick inputs → get results."

