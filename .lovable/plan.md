

# Redesign Discover Detail Modal

## Summary of Changes

Remove clutter (category label, aspect ratio, prompt section, copy button, generate-prompt-from-image button). Add product thumbnail row. Show workflow name prominently as "VIRTUAL TRY-ON SET WORKFLOW". Keep scene/model thumbnails with small square previews.

## Database Migration

Add `product_name` and `product_image_url` columns to `discover_presets`:

```sql
ALTER TABLE public.discover_presets
  ADD COLUMN product_name text,
  ADD COLUMN product_image_url text;
```

## File Changes

### 1. `src/hooks/useDiscoverPresets.ts`
Add `product_name` and `product_image_url` to the `DiscoverPreset` interface.

### 2. `src/components/app/DiscoverDetailModal.tsx` — Major cleanup

**Remove:**
- Category label (line 166-193 — the "fashion" text and admin category selector stays for admin only, hidden for regular users)
- Aspect ratio display (lines 210-217 — "4:5" text)
- Entire "Generate Prompt from Image" section (lines 258-293)
- Entire "Prompt" section (lines 296-311)
- "Copy" button from secondary actions (lines 346-353)
- Remove unused imports: `Copy`, `Sparkles`, `Loader2`, `convertImageToBase64`
- Remove `generatedPrompt`, `isGenerating`, `handleGeneratePrompt`, `handleCopy`, `handleCopyGenerated`, `handleUseGenerated` state/functions

**Update "Created with" section:**
- Show workflow name prominently: e.g. "VIRTUAL TRY-ON SET WORKFLOW" as a label above the thumbnails
- Scene thumbnail: square `w-10 h-10 rounded-lg` with `object-cover` (using optimized small URL)
- Model thumbnail: same size `w-10 h-10 rounded-full`
- Product thumbnail: same size `w-10 h-10 rounded-lg` — new row if `product_name` exists
- If no workflow/scene/model → show "FREESTYLE" as the workflow label

**Keep:**
- Title
- View count
- Tags
- "Recreate this" primary CTA (unchanged)
- Save, Similar, Feature (admin), Delete (admin) secondary buttons
- "More like this" related items grid
- Admin category selector (only visible to admins)

### 3. `src/components/app/PublicDiscoverDetailModal.tsx` — Mirror changes

Same removals: category label, aspect ratio, prompt section. Same "Created with" section updates with product row. Keep the signup CTA.

### 4. `src/components/app/AddToDiscoverModal.tsx`

Accept and insert `productName` and `productImageUrl` props.

### 5. `src/components/app/LibraryDetailModal.tsx`

Pass product metadata to `AddToDiscoverModal` if available from the library item.

### 6. Edge functions (`generate-tryon`, `generate-workflow`)

Store `product_name` and `product_image_url` in `generation_jobs` when generating (requires adding those columns to `generation_jobs` too — second migration).

### 7. `src/hooks/useLibraryItems.ts`

Select and map `product_name`, `product_image_url` from `generation_jobs`.

## Second Migration — `generation_jobs`

```sql
ALTER TABLE public.generation_jobs
  ADD COLUMN product_name text,
  ADD COLUMN product_image_url text;
```

