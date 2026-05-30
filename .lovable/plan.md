## Problem

In `/app/video/animate`, picking the same library image twice re-runs the `analyze-video-input` edge function each time. `analyzeImage` in `src/hooks/useVideoProject.ts` has no cache, so every selection costs a Gemini call + ~5s staged UI for an image we already analyzed.

## Fix (minimal, additive, no risk to existing flows)

### 1. `src/hooks/useVideoProject.ts` — add URL-keyed cache
- Add a **module-level** `Map<string, VideoAnalysis>` keyed by `${workflow_type}:${imageUrl}` (default `animate`). Module scope survives in-app navigation within the same tab; cleared on hard refresh.
- Hydrate from `sessionStorage` (`vovv:video-analysis-cache:v1`) on module load inside a `try/catch` — any parse error silently resets the cache, so corrupt storage can never crash the hook.
- In `analyzeImage(imageUrl)`:
  - **Cache hit** → set `analysisResult`, do NOT flip `isAnalyzingImage`, return cached value (still async). No edge function call.
  - **Cache miss** → existing path unchanged. On success, write to the Map + best-effort `sessionStorage.setItem` (try/catch for quota / Safari private mode).
- Export a small helper `hasCachedAnalysis(imageUrl)` so the page can decide whether to skip the staged UI.

No changes to: function signature, return shape, error handling, `runAnimatePipeline`, or the edge function. Fresh disk uploads still get fresh URLs → naturally bypass the cache.

### 2. `src/pages/video/AnimateVideo.tsx` — skip staged UI on cache hit
- At the three `analyzeImage` call sites (library pick ~L246, bulk handlers ~L323 and ~L355): check `hasCachedAnalysis(url)` **before** the call.
  - If cached → skip the 5s `analysisStep` animation and `uploadCompleteTime` gate, apply the analysis to state immediately (same effect that runs on `uiRevealReady`).
  - If not cached → behavior is 100% unchanged.

### Safety
- Cache stores read-only metadata (category, scene type, recommended motion). Never touches credits, prompts, queue, or RLS.
- Worst-case stale entry → slightly off default form values the user can override anyway (same as today's first analysis).
- Storage key carries a `v1` suffix; bumping it cleanly invalidates old entries if `VideoAnalysis` shape ever changes.
- Zero backend, DB, edge function, or migration changes.

### Files touched
- `src/hooks/useVideoProject.ts` — cache layer + `hasCachedAnalysis` export
- `src/pages/video/AnimateVideo.tsx` — short-circuit staged analysis UI on cache hit