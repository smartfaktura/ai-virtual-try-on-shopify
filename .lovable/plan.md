## Objective
On the library card, hide the 4K/2K resolution badge on hover so it doesn't overlap with the bottom-right action buttons (e.g. download/favorite/info).

## Change
**File:** `src/components/app/LibraryImageCard.tsx`

Resolution badge wrapper currently:
```tsx
<div className="absolute bottom-3 right-3 z-10">
  <Badge ...>{item.quality === 'upscaled_4k' ? '4K' : '2K'}</Badge>
</div>
```

Update wrapper to fade out on card hover:
```tsx
<div className="absolute bottom-3 right-3 z-10 transition-opacity duration-200 opacity-100 group-hover:opacity-0 pointer-events-none">
```

- `group-hover:opacity-0` — hides when hovering the card (parent uses `group` class)
- `pointer-events-none` — badge never blocks button clicks even mid-transition
- Smooth 200ms fade matches existing card transitions
- On touch devices (no hover), badge stays visible as today

## Scope
- Only the library grid card badge. Modal detail badge unchanged.
