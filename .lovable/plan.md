
# Implement Complete Credit Management System

## Overview

Create a comprehensive credit management system with three key states:
1. **Low Credits** - Warning when credits drop below threshold
2. **No Credits** - Block generation and show buy credits prompt
3. **Buy Credits** - Modal to purchase additional credits from anywhere

## Architecture

```text
+------------------+     +-----------------------+     +-------------------+
| CreditProvider   | --> | useCredits() hook     | --> | Components        |
| (React Context)  |     | - balance             |     | - LowCreditsBanner|
| - creditsBalance |     | - isLow               |     | - NoCreditsModal  |
| - deductCredits  |     | - isEmpty             |     | - BuyCreditsModal |
| - addCredits     |     | - openBuyModal        |     | - CreditIndicator |
+------------------+     +-----------------------+     +-------------------+
```

## Files to Create

### 1. Credit Context Provider
**File: `src/contexts/CreditContext.tsx`**

A React context that:
- Stores current credit balance (initialized from mockShop)
- Provides `isLowCredits` (< 50 credits) and `isEmptyCredits` (= 0)
- Exposes `deductCredits(amount)` and `addCredits(amount)` functions
- Manages buy credits modal open/close state
- Calculates credit cost based on generation settings

### 2. Low Credits Warning Banner
**File: `src/components/app/LowCreditsBanner.tsx`**

A sticky banner component that:
- Shows when credits < 50 with warning styling
- Shows when credits = 0 with critical styling
- Displays remaining balance prominently
- Has "Buy Credits" button to open modal
- Can be dismissed (but reappears on next visit)

### 3. No Credits Blocking Modal
**File: `src/components/app/NoCreditsModal.tsx`**

A modal that:
- Opens automatically when user tries to generate with 0 credits
- Explains that credits are required
- Shows credit pack options inline
- Has clear CTA to purchase or upgrade plan
- Cannot be bypassed - must buy credits or cancel

### 4. Buy Credits Modal
**File: `src/components/app/BuyCreditsModal.tsx`**

A reusable modal that:
- Shows all available credit packs with pricing
- Highlights best value option
- Shows current balance and how much they'll have after purchase
- Handles purchase flow (mock for now)
- Can be opened from anywhere via context

### 5. Credit Indicator Component
**File: `src/components/app/CreditIndicator.tsx`**

A small component for the navigation showing:
- Current credit balance with icon
- Color-coded: green (healthy), yellow (low), red (empty)
- Clickable to open buy credits modal

## Files to Modify

### 6. Update App.tsx
Add `CreditProvider` wrapper around the app

### 7. Update AppShell.tsx
Add `CreditIndicator` to the navigation sidebar footer

### 8. Update Dashboard.tsx
- Replace hardcoded credits with `useCredits()` hook
- Show `LowCreditsBanner` when credits are low
- Wire "Buy Credits" actions

### 9. Update Generate.tsx
- Use `useCredits()` for balance checks
- Show `LowCreditsBanner` at top when low
- Open `NoCreditsModal` when trying to generate with 0 credits
- Deduct credits after successful generation

### 10. Update GenerateConfirmModal.tsx
- Add "Buy Credits" button when insufficient credits
- Wire to open buy credits modal

### 11. Update TryOnConfirmModal.tsx
- Add "Buy Credits" button when insufficient credits
- Wire to open buy credits modal

### 12. Update Settings.tsx
- Use `useCredits()` for balance display
- Wire credit pack purchases to context

---

## Implementation Details

### Credit Thresholds
```typescript
const LOW_CREDIT_THRESHOLD = 50;  // Show warning below this
const CRITICAL_THRESHOLD = 10;    // Show urgent warning
const EMPTY_THRESHOLD = 0;        // Block generation
```

