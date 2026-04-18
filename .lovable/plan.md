

## Fix non-functional "Earn Credits" button in user menu

### Problem
In `src/components/app/AppShell.tsx` line 323–328, the "Earn Credits" button in the user dropdown menu is missing its `onClick` handler. The `EarnCreditsModal` and `setEarnCreditsOpen` state are already wired up (line 487), but the button never triggers them.

### Fix
Add the missing onClick to the button:

```tsx
<button
  onClick={() => { setEarnCreditsOpen(true); setUserMenuOpen(false); }}
  className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
>
  <Gift className="w-4 h-4" />
  Earn Credits
</button>
```

This matches the pattern used by the other items in the same menu (close menu + perform action).

### Acceptance
- Clicking "Earn Credits" in the user dropdown opens the `EarnCreditsModal`
- User menu closes when clicked
- No console errors

