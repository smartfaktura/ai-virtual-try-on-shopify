

## Creative Drops -- Complete End-to-End Plan

This plan covers everything from the wizard configuration experience to how customers receive, browse, and download their drops. It includes database changes, a new multi-step wizard, an enhanced drops gallery/detail view, bulk download capability, and accurate credit calculation logic.

---

### Part 1: Database Schema Changes

**Migration: Add new columns to `creative_schedules`**

| Column | Type | Purpose |
|--------|------|---------|
| `theme` | TEXT (default `'custom'`) | Seasonal/occasion tag: spring, summer, autumn, winter, holiday, back_to_school, valentines, black_friday, custom |
| `theme_notes` | TEXT (default `''`) | Free-text brief or special instructions |
| `images_per_drop` | INTEGER (default 25) | Total images generated per drop cycle |
| `model_ids` | UUID[] (default `'{}'`) | Preferred AI models for try-on/UGC workflows |
| `scene_config` | JSONB (default `'{}'`) | Per-workflow scene/category preferences |
| `start_date` | TIMESTAMPTZ (default `now()`) | When drops begin |
| `estimated_credits` | INTEGER (default 0) | Pre-calculated credit cost per drop |
| `include_freestyle` | BOOLEAN (default false) | Whether to include freestyle/custom prompt generations |
| `freestyle_prompts` | TEXT[] (default `'{}'`) | Custom prompts for freestyle mode |

**Migration: Add new columns to `creative_drops`**

| Column | Type | Purpose |
|--------|------|---------|
| `credits_charged` | INTEGER (default 0) | Actual credits deducted for this drop |
| `total_images` | INTEGER (default 0) | Number of images generated |
| `download_url` | TEXT (nullable) | Pre-built ZIP download URL |
| `images` | JSONB (default `'[]'`) | Array of `{url, workflow_name, scene_name, product_title}` for gallery display |

---

### Part 2: Credit Calculation Logic

The cost calculator will be a shared utility function used by both the wizard (preview) and the backend (actual charge).

**Logic (`src/lib/dropCreditCalculator.ts`):**

```text
For each selected workflow:
  base_cost =
    - Product Listing: 4 credits/image (no model)
    - Flat Lay: 4 credits/image (no model)
    - Virtual Try-On: 12 credits/image (has model)
    - Selfie / UGC: 12 credits/image (has model)
    - Mirror Selfie: 12 credits/image (has model)
    - If model + custom scene selected: 15 credits/image

  images_for_workflow = images_per_drop / number_of_workflows (distributed evenly, remainder to first)

total_credits = sum of (images_for_workflow * base_cost) for each workflow
```

The wizard shows the estimated cost in real-time as users change selections. When the schedule is saved, `estimated_credits` is stored. Credits are charged at drop execution time (not at schedule creation) -- but the wizard clearly shows "~X credits will be deducted per drop."

---

### Part 3: Creative Drop Wizard (5 Steps)

**New file: `src/components/app/CreativeDropWizard.tsx`**

Replaces the current `ScheduleForm` dialog. Opens as a large dialog (max-w-2xl) or full-page depending on screen size.

