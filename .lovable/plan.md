

# Improve Survey Card Mobile UX

## Problems (390px viewport)
- Step 1: Icon + "SURVEY" badge + question text all crammed on one line, text gets truncated
- Answer buttons sit in a row with no visual hierarchy — looks like a cramped toolbar
- Step 2: Reason chips, textarea, and action buttons feel dense with tight spacing
- No clear visual separation between the question and the response area

## Design

### Step 1 (Banner)
- Stack vertically on mobile: top row = icon + badge + dismiss X (right-aligned), second row = question text (full width), third row = answer buttons (equal width, stretched)
- Buttons get `flex-1` on mobile so they fill the row evenly with proper touch targets (min-h 44px)
- Increase padding to `px-4 py-4` for breathing room

### Step 2 (Expanded)
- Same stacked header (icon + badge + dismiss)
- "What could be better?" as its own line
- Chips, textarea, and actions keep current layout but with slightly more vertical spacing (`space-y-3.5`)

### Success state
- Already looks fine, no changes needed

## File
| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Step 1: Restructure to 3-row stacked mobile layout with full-width buttons. Step 2: Improve header spacing. Keep desktop layout unchanged via `md:` breakpoints. |

