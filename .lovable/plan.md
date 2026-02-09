

## Polish: Virtual Try-On Results Step

Three changes: bigger images, remove Generation Summary, and auto-save generated images to the database for later access.

---

### 1. Make Generated Images Larger

**Problem**: The results grid uses `grid-cols-2 md:grid-cols-4` making each image tiny (especially with only 1-2 images).

**Fix**: Use responsive column logic based on image count:
- 1 image: single column, max-width ~400px, centered
- 2 images: `grid-cols-2` with larger cards
- 3-4 images: `grid-cols-2 md:grid-cols-3`
- 5+: keep current `grid-cols-2 md:grid-cols-4`

Also change the aspect ratio from `aspect-square` to `aspect-[3/4]` since try-on images are portrait-oriented.

**Changes in `src/pages/Generate.tsx`** (lines 1461-1487):
- Dynamic grid classes based on `generatedImages.length`
- Portrait aspect ratio for try-on results

---

### 2. Remove Generation Summary Card

**Problem**: The "Generation Summary" card (lines 1501-1513) shows a raw prompt string that adds no value for the user.

**Fix**: Delete the entire Generation Summary card block.

**Changes in `src/pages/Generate.tsx`** (lines 1501-1513):
- Remove the card entirely

---

### 3. Auto-Save Generated Images to Database

**Problem**: Generated images exist only in local state. If the user navigates away, they're gone. Users want to access them later for download.

**Fix**: When generation completes and images are available, automatically save each image to the `generation_jobs` table (which already exists and stores `results` as JSON, plus `user_id`, `product_id`, `workflow_id`, etc.). The generation hooks already create a job record -- we just need to ensure the results are persisted properly.

**Implementation**:
- After generation completes (when `generatedImages` are set), insert/update a `generation_jobs` row with the results array containing image URLs
- Add a "Saved to Library" toast confirmation so users know images are persisted
- The existing `/app/library` route already reads from `generation_jobs`, so images will automatically appear there

**Changes in `src/pages/Generate.tsx`**:
- Add a `useEffect` or callback after generation completes to save the job to `generation_jobs` with `results` containing the image URLs, `status: 'completed'`, `workflow_id`, `product_id`, etc.
- Show a subtle "Saved to your library" indicator in the results step
- Update the bottom action bar: replace "Publish" / "Assign to Product" with simpler "Download Selected" and "View in Library" buttons

---

### Summary of Changes

| File | Lines | Change |
|---|---|---|
| `src/pages/Generate.tsx` | 1461-1487 | Dynamic grid sizing based on image count; portrait aspect ratio |
| `src/pages/Generate.tsx` | 1501-1513 | Remove Generation Summary card |
| `src/pages/Generate.tsx` | ~440-460 (generation complete handler) | Auto-save results to `generation_jobs` table |
| `src/pages/Generate.tsx` | 1531-1542 | Simplify action buttons to Download + View in Library |

No new files or database migrations needed -- `generation_jobs` table already has the right schema.
