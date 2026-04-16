
# Remove `/app/admin/conversion` Route and Page

## Overview
Remove the AdminConversion page component and all references to it since it will be redesigned from scratch.

## Files to Delete
- `src/pages/AdminConversion.tsx` — the entire page component

## Files to Modify

### `src/App.tsx`
**Line 60** — Remove the lazy import:
```tsx
const AdminConversion = lazy(() => import('@/pages/AdminConversion'));
```

**Line 217** — Remove the route definition:
```tsx
<Route path="/admin/conversion" element={<AdminConversion />} />
```

### `src/components/app/AppShell.tsx`
**Lines 384-390** — Remove the navigation button in the admin user menu:
```tsx
<button
  onClick={() => { navigate('/app/admin/conversion'); setUserMenuOpen(false); }}
  className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
>
  <Sparkles className="w-4 h-4" />
  Conversion
</button>
```

| File | Action |
|------|--------|
| `src/pages/AdminConversion.tsx` | Delete |
| `src/App.tsx` | Remove import (line 60) and route (line 217) |
| `src/components/app/AppShell.tsx` | Remove menu button (lines 384-390) |
