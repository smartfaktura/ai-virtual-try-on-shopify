

# Fix: Scene Not Auto-Selecting from Discover Recreate

## Problem
Race condition: scene matching uses `filterVisible()` which depends on an async query. If it hasn't resolved yet, the scene match fails silently.

## Fix
**`src/pages/Freestyle.tsx`** (~line 286) — Change scene lookup from `filterVisible(mockTryOnPoses).find(...)` to `mockTryOnPoses.find(...)`.

Single-line change. The hidden filter still applies to the scene picker grid — this only affects initial pre-selection from URL params.

