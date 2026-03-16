

## Plan: Smooth fade-in animation for dialog modals

### Problem
The dialog uses `zoom-in-95` / `zoom-out-95` animations which cause a noticeable "pop" / scale jump, especially on lower-powered devices. This feels laggy and dated.

### Fix
Update `DialogContent` in `src/components/ui/dialog.tsx` to use a simple opacity fade instead of the zoom scale animation. Remove `zoom-in-95` / `zoom-out-95` classes and keep only `fade-in-0` / `fade-out-0`. This affects all dialogs globally (BuyCreditsModal, PlanChangeDialog, etc.) for a consistent, modern feel.

### Changes

**`src/components/ui/dialog.tsx`** — line 39

Replace:
```
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
```

With:
```
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
```

Single line change. No zoom scale — just a clean fade across all devices.

