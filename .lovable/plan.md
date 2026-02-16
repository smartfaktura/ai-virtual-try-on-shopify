
## Fix Recent Jobs Images + Enrich Upcoming Drops Card

### Problem 1: Recent Jobs -- Broken Thumbnails

Most jobs have `product_id: null` (workflow-only jobs). The current thumbnail logic:
```tsx
getOptimizedUrl(job.user_products?.image_url, ...) 
|| (Array.isArray(job.results) && (job.results as any[])[0]?.url)
|| '/placeholder.svg'
```

`getOptimizedUrl(null)` returns `''` (empty string), which is falsy -- good. But the fallback tries `.url` on results items. The `results` column stores plain string URLs like `["https://...png"]`, not objects like `[{url: "..."}]`. So `.url` is always `undefined`, and we get `placeholder.svg`.

**Fix**: Change the fallback to access `job.results[0]` directly (it's already a URL string), then optimize it.

### Problem 2: Recent Jobs -- Missing "View Results" Action

Completed jobs have no action button -- the Actions column is empty unless the job failed. Add a "View" button that navigates to the results page.

### Problem 3: Upcoming Drops -- Too Little Info

Currently shows only schedule name, frequency, and "Next run: Pending". The user wants to know about actual drops -- are they done, can they be downloaded, what's the status.

**Fix**: Instead of showing the next schedule, fetch the most recent `creative_drops` record and show:
- Drop status (generating, ready, failed)
- Image count and credits used
- Download availability (if `download_url` exists or status is `ready`)
- If generating, show progress indicator

Also keep the schedule info but enrich it.

---

### Technical Changes

**File: `src/pages/Dashboard.tsx`** (Recent Jobs section, lines 329-370)

Fix the thumbnail fallback logic:
```tsx
// Before:
getOptimizedUrl(job.user_products?.image_url, { width: 80, quality: 50 })
|| (Array.isArray(job.results) && (job.results as any[])[0]?.url)
|| '/placeholder.svg'

// After:
const firstResult = Array.isArray(job.results) ? (job.results as string[])[0] : null;
const thumbUrl = job.user_products?.image_url || firstResult;
// Then use getOptimizedUrl(thumbUrl, { width: 80, quality: 50 }) || '/placeholder.svg'
```

Add a "View" button for completed jobs in the Actions column that navigates to the generate page with the job's workflow.

**File: `src/components/app/UpcomingDropsCard.tsx`**

Expand the query to also fetch the most recent `creative_drop` alongside the next schedule. Show:
- If a drop exists and is `generating`: pulsing dot + "Generating 40 images..." with schedule name
- If a drop exists and is `ready`/`completed`: "Ready to download" with image count and a Download button (if `download_url` exists)
- If a drop exists and is `failed`: "Drop failed" with retry info
- Below the drop info, still show the next scheduled run date
- If no drops exist, show the current empty-state setup prompt

The card will query both `creative_drops` (latest 1) and `creative_schedules` (next active) to provide a complete picture.

---

### Summary

- 2 files modified: `Dashboard.tsx`, `UpcomingDropsCard.tsx`
- No new dependencies
- No database changes
- Fixes broken thumbnail rendering by correctly accessing string array results
- Adds actionable info to the Upcoming Drops card (status, download availability, image counts)
