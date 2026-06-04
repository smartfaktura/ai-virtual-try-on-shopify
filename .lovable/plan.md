## Fix

Hide the Top-up / Credit packs section from free users in `src/pages/Settings.tsx`.

### Change

Wrap the existing Credit packs block (lines 640–655) in a `plan !== 'free' &&` guard:

```tsx
{plan !== 'free' && (
  <div className="rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
    {/* Top-up · Need more credits · Credit pack grid — unchanged */}
  </div>
)}
```

`plan` is already destructured from `useCredits()` at line 277 and is used the same way elsewhere in the file (lines 500, 506, 543, 553, 658, 672), so the gate is consistent with the rest of the page.

### Why it's safe

- Pure conditional render — no logic, hooks, or data changes.
- `creditPacks` array and `handleCreditPurchase` stay intact; free users simply don't see the entry point.
- Backend top-up endpoint already enforces plan eligibility, so this is a UI hygiene change, not a security gate.
- Free users still see "Choose your plan" above as the correct CTA.

### Not touched

- Plan picker, current-plan card, cancel flow, billing portal, profile/preferences sections.
- Pricing copy on marketing pages.