### CreditContext Interface
```typescript
interface CreditContextValue {
  balance: number;
  isLow: boolean;        // balance < 50
  isCritical: boolean;   // balance < 10
  isEmpty: boolean;      // balance === 0
  
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  
  buyModalOpen: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
  
  calculateCost: (settings: { count: number; quality: ImageQuality; mode: GenerationMode }) => number;
}
```

### Visual States

**Low Credits Banner (< 50 credits)**
```text
+--------------------------------------------------------------------+
| ⚠️ Running low on credits                                    [Buy] |
|    You have 42 credits remaining. Top up to continue generating.   |
+--------------------------------------------------------------------+
```

**Critical Credits Banner (< 10 credits)**
```text
+--------------------------------------------------------------------+
| 🔴 Almost out of credits                                     [Buy] |
|    Only 7 credits left! You may not complete your next generation. |
+--------------------------------------------------------------------+
```

**No Credits Modal (0 credits)**
```text
+-----------------------------------------------+
|           You're out of credits               |
|                                               |
|  Purchase credits to continue generating      |
|  professional product images.                 |
|                                               |
|  +--------+  +--------+  +--------+          |
|  |   50   |  |  200   |  |  500   |          |
|  |   $5   |  |  $15   |  |  $30   |          |
|  | [Buy]  |  | [Buy]  |  | [Buy]  |          |
|  +--------+  +--------+  +--------+          |
|              Best Value                       |
|                                               |
|  Or upgrade to Growth plan for 500/month     |
|                                               |
|  [View Plans]                  [Maybe Later] |
+-----------------------------------------------+
```

### Credit Indicator in Navigation
```text
+---------------------------+
| Navigation                |
|---------------------------|
| 🏠 Dashboard              |
| 📷 Generate               |
| 📋 Templates              |
| ⏰ Jobs                   |
|---------------------------|
| ⚙️ Settings               |
|---------------------------|
|                           |
| 💰 847 credits  [+]       |  <-- Credit indicator
+---------------------------+
```

---

## User Flows

### Flow 1: User with low credits visits Generate
1. User navigates to Generate page
2. `LowCreditsBanner` appears at top (dismissible)
3. User continues with generation
4. Confirmation modal shows cost and "remaining after"
5. Generation proceeds normally

### Flow 2: User with 0 credits tries to generate
1. User navigates to Generate page
2. Critical banner shows at top
3. User selects product and template
4. User clicks "Generate Images"
5. `NoCreditsModal` opens (blocking)
6. User must either:
   - Buy credits → Modal closes, generation proceeds
   - Cancel → Returns to settings step

### Flow 3: User buys credits from anywhere
1. User clicks credit indicator in nav OR "Buy Credits" button
2. `BuyCreditsModal` opens
3. User selects a pack
4. Mock purchase completes
5. Credits added to balance
6. Toast confirmation shown
7. Modal closes

---

## Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/CreditContext.tsx` | Create | Global credit state management |
| `src/components/app/LowCreditsBanner.tsx` | Create | Warning when low |
| `src/components/app/NoCreditsModal.tsx` | Create | Block when empty |
| `src/components/app/BuyCreditsModal.tsx` | Create | Purchase credits from anywhere |
| `src/components/app/CreditIndicator.tsx` | Create | Nav footer balance display |
| `src/App.tsx` | Update | Add CreditProvider wrapper |
| `src/components/app/AppShell.tsx` | Update | Add CreditIndicator to nav |
| `src/pages/Dashboard.tsx` | Update | Use context, show banner |
| `src/pages/Generate.tsx` | Update | Credit checks, deductions |
| `src/components/app/GenerateConfirmModal.tsx` | Update | Buy credits CTA |
| `src/components/app/TryOnConfirmModal.tsx` | Update | Buy credits CTA |
| `src/pages/Settings.tsx` | Update | Wire to context |

## Result

After implementation:
- Users see clear warnings when credits are running low
- Generation is blocked (not errored) when out of credits
- Buying credits is accessible from multiple touchpoints
- Credit balance is visible and always up-to-date
- Smooth UX that guides users to purchase rather than frustrating them
