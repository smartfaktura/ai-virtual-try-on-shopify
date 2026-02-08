

# Advanced Brand Profiles with Wizard Setup

## Overview

Replace the current popup-based brand profile form with a full-page, step-by-step wizard. Each step focuses on one creative dimension, includes optimized prompt instructions that explain how the value impacts generation, and saves to the user's account. The brand profile data then feeds directly into all generation endpoints (Freestyle, Product, Try-On) as structured prompt context.

---

## Current State

- Brand profiles are created/edited via a modal dialog (`BrandProfileForm`) with all fields stacked in a single scrollable form
- Fields: name, description, tone, lighting style, background style, color temperature, composition bias, do-not rules
- Already integrated with Freestyle generation but not deeply with Generate (product/try-on) edge functions
- The database table `brand_profiles` already has the correct columns and RLS policies

---

## What Changes

### 1. New Database Columns (Migration)

Add richer fields to `brand_profiles` to support more detailed prompt generation:

- `color_palette text[] DEFAULT '{}'` -- hex codes or named colors (e.g., `['#F5E6D3', '#2C3E50', 'ivory']`)
- `brand_keywords text[] DEFAULT '{}'` -- words that describe the brand DNA (e.g., `['sustainable', 'handcrafted', 'heritage']`)
- `preferred_scenes text[] DEFAULT '{}'` -- scene/environment preferences (e.g., `['minimalist studio', 'outdoor natural light']`)
- `target_audience text DEFAULT ''` -- who the brand targets (e.g., `'women 25-40, eco-conscious'`)
- `photography_reference text DEFAULT ''` -- free-text field for photographic style reference notes

### 2. Full-Page Wizard (replaces modal)

Create a new route `/app/brand-profiles/new` (and `/app/brand-profiles/:id/edit`) that renders a dedicated wizard page with a stepped progress bar.

**Wizard Steps:**

| Step | Title | Fields | Prompt Impact Shown |
|------|-------|--------|-------------------|
| 1 | Brand Identity | Name, Description, Target Audience | "These anchor every prompt so the AI knows your brand's personality" |
| 2 | Visual Tone | Tone selector, Brand Keywords | Shows live preview text: e.g., selecting "luxury" displays "This adds: premium, sophisticated, elegant with refined details" |
| 3 | Lighting and Color | Lighting Style, Color Temperature, Color Palette | Shows: "Prompt will include: Soft diffused lighting, warm color temperature, palette: ivory, sage, gold" |
| 4 | Composition and Background | Background Style, Composition Bias, Preferred Scenes | Shows: "Prompt will include: studio background, centered composition" |
| 5 | Exclusion Rules | Do-Not Rules (chips with add custom), Photography Reference notes | Shows: "These are injected as negative prompts in every generation" |
| 6 | Review and Save | Summary card showing all selections with edit buttons per section | Full prompt preview showing exactly what text gets injected |

Each step will have:
- Clear heading with a one-line explanation
- A small "Prompt Impact" info box at the bottom showing exactly what text will be injected into the AI prompt based on current selections
- Back / Continue navigation buttons
- Progress indicator at the top

### 3. Brand Profile List Page Updates

- Remove the dialog-based form trigger
- "Create Profile" button now navigates to `/app/brand-profiles/new`
- "Edit" button on each card navigates to `/app/brand-profiles/:id/edit`
- Update `BrandProfileCard` to show new fields (keywords as tags, color palette as color dots)

### 4. Edge Function Prompt Enrichment

Update `generate-freestyle/index.ts` and `generate-product/index.ts` to use the new fields:

- `brand_keywords` get appended as: `"Brand DNA keywords: sustainable, handcrafted, heritage"`
- `color_palette` becomes: `"Preferred color palette: ivory, sage, gold"`
- `preferred_scenes` becomes: `"Preferred environments: minimalist studio, outdoor natural light"`
- `target_audience` becomes context for model and scene selection guidance
- `photography_reference` gets injected as supplementary creative direction

