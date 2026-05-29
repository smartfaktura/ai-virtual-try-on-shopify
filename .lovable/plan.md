# Fix: "Get Credits" on /app/freestyle logs the user out

## Root cause

The Freestyle action bar passes `openBuyModal` directly as the click handler:

```tsx
// src/pages/Freestyle.tsx:921
onBuyCredits: openBuyModal,
```

Then in `FreestylePromptPanel.tsx:466-473` the button uses it as `onClick={onBuyCredits}`. React calls the handler with a `SyntheticEvent` as the first argument, so `openBuyModal(source?: string)` stores that event object in `buyModalSource`.

`GlobalUpgradeModal` then runs:

```ts
const isFeatureGate = !!buyModalSource && buyModalSource.endsWith('-gate');
```

`buyModalSource` is now a SyntheticEvent (not a string), so `.endsWith` is `undefined` → `TypeError` during render. This trips `ErrorBoundary`, which shows the generic "Something went wrong / Reload page" screen. `ErrorBoundary.handleReload` proactively wipes any `sb-*-auth-token` from `localStorage` before reloading "to break crash loops" — so on reload the user is signed out.

Net effect from the user's perspective: tap Get Credits → app errors → reload → logged out.

## Fix (frontend only)

1. **`src/pages/Freestyle.tsx`** — wrap the handler so the click event isn't passed as `source`:
   ```ts
   onBuyCredits: () => openBuyModal('freestyle_action_bar'),
   ```

2. **`src/components/app/GlobalUpgradeModal.tsx`** — defensive: only treat `buyModalSource` as a feature gate when it is actually a string.
   ```ts
   const isFeatureGate = typeof buyModalSource === 'string' && buyModalSource.endsWith('-gate');
   ```

3. **`src/contexts/CreditContext.tsx`** — coerce non-string `source` arguments to `null` inside `openBuyModal` so any other caller that accidentally forwards a click event can't poison `buyModalSource` again:
   ```ts
   const openBuyModal = useCallback((source?: string) => {
     setBuyModalSource(typeof source === 'string' ? source : null);
     setBuyModalOpen(true);
   }, []);
   ```

No backend changes, no auth changes, no other call sites need updates — these three edits both fix the Freestyle bug and harden the path against the same mistake elsewhere.

## Out of scope
- `ErrorBoundary` token-clearing behavior stays as-is (it's a deliberate crash-loop safety net).
- No changes to the modal UI or copy.
