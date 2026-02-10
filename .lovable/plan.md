

## Make info@tsimkus.lt Admin + "View as Admin / View as Visitor" Toggle

### Current State

`info@tsimkus.lt` (user_id `fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc`) is **already an admin** in the `user_roles` table -- no database change needed.

The `useIsAdmin` hook is used in `Discover.tsx` and `FreestyleGallery.tsx` to conditionally show admin actions (featured toggles, Add as Scene/Model buttons).

---

### Plan: Admin View Toggle

Add a small floating toggle in the sidebar user menu (only visible to admins) that lets you switch between "Admin view" and "Visitor view" for testing purposes. When set to "Visitor view", `useIsAdmin` returns `false` even though you are an admin, hiding all admin-only UI.

#### Implementation

**1. Create an AdminViewContext (`src/contexts/AdminViewContext.tsx`)**

- Provides `isAdminView` (boolean) and `toggleAdminView` function
- Defaults to `true` (admin view on)
- Persists choice in `localStorage` key `admin-view-mode`
- Only consumed by admin users -- non-admins always see the regular view

**2. Update `useIsAdmin` hook (`src/hooks/useIsAdmin.ts`)**

- Import `useAdminView` from the new context
- The hook still queries `user_roles` to check real admin status
- But the returned `isAdmin` value becomes: `realIsAdmin && isAdminView`
- This means toggling to "Visitor view" makes `isAdmin` return `false` everywhere, instantly hiding all admin UI (featured stars, Add as Scene/Model buttons, etc.)

**3. Add toggle to the sidebar user menu (`src/components/app/AppShell.tsx`)**

- Import `useIsAdmin` (to check real admin status) and `useAdminView`
- In the user dropdown menu (the popover that appears when clicking the user avatar), add a new item between "Account settings" and "Sign out":
  - An `Eye` / `EyeOff` icon with label "View as admin" / "View as visitor"
  - Clicking it calls `toggleAdminView()`
  - Only rendered when the user is a real admin (query `user_roles` directly, not through the modified `useIsAdmin`)
- Style it as a subtle toggle row with a switch or icon swap

**4. Wrap the app with AdminViewProvider (`src/App.tsx`)**

- Add `<AdminViewProvider>` inside `<AuthProvider>` so the context is available throughout the app

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AdminViewContext.tsx` | Context providing `isAdminView` state and `toggleAdminView` |

### Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useIsAdmin.ts` | Export both `isAdmin` (respects toggle) and `isRealAdmin` (ignores toggle) |
| `src/components/app/AppShell.tsx` | Add admin view toggle in user dropdown, only visible to real admins |
| `src/App.tsx` | Wrap with `AdminViewProvider` |

### Technical Details

**AdminViewContext:**
```typescript
// Stores preference in localStorage
const [isAdminView, setIsAdminView] = useState(() => {
  try { return localStorage.getItem('admin-view-mode') !== 'visitor'; } 
  catch { return true; }
});

const toggleAdminView = () => {
  setIsAdminView(prev => {
    const next = !prev;
    localStorage.setItem('admin-view-mode', next ? 'admin' : 'visitor');
    return next;
  });
};
```

**Updated useIsAdmin:**
```typescript
export function useIsAdmin() {
  const { user } = useAuth();
  const { isAdminView } = useAdminView();

  const { data: isRealAdmin = false, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  return { 
    isAdmin: isRealAdmin && isAdminView,  // respects toggle
    isRealAdmin,                           // always true for admins
    isLoading 
  };
}
```

**Sidebar toggle (in user dropdown):**
```tsx
{isRealAdmin && (
  <button
    onClick={() => { toggleAdminView(); }}
    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
  >
    {isAdminView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    {isAdminView ? 'View as visitor' : 'View as admin'}
  </button>
)}
```

This approach means every place that uses `useIsAdmin().isAdmin` will automatically respect the toggle -- no changes needed in Discover, FreestyleGallery, or any other consumer.
