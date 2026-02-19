

## Fix: Confusing Disabled State on Generate Button

### What's Happening

The Generate button is currently disabled and greyed out. The user sees "Need 4 more credits" and assumes credits are the problem, but the button is actually disabled because **no prompt has been typed yet** (the text field is empty). The credit warning is a secondary issue.

This creates confusion because two different problems overlap without clear feedback about which one is blocking the action.

### Root Cause

The button uses `disabled={!canGenerate}` where `canGenerate = canSubmit = (prompt.trim().length > 0 || hasAssets) && !isLoading`. With an empty prompt and no assets, the button is disabled regardless of credit balance. But the only visible feedback is the credit warning, misleading the user.

### Solution

**1. Show contextual helper text explaining what's needed**

When the button is disabled due to missing input (not credits), show a small text hint: "Type a prompt or add a reference to start". This appears in the action bar area, left-aligned, so the user knows exactly what to do.

**2. Prioritize the input message over the credit message**

When BOTH input is missing AND credits are insufficient, show the input requirement first (since fixing credits alone won't help). The credit warning appears only when the user has valid input but not enough credits.

### File to Change

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | In the action bar (Row 3), conditionally show helper text. When `!canGenerate` and the reason is no input (not just credits), show "Type a prompt or add a reference" hint. Only show the credit warning when input is valid but credits are short. |

### Technical Details

In the action bar section (around line 275-289), change the logic:

```text
Current:
  if creditBalance < creditCost -> show "Need X more credits"

Proposed:
  if !canGenerate AND creditBalance >= creditCost -> show "Type a prompt or add a reference"
  if canGenerate AND creditBalance < creditCost -> show "Need X more credits" + Top up
  if !canGenerate AND creditBalance < creditCost -> show "Type a prompt or add a reference" (prioritize input message)
```

This ensures the user always knows what action to take next, whether it's typing a prompt or buying credits.
