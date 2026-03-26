

# Premium Analysis Transition — Minimum 5s Staged Experience

## Problem
Backend analysis often completes in 1-2 seconds, making the loading state barely visible. The layout is also too narrow (single-column within the post-upload block), leaving dead space on the right.

## Core Mechanism: Decouple Backend from UI Reveal

Add two new state variables:
- `analysisCompleteData`: stores the finished analysis result when backend returns early
- `uiRevealReady`: boolean, set to `true` only after minimum 5s has elapsed since upload succeeded

The flow:
1. Upload completes → record `uploadCompleteTime = Date.now()`, start analysis
2. Backend analysis finishes → store result in `analysisCompleteData` but do NOT set `hasAnalyzed = true` yet
3. A `useEffect` watches for `analysisCompleteData` being set. It calculates remaining time to reach 5s minimum from `uploadCompleteTime`, then sets a timeout to flip `uiRevealReady = true`
4. When `uiRevealReady` becomes true, apply the analysis data to state (category, sceneType, etc.) and set `hasAnalyzed = true`

The `isAnalyzingImage` from the hook will go false early, so the analysis UI gate should use a new derived boolean: `const showAnalysisUI = isAnalyzingImage || (imageUrl && !uiRevealReady && !hasAnalyzed)`.

## Layout Redesign: Full-Width Two-Column Analysis State

Replace the current analysis block (lines 439-551) with a full-width two-column grid that replaces the entire post-upload section while `showAnalysisUI` is true:

```text
┌────────────────────────────┬───────────────────────────┐
│                            │  Understanding your image │
│   Uploaded Image           │                           │
│   (large preview,          │  ✓ Image uploaded         │
│    rounded-2xl,            │  ◎ Detecting category     │
│    bg-black/5 frame)       │  ○ Detecting scene type   │
│                            │  ○ Preparing motion       │
│   "Image uploaded" badge   │                           │
│                            │  ┌─ Detection Preview ──┐ │
│                            │  │ Category: detecting…  │ │
│                            │  │ Scene: detecting…     │ │
│                            │  │ Motion: preparing…    │ │
│                            │  └──────────────────────┘ │
│                            │                           │
│                            │  ┌─ What's next ────────┐ │
│                            │  │ Skeleton chips for    │ │
│                            │  │ category + scene type │ │
│                            │  │ + motion goal cards   │ │
│                            │  └──────────────────────┘ │
├────────────────────────────┴───────────────────────────┤
│  VOVV.AI Studio assistant card (dynamic copy)          │
├────────────────────────────────────────────────────────┤
│  Skeleton sections: Product Context / Motion / Settings│
└────────────────────────────────────────────────────────┘
```

Grid: `lg:grid-cols-[1fr_1fr]` — image takes full left column, analysis card takes full right. On mobile, stacked.

## Step Progress Pacing

Slow down the step interval from 1200ms to 1500ms so 4 steps span ~4.5s, fitting naturally within the 5s minimum. Steps animate with `transition-all duration-500` for smooth entry.

## Richer Right Column

- **Detection Preview**: Show resolved labels once `analysisCompleteData` exists (while still in staged mode), transitioning from "detecting…" to the actual label with a subtle fade
- **"What we're preparing" card**: Below detection preview, show skeleton chips for category/scene and skeleton motion goal cards — signals what UI sections are coming
- **"Best results" reminder**: Small 2-line tip at the bottom of the right column

## Upload Preview Section Change

When `showAnalysisUI` is true, hide the small upload preview card at the top (lines 421-435) since the image is now shown large in the analysis grid. Show it again only after analysis reveals.

## Files to Modify

**`src/pages/video/AnimateVideo.tsx`**:
- Add `analysisCompleteData`, `uploadCompleteTime`, `uiRevealReady` state
- Modify `handleFileSelect` to record upload time and buffer analysis results
- Add `useEffect` for minimum-time gating logic
- Derive `showAnalysisUI` boolean
- Replace analysis block (lines 439-551) with full-width two-column layout
- Hide top image preview during analysis state
- Slow step interval to 1500ms

No other files need changes.

