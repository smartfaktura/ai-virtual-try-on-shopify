

## Fix: Forgot Password Dialog Pushed Off-Screen on Mobile

### Problem

The dialog uses `fixed top-[50%] translate-y-[-50%]` positioning (centered vertically). On mobile, when the keyboard opens, the viewport shrinks but the dialog stays centered relative to the full viewport — pushing the content above the visible area.

### Fix

Change the `DialogContent` positioning on mobile to align to the top of the viewport instead of center, so the keyboard doesn't push it off-screen. On desktop (`sm:` and up), keep the centered behavior.

**File: `src/components/ui/dialog.tsx`**

Update the `DialogContent` className to use `top-[5%] translate-y-0` on mobile, and `sm:top-[50%] sm:translate-y-[-50%]` on desktop. This keeps the dialog near the top on mobile so the keyboard doesn't clip it, while preserving the centered look on desktop.

Also add `max-h-[90vh] overflow-y-auto` to ensure the dialog is scrollable if content exceeds viewport.

### Files Changed
| File | Change |
|------|--------|
| `src/components/ui/dialog.tsx` | Mobile-first positioning: top-aligned on mobile, centered on desktop |