### 5. Integration with Generate Page

The existing Generate page already has brand profile selection (step 2). Enhance it to:
- Pass the new extended fields (`brand_keywords`, `color_palette`, `preferred_scenes`, `target_audience`, `photography_reference`) alongside existing fields to edge functions
- Show a richer summary when a brand profile is selected (including keywords and palette)

---

## File Changes

### New Files
- `src/components/app/BrandProfileWizard.tsx` -- The multi-step wizard component with all 6 steps, progress bar, and prompt-impact previews
- `src/lib/brandPromptBuilder.ts` -- Shared utility that takes a brand profile object and returns structured prompt text (used by both the wizard preview and edge functions)

### Modified Files
- `src/pages/BrandProfiles.tsx` -- Remove dialog state, navigate to wizard route instead
- `src/components/app/BrandProfileCard.tsx` -- Show new fields (keywords, palette colors), edit navigates to wizard
- `src/App.tsx` -- Add routes for `/app/brand-profiles/new` and `/app/brand-profiles/:id/edit`
- `src/components/app/BrandProfileForm.tsx` -- Keep for backward compat but deprecate (wizard replaces it)
- `supabase/functions/generate-freestyle/index.ts` -- Extend `BrandProfileContext` interface and `polishUserPrompt` to use new fields
- `supabase/functions/generate-product/index.ts` -- Accept and use brand profile data in `buildPrompt`
- `src/hooks/useGenerateFreestyle.ts` -- Extend `BrandProfileContext` interface with new fields
- `src/pages/Freestyle.tsx` -- Pass new brand profile fields to generation
- `src/pages/Generate.tsx` -- Pass new brand profile fields to product generation
- `src/components/app/freestyle/BrandProfileChip.tsx` -- Show richer info (keywords, palette) in the popover

### Database Migration
```sql
ALTER TABLE brand_profiles
  ADD COLUMN IF NOT EXISTS color_palette text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brand_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_scenes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_audience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS photography_reference text NOT NULL DEFAULT '';
```

---

## Wizard UX Detail

Each wizard step renders inside a centered card (max-width ~640px) with:

```text
+----------------------------------------------+
|  [=====-----]  Step 2 of 6: Visual Tone      |
+----------------------------------------------+
|                                               |
|  What tone defines your brand?                |
|  This sets the overall visual personality.    |
|                                               |
|  [luxury] [clean] [bold] [minimal] [playful]  |
|                                               |
|  Brand Keywords (optional)                    |
|  [sustainable] [handcrafted] [+Add]           |
|                                               |
|  +------------------------------------------+|
|  | PROMPT IMPACT                             ||
|  | Visual tone: luxury                       ||
|  | Brand DNA: sustainable, handcrafted       ||
|  +------------------------------------------+|
|                                               |
|  [< Back]                      [Continue >]  |
+----------------------------------------------+
```

The "Review and Save" step shows the full assembled prompt text so the user can see exactly what the AI will receive. Each section has an "Edit" button to jump back to that step.

---

## Prompt Builder Logic (`brandPromptBuilder.ts`)

This shared function generates the exact prompt text from a brand profile:

```
Input: BrandProfile object
Output: {
  styleGuide: string,    // "BRAND STYLE GUIDE:\nVisual tone: luxury..."
  negatives: string[],   // merged do-not rules
  summary: string        // human-readable summary for UI display
}
```

This is used in:
1. The wizard "Review" step to show the user what gets injected
2. Each wizard step's "Prompt Impact" preview
3. Edge functions to build the actual prompt

---

## Summary of Deliverables

1. Database migration adding 5 new columns to `brand_profiles`
2. Full-page wizard with 6 steps, prompt-impact previews, and review screen
3. Shared prompt builder utility for consistent prompt generation
4. Updated edge functions using richer brand context
5. Updated brand profile cards showing new data
6. Route updates for wizard navigation

