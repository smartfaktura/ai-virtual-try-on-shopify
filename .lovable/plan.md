## Remove "Load your last settings" banner

**File: `src/pages/ProductImages.tsx`**

1. **Remove state variables** (lines 106-107): Delete `showLastSettingsBanner` and `lastSettingsCategory` state declarations
2. **Remove the check useEffect** (lines 601-615): Delete the effect that checks localStorage on step 3 entry
3. **Keep the save effect** (lines 617-624): The save-on-step-4 effect is harmless and costs nothing — leave it so the feature can be re-enabled later if needed. Alternatively remove it too for cleanliness.
4. **Remove `loadLastSettings` callback** (lines 626-637)
5. **Remove the banner JSX** (lines 1722-1729): The `{showLastSettingsBanner && (...)}` block
6. **Clean up `History` import** (line 8): Remove `History` from the lucide-react import if no longer used elsewhere
