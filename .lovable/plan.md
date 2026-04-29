## Goal

Align both "Save preferences" buttons to the **left** so the Notifications card and Content Preferences card match visually.

Currently:
- Notifications card → button is right-aligned (`justify-end`)
- Content Preferences card → button is left-aligned (no justify class)

## Change (one file: `src/pages/Settings.tsx`)

Around line 702, change the Notifications save wrapper from right-aligned to left-aligned:

```tsx
// Before
<div className="flex justify-end pt-2">

// After
<div className="flex pt-2">
```

That's it — one className edit. Both cards will then have their save button on the left, matching.