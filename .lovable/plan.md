

# Reduce Discover Categories to 5 & Fix Categorization

## Problem
Currently there are 6 categories (cinematic, commercial, photography, styling, ads, lifestyle) which is too granular, causing miscategorization. The AI can't reliably distinguish between them, and "More Like This" matching breaks because it depends on these categories.

## New Categories (5 total)
| Category | Covers | Description for AI |
|----------|--------|-------------------|
| **Editorial** | Cinematic + editorial + dramatic | Moody, artistic, dramatic lighting, film-like |
| **Commercial** | Product shots, studio, e-commerce | Clean product photography, studio lighting |
| **Lifestyle** | Everyday, outdoor, casual, candid | Natural settings, relatable, casual |
| **Fashion** | Styling, streetwear, outfit focus | Fashion-forward, outfit details, model-centric |
| **Campaign** | Ads, social media, promotional | Bold, eye-catching, ad-ready compositions |

## Files Changed

### 1. `src/pages/Discover.tsx`
- Replace CATEGORIES array: remove cinematic/photography/styling/ads, add editorial/fashion/campaign
- Expand SCENE_CATEGORY_MAP to cover all scene types:
  - studio → commercial, editorial
  - lifestyle → lifestyle
  - editorial → editorial
  - streetwear → fashion, lifestyle
  - fitness/athletic/gym → lifestyle, campaign
  - beauty → fashion, commercial
  - desert/outdoor/beach/garden → lifestyle, editorial
  - industrial/urban/rooftop → editorial, campaign
  - mirror/casual/cozy → lifestyle, fashion
  - professional → commercial
- Update `scoreSimilarity()`: increase tag weight to +1.5, add workflow_slug matching bonus (+2)

### 2. `src/pages/PublicDiscover.tsx`
- Same CATEGORIES and SCENE_CATEGORY_MAP changes as Discover.tsx

### 3. `supabase/functions/describe-discover-metadata/index.ts`
- Update enum to `["editorial", "commercial", "lifestyle", "fashion", "campaign"]`
- Add explicit definitions to the system prompt so AI understands each category
- Add description per enum value in the tool schema

### 4. `src/components/app/SubmitToDiscoverModal.tsx`
- Update CATEGORIES const to match the new 5 categories

### 5. `src/components/app/DiscoverDetailModal.tsx` (admin re-categorize)
- Add a category dropdown for admin users to manually fix miscategorized presets
- Simple UPDATE call on `discover_presets` table

### 6. DB migration
- Add UPDATE RLS policy on `discover_presets` for admins so re-categorization works

## Technical Details
- Existing presets with old categories (cinematic→editorial, photography→commercial, styling→fashion, ads→campaign) will still render — the filter just won't match them until re-categorized. The admin dropdown enables quick fixes.
- No data migration needed — old categories gracefully fall through to "All" tab.

