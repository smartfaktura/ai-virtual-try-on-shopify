

### Why you don't see the change on "Add Products"

The global default I changed is `h-9`, but `src/pages/Products.tsx` hard-codes `h-11 px-5` directly on the `<Button>`, which overrides the new default. Tailwind's `h-11` wins over `h-9` because it's applied last via the `className` prop.

Two locations in `src/pages/Products.tsx`:
- Line 235 (desktop): `className="hidden sm:inline-flex h-11 px-5 ..."`
- Line 348 (mobile): `className="sm:hidden w-full h-11 ..."`

### Fix
Remove the `h-11 px-5` / `h-11` overrides so the button inherits the new `h-9 px-4 rounded-lg` default. Keep everything else (`shadow-sm hover:shadow-md`, `font-semibold`, mobile `w-full`).

**Desktop (line 233–239):**
```tsx
<Button
  onClick={() => openAddDrawer('manual', undefined, false)}
  className="hidden sm:inline-flex font-semibold shadow-sm hover:shadow-md transition-shadow"
>
  <Plus className="w-4 h-4 mr-2" />
  Add Products
</Button>
```

**Mobile (line 346–352):**
```tsx
<Button
  onClick={() => openAddDrawer('manual', undefined, false)}
  className="sm:hidden w-full font-medium"
>
  <Plus className="w-4 h-4 mr-2" />
  Add Products
</Button>
```

After this, "Add Products" will be `h-9` with `rounded-lg` corners — visually consistent with the rest of the app and noticeably tighter/softer than today.

### Optional follow-up (not in this change)
Other pages may also override `h-10`/`h-11` on individual buttons (forms, modals, "Save Changes" etc.). If you want, I can do a sweep next to strip those overrides so the global default actually takes effect everywhere.

### Files
- `src/pages/Products.tsx` (~4 lines)

### Acceptance
- "Add Products" (desktop + mobile) renders at `h-9` with `rounded-lg` corners
- Matches the height/radius of other standard `<Button>`s across the app
- Shadow + font weight preserved; mobile stays full-width
