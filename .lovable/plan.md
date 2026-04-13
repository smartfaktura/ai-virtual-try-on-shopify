

# Why Only 1 Image Generated (Despite Selecting 4)

## Root Cause

The database confirms all 3 recent generations sent `imageCount: 1` and charged only 6 credits each. If 4 variations had been selected, it would have sent `imageCount: 4` and charged 24 credits.

**Most likely cause:** Your browser was still running the previous version of the code (before the variation feature was added). The build may not have completed or the browser cached the old bundle.

**Action:** Hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R) to load the latest build, then try generating with 4 variations again.

## Precautionary Fix

There's one minor robustness improvement worth making: ensure `variationCount` is included in the `useCallback` dependency array for the generate function, so stale closures can never send an outdated count.

### File: `src/pages/Freestyle.tsx` (~line 724)
- Verify `variationCount` is in the dependency array of the `handleGenerate` callback
- If missing, add it to prevent stale closure bugs

This is a small defensive change — the primary issue is just loading the new build.

