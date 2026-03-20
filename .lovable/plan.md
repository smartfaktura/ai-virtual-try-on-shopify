

# Fix: Post-Launch UX — Show Generating Drop Immediately

## Problem

After clicking "Generate Now":
1. Wizard closes instantly via `onClose()`
2. Tab switches to "Drops" via `onLaunched()`
3. But the drops query hasn't refetched yet — the new "generating" drop doesn't exist in the cache
4. User sees "No drops yet" empty state or stale data — no indication anything is happening
5. The only feedback is the small GlobalGenerationBar pill in the bottom-right corner

## Fix

### File 1: `src/components/app/CreativeDropWizard.tsx` (~lines 568-590)

**Don't close the wizard immediately after triggering.** Instead:
1. After successful `trigger-creative-drop` invoke, wait for the drops query to refetch before closing
2. Add a brief "Launching your drop..." loading state with a spinner before closing
3. Use `await queryClient.invalidateQueries({ queryKey: ['creative-drops'] })` (awaited!) so the drop appears in the list before closing

Change the `onSuccess` flow:
```
onLaunched?.();                    // switch tab to "drops" 
await queryClient.invalidateQueries({ queryKey: ['creative-drops'] });  // wait for fresh data
await queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
onClose();                         // NOW close wizard
```

Also add `setIsLaunching(true)` state before the trigger call and show a fullscreen "Launching..." overlay on the wizard so the user knows something is happening.

### File 2: `src/pages/CreativeDrops.tsx` (~line 246)

**Call `onLaunched` BEFORE `onClose`** — currently `onLaunched` sets the tab, but `onClose` resets wizard state. The order in the wizard already handles this correctly (line 582 calls `onLaunched`, line 590 calls `onClose`). No change needed here.

### File 3: `src/components/app/DropCard.tsx` (~line 301)

**Make generating drop cards more prominent:**
- Add a subtle pulsing border animation for `generating` status cards
- Make the card clickable even during generating (currently only `ready` cards are clickable)

## Summary
- 2 files changed, ~15 lines
- Key fix: await query invalidation before closing wizard so the generating drop card is visible
- Add "Launching..." state to the wizard button so user sees immediate feedback
- Add visual emphasis to generating drop cards

