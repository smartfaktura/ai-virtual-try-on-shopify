## "Swap more products" → reset to scene selection

In `src/pages/ProductSwap.tsx` (button at line 461), change the onClick to fully reset the wizard and return to Step 1 (scene selection) instead of jumping to Step 2 with scene preserved.

### New behavior
- Clear scene (`sceneUrl`, `sceneTitle`, `sceneSource`)
- Clear product selection
- Reset to `currentStep = 1`
- Exit generation view + clear jobs/results
- Button label stays "Swap more products"

### Scope
- One file, one onClick handler. No backend changes.
