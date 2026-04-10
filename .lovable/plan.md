

# Fix: Remove Confusing "Outdated" Badge from Product Selection

## Problem
Every product shows an "Outdated" badge because their stored `analysis_json` was created before the `version: 2` stamp was added. This is alarming but harmless — re-analysis already runs automatically when you move to Step 2 (Scenes).

## Solution
Remove the "Outdated" badge and refresh button from Step 1 entirely. Since re-analysis is already triggered automatically at Step 2, showing a stale-data warning on the selection screen adds confusion without value.

## Changes

| File | What |
|------|------|
| `src/pages/ProductImages.tsx` | Remove the two `isStaleAnalysis` badge blocks (list view ~line 880 and grid view ~line 935). Remove the `isStaleAnalysis` callback (~line 94-99). |

This is purely a UI cleanup — no backend or analysis logic changes needed.

