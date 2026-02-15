
## Fix: Step Numbers Centering and Scroll-to-Bottom Issues

### Problems

1. **Step numbers not centered on mobile**: Each step item uses `flex-1` which distributes space unevenly. The last step has no connector line after it, so its `flex-1` creates empty space on the right, pushing the whole row left-of-center.

2. **Cannot scroll to the bottom buttons**: The AppShell main content area (`pb-4` on mobile at line 287) combined with the wizard footer (`pt-6 mt-4`) provides barely enough room. The content gets clipped at the bottom, especially on iOS where the browser chrome eats into viewport height.

---

### Technical Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**1. Center step numbers properly on mobile (lines 438-464)**

Replace the `flex-1` distribution with a `justify-between` layout that centers all 5 circles evenly. Remove `flex-1` from the last step item (which has no connector line and creates the imbalance).

Change the stepper container from:
```
<div className="flex items-center justify-center gap-0">
  {STEPS.map((s, i) => (
    <div key={s} className="flex items-center flex-1">
```
To:
```
<div className="flex items-center justify-center w-full max-w-md mx-auto">
  {STEPS.map((s, i) => (
    <div key={s} className={cn("flex items-center", i < STEPS.length - 1 ? "flex-1" : "")}>
```

This ensures the last step (with no trailing connector) doesn't take up extra space, keeping all circles evenly distributed and centered.

**2. Add more bottom padding to ensure scroll reaches buttons (line 470)**

Change:
```
<div className="py-8 pb-8">
```
To:
```
<div className="pt-8 pb-4">
```

Reduce bottom padding on the content area since the footer already has `pt-6 mt-4`.

**3. Add bottom padding to the footer for mobile breathing room (line 1452)**

Change:
```
<div className="pt-6 mt-4 space-y-2 sm:border-t sm:pt-4 sm:mt-0">
```
To:
```
<div className="pt-6 mt-4 pb-16 space-y-2 sm:border-t sm:pt-4 sm:mt-0 sm:pb-0">
```

The `pb-16` (64px) on mobile ensures the buttons are well above the iOS browser chrome, home indicator, and any floating widgets. On desktop (`sm:pb-0`) it remains clean.

All changes are in a single file with no new dependencies.
