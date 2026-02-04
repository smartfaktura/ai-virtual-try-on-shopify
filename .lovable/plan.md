
# Fix Credits Remaining Card Height

## Problem
The "Credits Remaining" metric card is shorter than the other three cards because it lacks a trend indicator line, while all other cards display trend data.

## Solution
Add a trend prop to the Credits Remaining MetricCard to match the height of other cards.

## File to Modify
**src/pages/Dashboard.tsx** - Line ~82

## Change
```tsx
// Before
<MetricCard
  title="Credits Remaining"
  value={balance}
  suffix="available"
  icon={WalletIcon}
  onClick={openBuyModal}
/>

// After
<MetricCard
  title="Credits Remaining"
  value={balance}
  suffix="available"
  icon={WalletIcon}
  onClick={openBuyModal}
  trend={{ value: 0, direction: 'up' }}  // Neutral trend for consistent height
/>
```

## Alternative Option
If showing "0% from last month" looks odd for credits, we could instead show actual credit usage trend. For example:
- `trend={{ value: 15, direction: 'down' }}` meaning "15% fewer credits than last month" (user is saving)
- Or hide the trend text but keep the space reserved via CSS

## Recommendation
Use a meaningful trend like credits spent comparison, e.g., `{ value: 15, direction: 'down' }` with text "↓ 15% spent vs last month" - this provides useful information while fixing the height issue.
