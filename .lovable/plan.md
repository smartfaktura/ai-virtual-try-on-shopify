

## Fix: Credit-Blocked UX on Freestyle (and Generate Page)

### Problem

When a user doesn't have enough credits to generate:

1. The **Generate button becomes disabled** with no explanation of why
2. The user **cannot click the disabled button**, so the "open buy modal" fallback code never executes (dead code path)
3. The **Freestyle page has no LowCreditsBanner** -- zero credit guidance
4. When a user adds a Model (cost jumps from 4 to 12 credits), they get no feedback that their 4 credits are now insufficient
5. No inline hint near the Generate button explaining the shortfall or how to top up

### Solution

**1. Make the Generate button clickable when only credit-blocked**

Split `canGenerate` into two concerns:
- `canSubmit`: has content (prompt or assets) and not loading -- controls whether clicking does anything
- `hasEnoughCredits`: balance >= creditCost -- controls visual styling only

The button stays enabled when the user has valid input but insufficient credits. Clicking it opens the Buy Credits modal instead of generating.

**2. Show inline credit shortfall indicator next to Generate button**

When `balance < creditCost`, display a subtle amber/red text below or beside the button:
- "Need X more credits" with a "Top up" link that opens the buy modal
- Uses the existing `openBuyModal` function

**3. Add LowCreditsBanner to the Freestyle page**

Show the existing `LowCreditsBanner` at the top of the Freestyle content area, consistent with Dashboard and Generate pages.

---

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Split `canGenerate` logic; add `LowCreditsBanner` import and render it in the scrollable content area |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Accept new `balance` prop; show credit shortfall text near the Generate button when `balance < creditCost`; keep button enabled when only credit-blocked |
| `src/pages/Generate.tsx` | Apply the same fix: ensure the generate/confirm buttons open buy modal when clicked with insufficient credits instead of being fully disabled |

### Technical Details

**Freestyle.tsx changes:**
- Change `canGenerate` to: `(prompt.trim().length > 0 || hasAssets) && !isLoading` (remove credit check from disable logic)
- Pass `balance` to `FreestylePromptPanel`
- Import and render `<LowCreditsBanner />` inside the scrollable content area (above gallery)

**FreestylePromptPanel.tsx changes (action bar area, line ~273-297):**
- Accept `balance` prop
- When `balance < creditCost`: show amber text "Need {creditCost - balance} more credits" with a clickable "Top up" that calls `onGenerate` (which will trigger `openBuyModal`)
- Keep the Generate button visually distinct (amber/warning styling instead of primary) when credit-blocked but still clickable
- The button text changes to "Generate (X)" with a small warning icon when insufficient

**Generate.tsx changes:**
- Same pattern: ensure generate/try-on confirm buttons remain clickable and open buy modal when credits are short

### Design

The credit shortfall indicator follows the platform's clean, minimal aesthetic:
- Small text in `text-amber-500` (or `text-destructive` if completely out)
- Positioned directly below the Generate button in the action bar
- Shows exact deficit: "Need 8 more credits" with "Top up" as an underlined link
- No large banners or popups -- just contextual inline guidance