**Step 1 -- Name and Theme**
- Schedule name input
- Theme grid: 9 visual chip buttons (Spring, Summer, Autumn, Winter, Holiday, Black Friday, Back to School, Valentine's, Custom) each with an icon/emoji
- Brand Profile dropdown (from existing `brand_profiles`)
- Optional notes textarea ("Any special instructions for this drop?")

**Step 2 -- Select Products**
- Toggle: "All my products" vs "Choose specific products"
- When specific: reuse the existing `ProductMultiSelect` pattern with product thumbnails fetched from `user_products`
- Show count badge: "X products selected"

**Step 3 -- Select Workflows**
- Visual cards for each of the 5 workflows (Product Listing, Virtual Try-On, Selfie/UGC, Flat Lay, Mirror Selfie)
- Each card: preview thumbnail, name, short description, checkbox
- Multi-select with checkboxes
- Per-workflow expandable accordion for advanced settings:
  - **Product Listing / Flat Lay**: scene category filter chips (Studio, Lifestyle, Editorial, etc.)
  - **Virtual Try-On / UGC / Mirror Selfie**: model picker (thumbnails from `custom_models`), scene picker
- Optional: "Include freestyle creations" toggle with a textarea for custom prompts

**Step 4 -- Frequency and Volume**
- Frequency selector: Monthly, Biweekly, Weekly, One-time
- Image count: preset chips (10, 25, 50, 100) + custom input
- Start date picker
- **Live credit cost estimate** card showing:
  - Breakdown by workflow (e.g., "Product Listing: 5 images x 4 credits = 20")
  - Total per drop
  - Monthly projection based on frequency
  - Current balance vs cost comparison with warning if insufficient

**Step 5 -- Review and Confirm**
- Summary card with all selections
- Timeline preview showing next 3 scheduled drop dates
- Total credit cost highlighted
- "Create Schedule" button
- Note: "Credits are deducted when each drop runs, not now"

---

### Part 4: Enhanced Drops Gallery and Detail View

**Enhanced `CreativeDrops.tsx` page -- 3 tabs instead of 2:**

1. **Schedules** (existing, enhanced) -- schedule cards with theme badge, credit estimate, edit/delete actions
2. **Drops** (existing, enhanced) -- drop cards now expandable to show image gallery
3. **Calendar** (new) -- visual month calendar showing upcoming and past drops as dots/badges

**New component: `DropDetailModal.tsx`**
When a user clicks a completed drop card:
- Full-screen modal/page showing all generated images in a masonry grid
- Each image shows: workflow badge, scene name, product name on hover
- Selection checkboxes on each image for selective download
- Top bar: "Download All (ZIP)" button, "Download Selected" button, image count
- Filter chips by workflow type
- Individual image actions: download single, copy URL, save to library, regenerate

**Enhanced `DropCard.tsx`:**
- Schedule cards: show theme badge (e.g., "Summer" in warm colors), estimated credits, image count, mini workflow icons
- Drop cards: show thumbnail previews (first 3-4 images), total image count, credits charged, download button

---

### Part 5: Download System

**Approach: Client-side ZIP generation using existing `jszip` dependency**

When user clicks "Download All":
1. Fetch all image URLs from the drop's `images` JSONB array
2. Download each image as blob
3. Organize into folders by workflow name (e.g., `/Product Listing/scene_name_1.jpg`)
4. Generate ZIP using jszip
5. Trigger browser download

**New utility: `src/lib/dropDownload.ts`**
- `downloadDropAsZip(drop)` -- downloads all images as organized ZIP
- `downloadSelectedImages(images)` -- downloads selected subset
- Progress callback for UI progress bar

---

### Part 6: File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/app/CreativeDropWizard.tsx` | **NEW** | 5-step wizard component |
| `src/components/app/DropDetailModal.tsx` | **NEW** | Full gallery view for completed drops |
| `src/lib/dropCreditCalculator.ts` | **NEW** | Shared credit estimation logic |
| `src/lib/dropDownload.ts` | **NEW** | ZIP download utilities |
| `src/pages/CreativeDrops.tsx` | **MODIFY** | Replace ScheduleForm with wizard, add calendar tab, enhance drop cards |
| `src/components/app/DropCard.tsx` | **MODIFY** | Add theme badges, credit info, thumbnail previews, download button |
| `src/components/app/ScheduleForm.tsx` | **REMOVE** | Replaced by CreativeDropWizard |
| DB migration | **NEW** | Add columns to creative_schedules and creative_drops |

---

### Part 7: Implementation Order

1. Database migration (add all new columns)
2. Credit calculator utility
3. Creative Drop Wizard (steps 1-5)
4. Update CreativeDrops page to use wizard
5. Enhanced DropCard with theme/credits/thumbnails
6. DropDetailModal with image gallery
7. Download system (ZIP generation)
8. Calendar tab view

