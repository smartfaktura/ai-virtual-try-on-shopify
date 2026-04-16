

# Improve Mobile Feedback Survey Layout

## Problem
On mobile (390px), the current layout has the "HELP US IMPROVE ·" label, question text, and dismiss X all crammed on one line, then buttons below. The text competes for space and the hierarchy isn't clear. From the screenshot: everything feels flat and same-weight.

## Solution
Stack the content into three clear visual layers on mobile:

### Layer 1 — Context label + dismiss
- "HELP US IMPROVE" label on the left, X dismiss on the right — same row
- Keeps the tiny uppercase muted style

### Layer 2 — Question text
- Full-width on its own line: `text-sm font-medium text-foreground/80`
- Slightly larger and darker than the label so it reads as the primary content

### Layer 3 — Answer buttons
- Full-width row, `flex gap-2`, each button `flex-1` with slightly taller touch targets (`py-1.5` instead of `py-1`)
- Rounded-full, consistent sizing

### Desktop (sm+)
- Keep the single-row pill layout as-is — no changes needed

## Technical detail
Single file: `ContextualFeedbackCard.tsx`, lines 146-167

```tsx
// Mobile: stacked 3-layer card
<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 px-4 py-3 sm:py-2 rounded-xl sm:rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 shadow-sm w-full sm:w-auto">
  {/* Row 1: label + dismiss */}
  <div className="flex items-center justify-between sm:contents">
    <div className="flex items-center gap-1.5">
      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
        Help Us Improve
      </span>
    </div>
    <button onClick={dismiss} className="sm:hidden text-muted-foreground/40 hover:text-muted-foreground">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>

  {/* Row 2: question (mobile only — inline on desktop) */}
  <span className="text-sm sm:text-xs font-medium text-foreground/70 sm:text-muted-foreground sm:flex-1">
    {questionText}
  </span>

  {/* Row 3: buttons */}
  <div className="flex gap-2 sm:gap-1.5 w-full sm:w-auto">
    {buttons with flex-1 sm:flex-initial, py-1.5 sm:py-1}
  </div>

  {/* Desktop dismiss */}
  <button className="hidden sm:block ..."><X /></button>
</div>
```

Key improvements:
- Question text gets its own line on mobile — larger, readable
- Label row with dismiss X creates clear header
- Buttons fill width evenly with better touch targets
- Clean 3-layer visual hierarchy instead of cramped single row

## File
| File | Lines |
|------|-------|
| `src/components/app/ContextualFeedbackCard.tsx` | 145-175 |

