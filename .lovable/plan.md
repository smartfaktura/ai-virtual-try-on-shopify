

## Optimize Freestyle Lightbox for Mobile

### Problems
1. **Action buttons overflow horizontally** — 6 buttons in a single row get clipped on small screens (visible in the screenshot)
2. **Share/contest incentive invisible** — the "Win up to 10,000 credits" message is in a hover tooltip, which doesn't work on mobile (no hover state)

### Solution

**Responsive action bar layout in `ImageLightbox.tsx`:**

- **Mobile (< 768px):** Reorganize into a 2-row layout:
  - **Top row:** Primary actions as icon-only circular buttons (Select, Download, Copy Prompt, Regenerate, Delete) — compact, all visible
  - **Bottom row:** Share gets a **promoted, full-width pill** with Trophy icon + "Share & Win up to 10,000 credits" text — makes the contest incentive always visible, no tooltip needed
- **Desktop:** Keep current layout unchanged (horizontal row with labels)

- Reduce image `max-h` on mobile from `80vh` to `65vh` to make room for the 2-row action bar
- Navigation arrows: smaller on mobile (`w-9 h-9` instead of `w-12 h-12`), positioned closer to edges

### Share button promotion (mobile)
Instead of a generic "Share" + hidden tooltip, the mobile Share button becomes:
```text
┌──────────────────────────────────┐
│  🏆  Share & Win up to 10K credits  │
└──────────────────────────────────┘
```
Gold/amber accent (`bg-amber-500/20 text-amber-300`) to draw the eye — the contest value prop is immediately visible.

### Files changed
- `src/components/app/ImageLightbox.tsx` — responsive mobile layout with `useIsMobile()`, 2-row action bar, promoted Share CTA

