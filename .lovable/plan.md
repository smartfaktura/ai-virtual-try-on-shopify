

# Rebuild History Page as Job Log

## What changes
Replace the current image-gallery History page with a **job-level activity log** showing completed generation jobs and freestyle batches as rows — each row displays the job type, image count, credits used, timestamp, status, and a thumbnail strip. Clicking a row opens the existing `LibraryDetailModal` with all images from that job.

## Design
- Dashboard-style list/card layout with rows (not an image grid)
- Each row: avatar + job type label, product/scene name, image count badge, credits used, relative timestamp, status badge, small thumbnail preview
- Tabs: All / Workflows / Freestyle (same as now)
- "Load More" pagination
- Empty state reused from current code

## Technical changes

### 1. Rewrite `src/pages/History.tsx`
- Query `generation_jobs` at **job level** (not expanding individual images): `id, results, created_at, workflow_slug, scene_name, model_name, product_name, credits_used, requested_count, status, ratio, quality, prompt_final`
- Query `freestyle_generations` grouped or as-is (each is 1 image = 1 job)
- Display as a vertical list of job cards, each showing:
  - Team avatar (same `pickAvatar` logic)
  - Job type (workflow name / Freestyle / Try-On / Enhanced)
  - Product name / scene name subtitle
  - Image count (e.g. "4 images")
  - Credits used
  - Relative time ("2 hours ago")
  - Status badge (Completed)
  - Small thumbnail strip (first 3 result images)
- Click row → open `LibraryDetailModal` with all signed images from that job
- Sign URLs via `toSignedUrls` (batch all first-images for thumbnails)
- Keep tabs (All / Workflows / Freestyle) and Load More pagination

No database or routing changes needed — same `/app/history` route, same nav item.

### Files
- `src/pages/History.tsx` — full rewrite (single file)

