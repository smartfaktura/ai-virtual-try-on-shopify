

## Plan: Fix mobile sidebar X close button

### Problem
The X close button on the mobile sidebar overlay is not responding to clicks. Looking at the code, the button is positioned `absolute top-4 right-3` inside the `<aside>`, but the `SidebarContent` component renders on top of it — its header div covers the button area, intercepting clicks.

### Fix

**File: `src/components/app/AppShell.tsx`** (line 303)

Add `z-10` to the X button's container `<div>` so it sits above the `SidebarContent` header:

```tsx
<div className="absolute top-4 right-3 z-10">
```

One-line change. The button handler (`setSidebarOpen(false)`) is already correct — it's purely a stacking/z-index issue.

