

## Fix: "Processing" Banner Stuck and Refresh Button Not Working

### Root Cause

Two bugs in `src/pages/Jobs.tsx`:

1. **Banner never auto-dismisses**: `showIncomingBanner` uses `useMemo` with `Date.now()` inside it. Since `lastCompletedAt` only changes once (when a job completes), the memo never recomputes after the 30-second window passes. The banner stays visible forever.

2. **Refresh button works but doesn't dismiss banner**: The Refresh button correctly calls `queryClient.invalidateQueries({ queryKey: ['library'] })` to refetch data, but the banner remains because it's controlled by the broken `useMemo` logic, not by whether data has refreshed.

### Fix: `src/pages/Jobs.tsx`

- Replace the `useMemo`-based `showIncomingBanner` with a `useState` + `useEffect` pattern that sets a timer to auto-dismiss after 30 seconds
- When the Refresh button is clicked, dismiss the banner immediately in addition to invalidating the query
- Add a `dismissBanner` callback that sets the state to `false`

```text
Before:
  const showIncomingBanner = useMemo(() => {
    if (!lastCompletedAt) return false;
    const elapsed = Date.now() - new Date(lastCompletedAt).getTime();
    return elapsed < 30_000;
  }, [lastCompletedAt]);

After:
  const [showIncomingBanner, setShowIncomingBanner] = useState(false);

  useEffect(() => {
    if (!lastCompletedAt) return;
    const elapsed = Date.now() - new Date(lastCompletedAt).getTime();
    if (elapsed < 30_000) {
      setShowIncomingBanner(true);
      const timer = setTimeout(() => setShowIncomingBanner(false), 30_000 - elapsed);
      return () => clearTimeout(timer);
    }
  }, [lastCompletedAt]);
```

- Update the Refresh button `onClick` to also call `setShowIncomingBanner(false)`

Single file change, no backend or database modifications needed.

