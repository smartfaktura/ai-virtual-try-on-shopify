

# Rebuild History as Job-Grouped Cards (like Recent Creations)

## Problem
The current History page shows flat rows — each generation job appears as a single row with small thumbnails. The user wants it to match the "Recent Creations" card layout from `/app/workflows`: each job is a **card** with a main thumbnail, a mini-thumbnail strip showing additional images, image count, and clicking opens the `LibraryDetailModal` with ALL images from that job.

## Design
- Replace the flat list layout with a **grid of cards** (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Each card = one generation job or one freestyle generation
- Card layout matches `WorkflowRecentRow`'s `ThumbnailCard`:
  - Square main thumbnail (first image from the job)
  - Mini-thumbnail strip below (up to 3 small squares + "+N" overflow)
  - Label (workflow name / "Freestyle" / "Product Images")
  - Relative timestamp ("about 1 hour ago")
  - Hover overlay with Eye + "View"
- Clicking a card opens `LibraryDetailModal` with ALL signed images from that job
- Keep the tabs (All / Workflows / Freestyle) and Load More pagination
- Sign all URLs in batch via `toSignedUrls`

## Technical changes

### `src/pages/History.tsx` — full rewrite
- Keep the `useHistoryJobs` hook structure (fetching `generation_jobs` + `freestyle_generations`)
- Change data model: each `HistoryJob` stores ALL image URLs (not just first 4 thumbnails)
- Replace the row-based `HistoryJobList` with a grid of cards that mirror the `ThumbnailCard` pattern from `WorkflowRecentRow`
- Each card: square aspect ratio main image, mini-thumb strip, workflow label, timestamp
- Click → open `LibraryDetailModal` with all images from that job, with `initialIndex` support for clicking specific mini-thumbs
- Remove avatar column (not in the Recent Creations pattern)
- Keep tabs + "Load More"

Single file change.

