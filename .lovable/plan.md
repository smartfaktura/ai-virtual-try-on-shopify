

## Fix: Show All Result Images in Recent Creations

### The Problem

The Recent Creations gallery on the dashboard shows only **1 image per job**, even when a job produced multiple results (e.g., 4 try-on variations). The Library page correctly shows all of them because it loops through every result. That is why you see 6+ images in Library but only 2 on the dashboard.

### The Fix

Change the result extraction logic to push **every valid result URL** as a separate gallery card (matching how Library works), instead of just taking the first one.

### Technical Details

**File: `src/components/app/RecentCreationsGallery.tsx` (lines 50-74)**

Replace the "extract first URL" logic with a loop that pushes all valid URLs:

```text
Before:  Extract first non-base64 URL -> break -> push 1 item per job

After:   Loop through ALL results -> push each as its own card (id: job.id-0, job.id-1, etc.)
         Still skip base64 data URIs
         Fall back to product image only if zero valid result URLs found
```

This matches the exact same pattern already used in `useLibraryItems.ts` (lines 37-60).

### What This Fixes

- A job with 4 try-on results will show as 4 separate cards (not 1)
- Dashboard Recent Creations will match what you see in Library
- The `.limit(5)` on the query plus `.slice(0, 10)` at the end keeps the gallery from getting too long
