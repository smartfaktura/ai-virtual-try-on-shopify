

## Fix "Missing a Visual Type" banner overflow on mobile

### Issue
The MissingRequestBanner card on `/app/workflows` mobile view has the floating chat bubble (bottom-left FAB) overlapping the avatar stack, and the text + Request button row is cramped — wrapping awkwardly ("Missing a / Visual Type / for your / brand?" wraps to 4 lines).

### Fix
**File: `src/components/app/MissingRequestBanner.tsx`** (or wherever the "Missing a Visual Type for your brand?" card is rendered — likely a workflow-specific variant; need to locate exact component first)

Plan steps:
1. Locate the actual component rendering this banner (search for "Missing a Visual Type" / "for your brand").
2. On mobile:
   - Stack vertically: avatars row on top, text below, Request button full-width at bottom — OR
   - Hide the avatar stack on `<sm` and keep text + button in a tighter row.
   - Reduce text size and allow text to flow naturally without forced narrow column.
3. Ensure card has enough bottom padding so the floating chat FAB (bottom-left) doesn't overlap content — add `mb-16 sm:mb-0` to the banner container so it clears the FAB on mobile.

### Acceptance
- On mobile, banner content fits cleanly with no overlap from chat FAB.
- Text reads on 1–2 lines, Request button accessible.
- Desktop layout unchanged.

