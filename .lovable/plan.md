

## Remove "Keep product looking exactly as-is" Checkbox

### Why Remove It
The checkbox is **non-functional** — it stores a local state value (`preserveAccuracy`) that is never sent to any backend function or generation hook. It has zero effect on the generated images. Removing it eliminates user confusion without losing any functionality.

### Change

**File: `src/pages/Generate.tsx`**

1. Remove the `preserveAccuracy` state variable (line ~148)
2. Remove the checkbox block from the regular generation settings section (lines ~1221-1224)
3. Remove the checkbox block from the Virtual Try-On settings section (lines ~1410-1413)

That's it — one file, three small deletions. No other files reference this value.

