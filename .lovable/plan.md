

## Hide Quality selector for Selfie / UGC Set workflow

The "Generation Settings" card in `WorkflowSettingsPanel.tsx` appears in two places (lines 580-598 for flat lay, lines 712-748 for everything else). The Selfie / UGC Set hits the second block (line 711+).

### Changes — `src/components/app/generate/WorkflowSettingsPanel.tsx`

1. **Force quality to `'high'` on mount when `isSelfieUgc`** — add a `useEffect` that calls `setQuality('high')` when `isSelfieUgc` is true, ensuring it's always locked to high quality.

2. **Hide the Quality dropdown for Selfie / UGC in the main Generation Settings block (lines 715-725)** — wrap the Quality `<div>` with a condition: only render it when `!isSelfieUgc`. This removes the dropdown entirely, leaving only the Aspect Ratio selector.

3. **Update credit cost text (line 758)** — currently shows `× 8 credits` (standard). For UGC this will always be high (16 credits), but that logic is likely handled upstream. No change needed if credit calculation already uses the `quality` state value.

Result: Selfie / UGC Set users see only the Aspect Ratio picker in Generation Settings, quality is always "high" behind the scenes.

