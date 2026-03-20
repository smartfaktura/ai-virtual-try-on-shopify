

# Redesign Calendar View — Premium 2026 Aesthetic

## Current Problems
- Calendar is cramped in a `max-w-lg` container — wastes space on desktop/tablet
- Day cells use `aspect-square` with tiny `min-h-[48px]` — feels like a utility widget, not a premium feature
- Navigation and month header are basic — no visual hierarchy
- Legend feels like an afterthought stuck at the bottom
- On mobile, day headers and cells are too tight
- Popover content is plain — no visual polish

## Design Direction
Clean, spacious calendar inspired by Apple Calendar / Linear — generous whitespace, subtle grid lines, refined typography, soft interactive states.

## Changes

### File: `src/pages/CreativeDrops.tsx` — CalendarView component (lines 501-712)

**1. Container & Layout**
- Remove `max-w-lg` constraint → `max-w-2xl` on desktop, full-width on mobile
- Add a card wrapper with `rounded-2xl border bg-card/50 backdrop-blur-sm p-4 sm:p-6`
- Month header: larger typography (`text-xl sm:text-2xl font-bold tracking-tight`), navigation arrows with refined hover states

**2. Day Grid — Premium Feel**
- Remove `gap-1` → use `gap-0` with subtle `border-b border-r border-border/30` grid lines for a clean structured look
- Day cells: `min-h-[56px] sm:min-h-[72px]` — more breathing room
- Remove `aspect-square` — let cells be taller rectangles (better for showing content)
- Day number positioned top-left with `text-xs sm:text-sm` weight
- Status dots positioned bottom-center with more spacing
- Today: filled primary circle behind the day number (like Apple Calendar), not a ring on the whole cell
- Hover: subtle `bg-muted/40` with smooth `transition-colors duration-200`

**3. Day Headers**
- Uppercase `text-[10px] sm:text-[11px] font-semibold tracking-widest text-muted-foreground/60`
- Full 3-letter headers on all viewports (Sun, Mon…) — they fit with the wider layout
- Bottom border separator under headers

**4. Popover Refinement**
- `rounded-2xl shadow-lg border-border/50 backdrop-blur-xl` 
- Date shown as "March 20" with `font-semibold text-sm`
- Drop entries with mini thumbnails (first image) if available
- Status pill badges instead of raw dots
- "View Drop →" link for ready drops

**5. Legend**
- Move above the calendar grid (below month summary), styled as subtle inline pills
- `px-2.5 py-1 rounded-full bg-muted/50 text-[10px] font-medium` with colored dots

**6. Mobile (< 640px)**
- Full-width calendar, `p-3` padding
- Day cells `min-h-[52px]` with `text-xs` day numbers
- Navigation arrows slightly smaller (`h-8 w-8`)
- Popover uses `side="bottom"` with `w-[calc(100vw-2rem)]` for edge-to-edge feel

**7. Tablet (640-1024px)**
- `max-w-xl` centered
- Day cells `min-h-[64px]`

## Summary
- 1 file changed (~130 lines rewritten in CalendarView)
- Premium card-wrapped calendar with grid lines instead of gaps
- Spacious cells with Apple-style today indicator
- Refined popovers, inline legend pills, responsive breakpoints

