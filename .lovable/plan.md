

## Better "Out of Credits" UX on Generate Button

### What's Wrong
When the user doesn't have enough credits, the Generate button silently greys out. There's no indication of why, making the experience confusing.

### Changes

#### 1. Show "Not Enough Credits" state on the Generate button (`FreestylePromptPanel.tsx`)

When credits are insufficient, transform the Generate button to clearly communicate the issue:

- **Visual change**: Instead of a greyed-out "Generate (4)", show an amber/warning-styled button with text like "Not Enough Credits" and a coin/alert icon
- **Clickable**: The button remains clickable and opens the Buy Credits modal (this already works in `handleGenerate`, but users don't know to click)
- **Credit info**: Show current balance vs. cost, e.g., "You have 2 — need 4"

#### 2. Add `insufficientCredits` prop to `FreestylePromptPanel`

Pass a new boolean prop from `Freestyle.tsx`:
```
insufficientCredits = balance < creditCost
```

#### 3. Button states in `FreestylePromptPanel.tsx`

The Generate button area will have three states:

| State | Appearance |
|-------|-----------|
| **Ready** | Purple "Generate (4)" button (current) |
| **Loading** | Spinner + "Generate (4)" (current) |
| **Insufficient credits** | Amber/warning button: "Not Enough Credits" -- clicking opens buy modal. Small text below: "You have 2 credits, need 4" |

#### 4. Pass `openBuyModal` to prompt panel

Add `onBuyCredits` prop to `FreestylePromptPanel` so the button can directly trigger the buy modal.

### Technical Details

**Files changed:**

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Pass `insufficientCredits` and `onBuyCredits` props to `FreestylePromptPanel` |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Accept new props, conditionally render warning-styled button with "Not Enough Credits" text and balance info when credits are insufficient |

No backend or database changes needed.
