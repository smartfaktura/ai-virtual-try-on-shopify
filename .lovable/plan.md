

## Buy Credits Modal Header — What's Good, What's Bad

### What's Good
- **Balance display** — Large, clear `3,398 credits` with wallet icon is immediately readable
- **PRO badge + X close button** — Right-aligned, properly spaced, no overlap
- **Tab pill switcher** — Clean rounded-full style, clear active state

### What's Bad

1. **Too much vertical space consumed before content** — The header, tabs, and billing toggle take up ~200px before you see any plan cards. On mobile (390px), this means you only see the Free card and have to scroll far to find your current Pro plan.

2. **Tab switcher alignment feels orphaned** — It's left-aligned and floating below the header with no visual anchor. It looks disconnected from both the balance above and the billing toggle below.

3. **"Save 20% — switch to annual →" link is redundant** — The toggle already has "SAVE 20%" badge built in. Having both the badge AND the text link says the same thing twice.

4. **Billing toggle sits alone** — It's centered in its own row with empty space on both sides, creating an awkward gap between tabs and plan cards.

### Proposed Fix

**`src/components/app/BuyCreditsModal.tsx`**

1. **Move billing toggle inline with tabs** — Put tabs on the left and the Monthly/Annual toggle on the right, same row. This eliminates one entire vertical section (~50px saved).

2. **Remove the "Save 20% — switch to annual →" text link** — The "SAVE 20%" badge on the Annual button is sufficient. Removes another ~30px.

3. **Result**: Header → Tabs + Toggle (one row) → Plan cards. Three sections instead of five.

Layout change:
```text
Before:                          After:
┌─────────────────────┐          ┌─────────────────────┐
│ 3,398 credits  PRO X│          │ 3,398 credits  PRO X│
├─────────────────────┤          ├─────────────────────┤
│ [Top Up] [Plans]    │          │ [Top Up][Plans] [Mo][An]│
├─────────────────────┤          ├─────────────────────┤
│  [Monthly] [Annual] │          │ Plan cards...       │
│  Save 20% switch →  │          │                     │
├─────────────────────┤          └─────────────────────┘
│ Plan cards...       │
└─────────────────────┘
```

On mobile (390px), the tabs and toggle would stack into two rows within the same section, still saving the redundant CTA link row.

