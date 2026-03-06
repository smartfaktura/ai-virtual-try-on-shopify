

## Add Inline Credit Balance to Mobile Header

### Problem
On mobile, users can't see their credit balance without opening the sidebar. There's no quick path to top up or upgrade.

### Solution
Add a compact, tappable credit pill to the **mobile top bar** (between logo and hamburger menu). Tapping it opens the Buy Credits modal. No floating elements — it's part of the existing fixed header bar.

### Design

```text
Mobile header (existing):
┌─────────────────────────────────────┐
│ [V] VOVV.AI    ⚡42    ☰           │
└─────────────────────────────────────┘
                  ^^^
          New: compact credit pill
```

- Small pill: Sparkles icon + balance number (e.g. "42")
- Subtle `bg-white/[0.06]` background, rounded
- On tap → opens `buyModal` (same as the `+` button in sidebar CreditIndicator)
- When balance is 0: pill turns `bg-destructive/20` with red-tinted text
- When low: pill pulses subtly

### Also: Desktop sidebar collapsed state
Currently when sidebar is collapsed, the credit section just shows an upgrade arrow. Add the balance number below it so it's always visible.

### Files Changed
- `src/components/app/AppShell.tsx` — add credit pill to mobile header bar, update collapsed sidebar credit display

