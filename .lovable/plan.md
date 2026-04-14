

# Fix Short Film UI: Show Single Film, Not Separate Shots

## Problem

Kling's multi-shot endpoint produces **one combined video** from all shots. But the UI treats each shot as a separate generation:
- Progress shows "0/4 shots complete" — misleading since there's only 1 job
- Success shows 4 identical video cards (all pointing to the same URL)

## Fix

### 1. Progress Panel (`ShortFilmProgressPanel.tsx`)
- Replace "X / Y shots complete" with "Generating your film..." during processing
- Show a single indeterminate/pulsing progress bar instead of per-shot tracking
- Keep the shot plan cards visible below (as a storyboard reference) but remove per-shot status indicators during generation
- On completion: "Your short film is ready!" with no per-shot breakdown

### 2. Success Screen (`src/pages/video/ShortFilm.tsx`)
- Replace the "Generated Clips" grid (which renders N identical `<video>` elements) with a **single video player**
- Show ONE video with the combined result URL (just take the first `result_url` since they're all the same)
- Change "Download All" to just "Download" since there's one file
- Keep the "Preview Film" button (ShortFilmVideoPlayer) for the audio-overlay experience
- Below the video, optionally show the shot breakdown as text metadata (role + purpose), not as separate video cards

### 3. `completedClips` memo (`ShortFilm.tsx`)
- Deduplicate: since all shots share the same `result_url`, produce a single clip entry instead of N duplicates
- Label it "Short Film" instead of "Shot 1 -- hook"

### Files to change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Single-job progress (no per-shot counting) |
| `src/pages/video/ShortFilm.tsx` | Single video display on success, deduplicate completedClips |

