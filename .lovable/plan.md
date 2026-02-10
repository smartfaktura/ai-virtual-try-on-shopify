

## Fix Library: Deletion and Image Loading

### Problem Analysis

After multiple failed fix attempts, I've identified **two root causes**:

**1. Delete not working:** The Radix `AlertDialog` component has known issues with controlled `open` state when no `onOpenChange` handler is provided. The internal Radix state conflicts with our React state (`deleteTarget`), causing the dialog to silently block interactions. Previous fixes addressed parts of this but the fundamental Radix state conflict remains.

**2. Images not loading:** The `useLibraryItems` query silently fails when an error occurs (React Query retries but never shows the error). With no error boundary or catch logging, the spinner just spins forever.

### Solution

**Approach: Replace the problematic Radix AlertDialog with a simple Dialog-based confirmation, and add error logging to the library query.**

### File Changes

#### 1. `src/pages/Jobs.tsx` - Replace AlertDialog with Dialog

Replace the `AlertDialog` import and component with a standard Radix `Dialog`. This avoids all the AlertDialog auto-close and state-fighting behavior that has caused 4 rounds of bugs.

- Remove `AlertDialog*` imports
- Import `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` instead
- Replace the AlertDialog JSX at the bottom with a Dialog that uses `open={!!deleteTarget}` and `onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}`
- Keep the Delete button as a regular `<Button variant="destructive" onClick={confirmDelete}>`
- Add `console.log` statements in `confirmDelete` to track execution flow and catch silent failures

#### 2. `src/hooks/useLibraryItems.ts` - Add error logging

- Wrap the query function in a try/catch that logs errors to console before re-throwing
- This ensures that if the query fails, we can see why in the console

### Technical Details

**Dialog replacement (Jobs.tsx):**
```text
// Remove AlertDialog imports, add Dialog imports
// Replace AlertDialog JSX with:
<Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete this image?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
      <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Error logging (confirmDelete):**
```text
// Add at start of confirmDelete:
console.log('[Library] Deleting item:', item.id, item.source);

// Add in catch block:
catch (err) {
  console.error('[Library] Delete failed:', err);
  toast.error('Failed to delete image');
}
```

**Query error logging (useLibraryItems.ts):**
```text
// Wrap queryFn body in try/catch:
try {
  // ... existing fetch logic ...
} catch (err) {
  console.error('[Library] Query failed:', err);
  throw err;
}
```

Two files modified. The Dialog component avoids all the AlertDialog state management issues that caused 4 rounds of bugs.
