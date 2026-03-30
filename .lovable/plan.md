

## Brighten Red Credit Badge on Dark Header

### Problem
The red "0 credits" badge in the mobile top bar uses `destructive/20` background and `destructive/30` border, which is too dark and hard to read against the dark navbar.

### Change

**File: `src/components/app/AppShell.tsx`** (lines 390-397 — mobile header credit pill)

Update the `isEmpty` styling from:
```
'bg-destructive/20 border-destructive/30 text-destructive'
```
to:
```
'bg-destructive/30 border-destructive/40 text-red-400'
```

This increases the background and border opacity and uses `text-red-400` (a brighter red) instead of `text-destructive` for better contrast on the dark surface.

Also update the collapsed sidebar version (lines 232-240) similarly for consistency:
- Line 234: `'bg-destructive/20'` → `'bg-destructive/30'`
- Line 236: `'text-destructive'` → `'text-red-400'`
- Line 240: `'text-destructive'` → `'text-red-400'`

### Impact
- Brighter, more legible zero-credit indicator on dark backgrounds
- Two spots updated for consistency (mobile header + collapsed sidebar)

