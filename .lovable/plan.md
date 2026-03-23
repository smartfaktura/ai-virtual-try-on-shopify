

# Fix Metric Cards: Unified Typography, Text Fitting, External Hover Tooltip

## Problems
1. **Too many font sizes** — titles use `tracking-widest uppercase` (not brand), values use different sizes, suffix is tiny and unreadable
2. **Text doesn't fit** — tooltip text wraps badly in the flip view, large values overflow
3. **In-card flip is bad UX** — user loses context when card content disappears on hover
4. **Need external tooltip** — hover should show a floating popover outside the card, not replace card content

## Design

Unified typography following VOVV.AI brand (`tracking-tight`, `font-semibold`, no aggressive `tracking-widest uppercase`):

```text
Card (h-[140px], p-4):
┌────────────────────┐
│ Cost Saved         │  ← text-xs font-medium text-muted-foreground (no uppercase, no wide tracking)
│                    │
│ €42,930            │  ← text-xl font-bold tracking-tight (auto-scales to text-lg if needed)
│ vs traditional     │  ← text-xs text-muted-foreground/70 (readable, not 10px)
│ photoshoots        │
│                    │
└────────────────────┘
      ↓ on hover, external popover appears below
  ┌──────────────────────────┐
  │ [avatar] Omar            │
  │ Based on €30 avg per     │
  │ professional product     │
  │ photo                    │
  └──────────────────────────┘
```

## Changes

### 1. `src/components/app/MetricCard.tsx` — Rework

**Remove in-card flip**: Delete `flipped` state, `onMouseEnter`/`onMouseLeave` flip logic, the absolute-positioned dual content layers, and the mobile info dot.

**Use Radix Popover for external tooltip**: Import `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`. Control open state via `onMouseEnter`/`onMouseLeave` with 200ms delay (desktop) and tap-to-open (mobile).

**Unified brand typography**:
- Title: `text-xs font-medium text-muted-foreground` — no uppercase, no tracking-widest
- Value: `text-xl font-bold text-foreground tracking-tight` with `whitespace-nowrap`
- Suffix: `text-xs text-muted-foreground/70 leading-snug` — readable size, not 10px
- Description: `text-sm font-medium text-foreground`
- Action button: `text-xs font-semibold text-primary`

**Card container**: `rounded-xl border border-border/40 bg-card p-4 sm:p-5 h-[140px]` — fixed height, simple layout with `flex flex-col justify-between`.

**Popover content**: `max-w-[240px] p-3 rounded-xl shadow-lg` with avatar (24px), member name bold, explainer text below.

**Mobile**: Popover opens on card tap when tooltip exists (using `onClick` check for touch devices).

### 2. No Dashboard changes needed — props stay the same.

### Files
- `src/components/app/MetricCard.tsx`

