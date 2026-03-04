

## Plan

Two changes needed in `src/pages/Settings.tsx`:

### 1. Replace static "Resets on the 1st of each month" with dynamic renewal date

Line 169 currently shows a hardcoded message. Replace it with:
- If `currentPeriodEnd` exists and user is on a paid plan: show "Resets {formatted date}" (e.g., "Resets Apr 1, 2026")
- If user is on free plan or no `currentPeriodEnd`: show "Resets on the 1st of each month" as fallback
- If subscription is canceling: show "Access until {date}" instead

### 2. Make the Enterprise "Contact Sales" button open a mailto link

In the enterprise banner section (~line 227), change the `onClick` handler from `handlePlanSelect('enterprise')` to open `mailto:hello@vovv.ai?subject=Enterprise%20Plan%20Inquiry` using `window.location.href`.

### Files to change
- **`src/pages/Settings.tsx`** — two small edits (renewal text + enterprise mailto)

