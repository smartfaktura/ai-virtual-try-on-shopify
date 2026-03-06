

## Fix: Replace auto-scroll with a Popover for feedback

The current approach — expanding inline then forcing `scrollIntoView` — feels jarring and buggy. The root issue is that an inline banner at the bottom of a scrollable page will always fight with viewport positioning.

### Solution

Replace the inline expand behavior with a **Popover** that opens upward from the collapsed banner. This way:
- No scrolling occurs at all
- The form floats above the banner, always visible
- Dismissing works naturally (click outside or X button)

### Changes to `src/components/app/FeedbackBanner.tsx`

1. **Remove** the `useEffect` with `scrollIntoView` and the `containerRef`
2. **Remove** the `collapsed` state toggle to expanded inline view
3. **Wrap** the collapsed banner's "Share feedback" button with a `Popover` trigger
4. **Move** the expanded form (header, type chips, textarea, submit) into a `PopoverContent` with `side="top"` and `align="end"`
5. The collapsed banner always stays as-is — clicking "Share feedback" opens the popover above it
6. On successful submit, close the popover and show the inline "Thanks" confirmation briefly
7. Keep all existing logic (type selection, message, submit to database, submitted state)

### Layout

```text
                    ┌─────────────────────────┐
                    │ Help us improve VOVV.AI  │
                    │ [Bug] [Feature] [General]│
                    │ ┌─────────────────────┐  │
                    │ │ Tell us more…        │  │
                    │ └─────────────────────┘  │
                    │        [Send Feedback]   │
                    └─────────────────────────┘
  ┌───────────────────────────────────────────────┐
  │ 💬 Help us improve VOVV.AI    [Share feedback]│  ← always visible
  └───────────────────────────────────────────────┘
```

### File changed
- `src/components/app/FeedbackBanner.tsx`

