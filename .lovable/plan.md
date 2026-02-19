

## Fix: Mobile Freestyle Credit UX and Button Visibility

### Problems Identified

1. **"Out of credits" banner is too tall on mobile** -- Takes ~120px of precious mobile real estate, pushing the generating card and gallery into cramped space (visible in screenshot).

2. **Generate button appears clickable when user has no credits** -- On mobile, the button shows blue "Generate (4)" even though user has 0 credits. This is misleading; user expects clicking it will generate, but it opens the Buy Credits modal instead. Bad UX.

3. **Generate button looks grey/disabled on desktop even when active** -- The `bg-primary` color (dark navy `hsl(217, 33%, 17%)`) is almost indistinguishable from the disabled grey state.

### Solution

#### 1. Compact LowCreditsBanner on Mobile
**File: `src/components/app/LowCreditsBanner.tsx`**

- Reduce padding on mobile (`p-3` instead of `p-4`)
- Hide the description text on small screens (`hidden sm:block`)
- Keep icon + title + button in a single horizontal row
- Result: ~48px tall instead of ~120px

#### 2. Visual States for Generate Button Based on Credit Balance
**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

Add three distinct visual states for the Generate button:

| State | Appearance | Behavior |
|-------|-----------|----------|
| **Disabled** (no prompt/assets) | Grey/muted, not clickable | Shows "Type a prompt..." hint |
| **Insufficient credits** | Orange/warning outline style, "Buy Credits" label | Opens Buy Credits modal |
| **Ready to generate** | Bright blue (`bg-blue-600`), clearly active | Starts generation |

When the user doesn't have enough credits:
- Button text changes from "Generate (4)" to "Buy Credits"
- Button uses an outline/warning style instead of solid primary
- The inline shortfall text ("Need X more credits") remains visible

When the user has enough credits:
- Button uses bright vivid blue (`bg-blue-600`) instead of dark navy `bg-primary`
- Clearly distinguishable from the disabled grey state

#### 3. Add 4 Credits to 123presets
- Database update to add 4 credits for testing

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/LowCreditsBanner.tsx` | Compact single-line layout on mobile |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Three distinct button visual states based on credit balance |

### Technical Detail

```
Generate button states:

1. !canGenerate (no prompt):
   className = "bg-muted text-muted-foreground" + disabled

2. canGenerate BUT creditBalance < creditCost:
   className = "border-2 border-orange-400 bg-orange-50 text-orange-700"
   label = "Buy Credits"
   onClick = opens buy modal

3. canGenerate AND creditBalance >= creditCost:
   className = "bg-blue-600 hover:bg-blue-700 text-white"
   label = "Generate (cost)"
   onClick = starts generation
```

```
LowCreditsBanner mobile:
  Before: p-4, flex-col, icon + title + description + full-width button = ~120px
  After:  p-3 sm:p-4, flex-row always, description hidden on mobile = ~48px
```
