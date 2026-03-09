

## Move Generation Bar Next to Support Icon & Fix Mobile Overlap

### Current State
- **Global Generation Bar**: Fixed `bottom-4 right-4` — a wide 288px pill on the right side
- **Studio Chat button**: Fixed `bottom-4 left-4` — a 48px round button on the left side
- On mobile, the generation bar overlaps with the freestyle prompt buttons

### Changes

**1. Reposition Generation Bar to bottom-left, above the chat icon**
- Move from `fixed bottom-4 right-4` to `fixed bottom-20 left-4 lg:left-[var(--sidebar-offset)]` — sits directly above the support chat button
- Reduce width from `w-72` to `w-64` for a tighter fit on the left side
- Keep z-index at 30 (below chat's z-40)

**2. Mobile optimization**
- On mobile, make the pill even more compact (smaller width, shorter text)
- Hide the expanded detail panel on mobile — only show the compact pill
- Add `bottom-20` positioning so it clears the chat icon without overlapping prompt bar buttons

### Files to edit
| File | Change |
|------|--------|
| `src/components/app/GlobalGenerationBar.tsx` | Move positioning to bottom-left above chat icon; add mobile-responsive sizing; hide expanded panel on mobile to prevent overlap |

