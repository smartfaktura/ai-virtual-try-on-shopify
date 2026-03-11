

## Decouple Model & Resolution Selectors in Freestyle

### Current behavior (broken)
When a model (e.g. Sienna) is selected, the resolution chip is replaced with a locked "Pro · 2K" badge. User cannot change resolution independently.

### Desired behavior
- **Resolution selector**: Always visible and interactive (1K, 2K, 4K), regardless of model selection
- **Auto-select Pro model**: Only when resolution is 2K or 4K (handled backend-side already)
- **Model selected**: Forces Pro model for generation quality, but resolution stays at whatever user chose (can be 1K)
- Credits: `max(model/scene base cost of 8, resolution cost)` — current logic on line 194 already handles this correctly

### Changes

**1. `src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Remove the `hasModelSelected` conditional that replaces the resolution chip with a locked "Pro · 2K" badge (lines 158-169)
- Always show the normal resolution popover selector regardless of model selection
- Add a small "Pro" indicator label when a model is selected (to signal pro model will be used), but keep resolution interactive

**2. `src/pages/Freestyle.tsx`**
- No changes needed — credit calculation on line 194 already uses `Math.max((hasModel || hasScene) ? 8 : 0, resolutionCredits)` which correctly handles model+1K = 8 credits

**3. `src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Remove `hasModelSelected={!!selectedModel}` prop (no longer needed) or keep it for a subtle Pro badge — but stop using it to lock resolution

### Result
- User selects Sienna → Pro model used, resolution stays 1K (4 credits becomes 8 due to model minimum)
- User selects 2K → Pro model auto-used, 8 credits
- User selects Sienna + 4K → Pro model, 12 credits
- Resolution chip always interactive

