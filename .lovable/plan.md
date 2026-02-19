

## Fix: Generate Button Should Stay Active When Out of Credits

### Problems Identified

1. **Button disabled when out of credits** -- `canGenerate` includes `hasEnoughCredits` check, which greys out the button. But the generate handler already opens the Buy Credits modal when credits are insufficient. The button should stay active so users can click it and get prompted to buy.

2. **Ugly amber/orange button styling** -- When credits are low, the button turns amber/orange which looks bad, especially on mobile where the text wraps awkwardly ("Need 4 more credits" breaking onto multiple lines).

3. **Mobile layout overflow** -- The "Need X more credits" + "Top up" text doesn't fit well on small screens.

### Solution

**1. Fix `canGenerate` in `src/pages/Freestyle.tsx` (line 148)**

Remove the credit check from `canGenerate`. The button should be enabled whenever the user has valid input (`canSubmit`). The credit check stays in the handler where it opens the buy modal.

```
Before: const canGenerate = canSubmit && hasEnoughCredits;
After:  const canGenerate = canSubmit;
```

**2. Clean up button styling in `FreestylePromptPanel.tsx`**

- Remove the amber/orange button color override entirely -- keep the primary button style always
- Remove the `AlertTriangle` icon swap on the button -- always show `Sparkles`
- Keep the subtle inline "Need X more credits" text + "Top up" link, but simplify it:
  - Use `text-muted-foreground` instead of amber for the hint text
  - On mobile, shorten to "Need X more" with a compact layout
- Remove the amber shadow override

**3. Fix mobile text overflow**

Wrap the credit shortfall message in a responsive layout that doesn't break on small screens.

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Line 148: remove `hasEnoughCredits` from `canGenerate` |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Lines 275-323: Remove amber button styling, keep button always primary-colored, simplify the "need more credits" hint text with muted styling instead of amber, fix mobile overflow |

### Result

- Button stays primary-colored and clickable when user has a prompt but no credits
- Clicking it opens the Buy Credits modal (existing behavior in `handleGenerate`)
- Small muted text hint shows credit shortfall without aggressive amber coloring
- Mobile layout no longer overflows

