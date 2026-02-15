
## Fix: Empty Settings Step for Selfie / UGC Set

### Problem
The Settings step for Selfie / UGC Set shows a completely blank page. This happens because:

1. The **workflow-specific settings block** (line 1565) is gated by `generationMode !== 'virtual-try-on'` -- but UGC has `uses_tryon: true`, so its mode IS `virtual-try-on`, blocking the entire section (variation grid, mood selector, quality settings, generate button)
2. The **try-on settings block** (line 2117) requires `selectedPose` -- but UGC skips the pose/scene step, so there's no pose selected, blocking this section too

The result: both settings sections are excluded and the user sees an empty page.

### Fix (single file: `src/pages/Generate.tsx`)

**Line 1565** -- Add `isSelfieUgc` as an exception to the `virtual-try-on` exclusion:

Change:
```
generationMode !== 'virtual-try-on'
```
To:
```
(generationMode !== 'virtual-try-on' || isSelfieUgc)
```

This allows the UGC workflow to render through the workflow-specific settings path (which contains the variation grid, UGC mood selector, quality/aspect-ratio settings, cost summary, and generate button) instead of the try-on path that requires a selected pose.
