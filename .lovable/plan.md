

## Center floating nav bar within content area (not full viewport)

### Problem
The fixed navigation bar uses `left-0 right-0` which centers it relative to the full viewport. It should be centered relative to the content area — offset by the sidebar width.

### Fix

**File: `src/pages/Generate.tsx`** — Lines 2889 and 2940

The `AppShell` already sets `--sidebar-offset` CSS variable (`72px` collapsed, `264px` expanded). Use it as `left` on desktop:

Change both navigation bar wrappers from:
```tsx
<div className="fixed bottom-4 left-0 right-0 z-50 px-4">
```
To:
```tsx
<div className="fixed bottom-4 left-0 right-0 lg:left-[var(--sidebar-offset)] z-50 px-4">
```

This shifts the left edge to match the sidebar width on desktop (`lg:`), keeping mobile unchanged (`left-0`). The `max-w-3xl mx-auto` inner div then centers correctly within the remaining content space.

