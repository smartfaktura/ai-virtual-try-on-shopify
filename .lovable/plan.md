

## Fix Scroll-to-Top & Rename "Pose" to "Scene / Environment"

### Problem 1: Scroll Not Working
The app layout uses a scrollable `<main>` container with `overflow-y-auto` in `AppShell.tsx` (line 262). The current `window.scrollTo()` call targets the wrong scroll container, so the page stays in the middle when switching steps.

**Fix in `src/pages/Generate.tsx` (line 213)**: Replace `window.scrollTo({ top: 0, behavior: 'smooth' })` with a query for the actual scrollable `<main>` element:
```typescript
document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
```

### Problem 2: Rename "Pose" to "Scene"
Update all user-facing labels from "Pose" to "Scene" across the generate flow.

**Changes in `src/pages/Generate.tsx`**:

| Location | Current Text | New Text |
|---|---|---|
| Step name (line 574) | `{ name: 'Pose' }` | `{ name: 'Scene' }` |
| Button (line 961) | `Continue to Pose` | `Continue to Scene` |
| Heading (line 973) | `Select a Pose` | `Select a Scene` |
| Subtitle (line 974) | `Choose how your model will be positioned` | `Choose the scene and environment for your shoot` |
| Back button (line 1424) | `Back` (goes to 'pose') | No text change needed, just navigates back |
| Toast (line 364) | `Pose "${pose.name}" selected!` | `Scene "${pose.name}" selected!` |
| Error (line 375) | `select a model and pose` | `select a model and scene` |

### Files Changed
- `src/pages/Generate.tsx` -- scroll fix + all "Pose" to "Scene" renames
