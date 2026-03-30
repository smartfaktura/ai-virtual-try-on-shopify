

## Fix: Don't Show Freestyle Guide If Already Dismissed in DB

### Problem
When a user opens Freestyle in incognito (or clears browser data), `localStorage` has no `freestyle_guide_dismissed` key, so the guide shows again — even though the user already dismissed it and it's persisted in the database.

### Root Cause
The initial state defaults to showing the guide (`!localStorage.getItem(...)` → true), and the DB check only runs after mount. This causes a flash of the guide before the DB response arrives, and in incognito it shows fully because localStorage is empty.

### Fix

**File: `src/pages/Freestyle.tsx`**

1. **Default `showGuide` to `false`** instead of `true` when localStorage has no value. This prevents the guide from flashing before the DB check completes.

2. **Only show the guide after confirming the DB says it hasn't been dismissed.** In the existing `useEffect` (line 205-222), change the `else if` branch: if the DB does NOT have `freestyleGuideDismissed: true`, then set `showGuide(true)`. If the user has no profile row or is not logged in, the guide stays hidden.

Change line 135:
```typescript
// Before
const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('freestyle_guide_dismissed'));

// After
const [showGuide, setShowGuide] = useState(false);
```

Change lines 213-219 in the profile fetch effect:
```typescript
// Before
if (dismissed) {
  setShowGuide(false);
  localStorage.setItem('freestyle_guide_dismissed', 'true');
} else if (!localStorage.getItem('freestyle_guide_dismissed')) {
  setShowGuide(true);
}

// After
if (dismissed) {
  localStorage.setItem('freestyle_guide_dismissed', 'true');
} else {
  // DB says not dismissed — show guide (even if localStorage was cleared)
  setShowGuide(true);
}
```

This way: DB is the source of truth. localStorage is just a fast cache for subsequent visits. Incognito users who already dismissed won't see it again.

