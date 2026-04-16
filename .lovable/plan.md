

# Improve Desktop & Tablet Feedback Survey

## Current State
The desktop pill (screenshot) already works well as a single horizontal row. The improvements focus on visual refinement and tablet breakpoint handling.

## Changes

### Desktop refinements
- Add a subtle vertical divider (`border-l border-border/30 h-4`) between the "HELP US IMPROVE" label and the question text — creates clearer visual separation in the pill
- Slightly increase button padding on desktop (`px-3.5`) for better click targets
- Add `hover:border-border/80` to buttons for a more polished hover state
- Add subtle `hover:shadow-sm` transition on the entire pill for depth

### Tablet breakpoint (md)
- Currently jumps from mobile stack (`flex-col`) to desktop pill (`sm:flex-row`) at 640px — too early for tablets
- Change the responsive breakpoint from `sm:` to `md:` (768px) so tablets in portrait (820px, 768px) get the proper pill layout, while smaller tablet widths still get the stacked card
- This prevents the pill from being cramped on narrow tablets

### Button hover states
- Add `active:scale-[0.97]` for tactile feedback on click
- Slightly more visible hover: `hover:bg-muted hover:border-border/80`

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Lines 146-188: Update breakpoints from `sm:` to `md:`, add divider, improve button hover states |

