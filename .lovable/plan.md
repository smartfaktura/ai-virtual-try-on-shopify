

# Workflow Expansion + AI-Generated Preview Images

## Overview

Expand from 6 to 10 workflows, redesign the card grid (portrait, 4-per-row), and **generate unique AI preview images** for each workflow instead of reusing static stock photos. Preview images will be created via the AI image generation API, stored in file storage, and referenced from the database.

## Architecture

The system will:
1. Store preview image URLs in the `workflows` table (new `preview_image_url` column)
2. Use a new backend function (`generate-workflow-preview`) to create tailored preview images per workflow
3. Store generated images in a dedicated storage bucket
4. Show a "Generate Previews" admin action on the Workflows page for workflows missing images
5. WorkflowCard reads from `workflow.preview_image_url` with a fallback to existing static assets

## Changes

### 1. Database Migration

Add columns and insert new workflows:

```sql
-- Add new columns
ALTER TABLE public.workflows
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN preview_image_url text;

-- Rename and reorder existing workflows
UPDATE public.workflows SET name = 'Virtual Try-On Set', sort_order = 1
  WHERE name = 'On-Model Set';
UPDATE public.workflows SET sort_order = 2 WHERE name = 'Social Media Pack';
UPDATE public.workflows SET sort_order = 3 WHERE name = 'Product Listing Set';
UPDATE public.workflows SET sort_order = 4 WHERE name = 'Lifestyle Set';
UPDATE public.workflows SET sort_order = 5 WHERE name = 'Website Hero Set';
UPDATE public.workflows SET sort_order = 6 WHERE name = 'Ad Refresh Set';

-- Insert 4 new workflows
INSERT INTO public.workflows
  (name, description, default_image_count, required_inputs,
   recommended_ratios, uses_tryon, template_ids, is_system, sort_order)
VALUES
  ('Selfie / UGC Set',
   'Casual phone-camera style shots -- mirror selfies, coffee shops, golden-hour parks. Authentic UGC aesthetic that converts on social.',
   8, '{product,model,pose}', '{4:5,1:1}', true, '{}', true, 7),
  ('Flat Lay Set',
   'Overhead styled arrangements with curated props and clean compositions. Perfect for Instagram grids and editorial layouts.',
   8, '{product}', '{1:1,4:5}', false, '{}', true, 8),
  ('Seasonal Campaign Set',
   'Themed product shots across Spring, Summer, Autumn, and Winter settings. Generate 4/8/12 images covering every season.',
   12, '{product}', '{1:1,4:5,16:9}', false, '{}', true, 9),
  ('Before & After Set',
   'Paired transformation images showing product impact. Optimized for skincare, supplements, and wellness brands.',
   8, '{product}', '{1:1,4:5}', false, '{}', true, 10);
```

Create a storage bucket for workflow preview images:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('workflow-previews', 'workflow-previews', true);

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read access for workflow previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workflow-previews');

-- Allow authenticated users to upload (admin action)
CREATE POLICY "Authenticated users can upload workflow previews"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'workflow-previews' AND auth.role() = 'authenticated');
```

### 2. New Backend Function: `generate-workflow-preview`

**File: `supabase/functions/generate-workflow-preview/index.ts`**

This function:
- Accepts a `workflow_id` parameter
- Looks up the workflow name and description from the database
- Builds a tailored prompt for each workflow type (e.g., "Professional fashion photography of a model wearing a stylish outfit" for Virtual Try-On, "Overhead flat lay arrangement of skincare products" for Flat Lay, etc.)
- Calls the AI image generation API (`google/gemini-2.5-flash-image`) with a portrait-oriented prompt
- Uploads the resulting image to the `workflow-previews` storage bucket
- Updates the workflow row with the new `preview_image_url`

Prompt mapping per workflow:

| Workflow | AI Generation Prompt Theme |
|---|---|
| Virtual Try-On Set | A model wearing a stylish cream outfit, professional studio lighting, editorial fashion photography, portrait orientation |
| Social Media Pack | Multi-platform social media content grid, diverse lifestyle scenes, vibrant commercial photography, portrait orientation |
| Product Listing Set | Clean e-commerce product photography, marble surface, minimalist studio, soft shadows, portrait orientation |
| Lifestyle Set | Product in a cozy lifestyle setting with warm ambient lighting, candles, soft textures, portrait orientation |
| Website Hero Set | Wide cinematic fashion editorial, botanical garden backdrop, dramatic natural lighting, portrait orientation |
| Ad Refresh Set | Dynamic advertising photography, urban street style, bold colors and contrast, portrait orientation |
| Selfie / UGC Set | Casual phone-style selfie with a model holding a product, warm coffee shop setting, authentic UGC aesthetic, portrait orientation |
| Flat Lay Set | Beautiful overhead flat lay arrangement of fashion accessories on a clean white marble surface, styled props, portrait orientation |
| Seasonal Campaign Set | Four-season product photography collage -- spring blossoms, summer sunshine, autumn leaves, winter frost, portrait orientation |
| Before and After Set | Before and after skincare transformation, clean split composition, soft studio lighting, portrait orientation |

### 3. `src/pages/Workflows.tsx` -- Updated Interface, Grid, and Admin Action

- Add `sort_order` and `preview_image_url` to the `Workflow` interface
- Change query to `.order('sort_order')`
- Update grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Add a small admin button ("Generate Missing Previews") that calls the edge function for any workflow where `preview_image_url` is null
- Show a loading spinner on cards while their preview is being generated

### 4. `src/components/app/WorkflowCard.tsx` -- Portrait Layout + Dynamic Images

- Change aspect ratio from `aspect-[16/9]` to `aspect-[3/4]` (portrait)
- Use `workflow.preview_image_url` as the primary image source
- Fall back to the existing static `workflowImages` map if no generated image exists yet
- Show a subtle shimmer/skeleton state if image is being generated
- Tighten card content for the narrower 4-column grid:
  - Padding: `p-5` to `p-4`
  - Spacing: `space-y-3` to `space-y-2`
  - Title: `text-sm` to `text-xs`
  - Description: `text-xs` to `text-[11px]`
- Update the static fallback image map with the renamed "Virtual Try-On Set" and add entries for all 4 new workflows

### 5. Generate.tsx -- No Changes Needed

The Generate page matches workflows by `uses_tryon` boolean and `id`, not by name. The rename from "On-Model Set" to "Virtual Try-On Set" does not affect it.

## Flow for Preview Image Generation

```text
User clicks "Generate Previews" on Workflows page
  -> Frontend calls generate-workflow-preview edge function for each workflow missing a preview
  -> Edge function generates AI image with workflow-specific prompt
  -> Image uploaded to workflow-previews storage bucket
  -> workflow.preview_image_url updated in database
  -> React Query invalidates and cards refresh with new AI images
```

## Summary of Files

| File | Change |
|---|---|
| Database migration | Add `sort_order` + `preview_image_url` columns, rename workflow, insert 4 new rows, create storage bucket |
| `supabase/functions/generate-workflow-preview/index.ts` | New -- generates AI preview images per workflow |
| `src/pages/Workflows.tsx` | Updated interface, sort order query, 4-column grid, admin generate button |
| `src/components/app/WorkflowCard.tsx` | Portrait aspect ratio, dynamic image from DB, static fallback map updated, tighter spacing |

