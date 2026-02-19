

## Improve Credit Awareness on Workflow Generate Page

The current workflow page lets users configure everything and only tells them they don't have enough credits *after* clicking Generate. This is a poor experience. Here's what we'll fix:

### Problem Areas
- Generate buttons show as fully active even when balance is insufficient
- Cost summary sections show "X credits available" in plain text with no warning styling
- No inline guidance to buy credits or upgrade — user only finds out via modal on click
- Virtual Try-On settings page has the same issue

### Changes

#### 1. Add Insufficient Credits Warning to Cost Summary Bars
**File: `src/pages/Generate.tsx`**

In all 4 cost summary sections (workflow scenes ~line 2078, flat lay ~line 1944, try-on ~line 2164, template ~line 1523), enhance the "X credits available" text:

- When `balance < creditCost`: show text in red (`text-destructive`) with a warning icon and "Not enough credits" label
- Add a small "Buy Credits" link button next to it that calls `openBuyModal()`
- When `balance >= creditCost`: keep current neutral styling with a green checkmark

#### 2. Change Generate Buttons to Reflect Credit State
**File: `src/pages/Generate.tsx`**

For all Generate buttons (~lines 1533, 1958, 2098, 2176):

- When `balance < creditCost`: change button text to "Buy Credits" with a different style (`bg-muted text-muted-foreground`), and onClick opens the buy modal directly instead of attempting generation
- When `balance >= creditCost`: keep current primary button styling and behavior
- This gives immediate visual feedback without needing to click first

#### 3. Show LowCreditsBanner on Generate Page
**File: `src/pages/Generate.tsx`**

The `LowCreditsBanner` is already imported (line 38) but only shown conditionally. Ensure it appears at the top of the settings step when credits are low/empty, giving users an early heads-up before they scroll to the bottom.

### Technical Details

The key conditional is simple:
```tsx
const hasEnoughCredits = balance >= creditCost;
```

For the Generate buttons:
```tsx
<Button
  onClick={hasEnoughCredits ? handleGenerateClick : openBuyModal}
  disabled={selectedVariationIndices.size === 0}
  className={!hasEnoughCredits ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
>
  {hasEnoughCredits
    ? `Generate ${selectedVariationIndices.size} Images`
    : 'Buy Credits'}
</Button>
```

For the cost summary bars:
```tsx
<p className={cn("text-sm", hasEnoughCredits ? "text-muted-foreground" : "text-destructive font-semibold")}>
  {hasEnoughCredits ? `${balance} credits available` : (
    <button onClick={openBuyModal} className="flex items-center gap-1 text-destructive hover:underline">
      <AlertCircle className="w-3.5 h-3.5" />
      {balance} credits — need {creditCost}. Top up
    </button>
  )}
</p>
```

This applies to all 4 generation paths: workflow scenes, flat lay, virtual try-on, and template-based.

### Files to Edit
- `src/pages/Generate.tsx` — all changes are in this single file
