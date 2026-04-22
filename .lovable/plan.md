

## Remove "Plan Pop-ups" and "UI Style Audit" from admin menu

Hide both items from the admin user dropdown. Routes/pages stay intact (still reachable by direct URL) — just removed from the visible menu.

### Change

**`src/components/app/AppShell.tsx`** (lines ~415–425) — delete the two `<button>` entries for "Plan Pop-ups" and "UI Style Audit" inside the admin section of the user menu.

### Untouched

- `src/pages/AdminPlanPopups.tsx`, `src/pages/AdminUIAudit.tsx` — kept (still accessible via direct URL if needed).
- Routes in the router — unchanged.
- All other admin menu items (Models, Scenes, Scene Performance, Product Visuals Scenes, Recommended Scenes, Trend Watch, Scene Library) — unchanged.

### Validation

Open user menu as admin → "Plan Pop-ups" and "UI Style Audit" no longer appear. "Scene Library" is now the last item before "Sign out".

