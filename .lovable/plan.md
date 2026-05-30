Two tweaks to `src/components/app/BulkUploadReviewModal.tsx`:

1. **Push the Suggested pill fully to the right of the trigger** — the current wrapper isn't expanding to full width, so "Dresses" and "Suggested" end up centered together. Fix by:
   - Removing the inner wrapper span and laying out the trigger contents directly using `ml-auto` on the pill
   - Adding `w-full` and `text-left` on the SelectValue wrapper so the value stays pinned left
   - Result: `Dresses ............ [Suggested]  ▾`

2. **Trim the dropdown height** — list now has ~40 items so the popover feels endless. Lower `max-h-[280px]` → `max-h-[260px]`, and tighten `SelectItem` (`py-1.5`) and `SelectLabel` (`py-1`) so more entries fit in the visible area without scrolling feeling sluggish. Also shorten a couple of the longest labels (e.g. "Supplements & Wellness" → "Supplements") in the modal mapping to keep rows compact.