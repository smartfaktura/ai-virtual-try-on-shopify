

## Remove Unused Workflows

Delete 6 workflows the user no longer needs, keeping only: **Virtual Try-On Set**, **Product Listing Set**, **Selfie / UGC Set**, and **Flat Lay Set**.

### Workflows to Remove
1. Social Media Pack
2. Lifestyle Set
3. Website Hero Set
4. Ad Refresh Set
5. Seasonal Campaign Set
6. Before & After Set

### Changes

**1. Database -- Delete 6 workflow rows**
Run a migration to delete the rows from the `workflows` table and re-order the remaining 4:
- Virtual Try-On Set (sort 1)
- Product Listing Set (sort 2)
- Selfie / UGC Set (sort 3)
- Flat Lay Set (sort 4)

**2. Delete dedicated thumbnail components**
These components only serve the removed workflows:
- `src/components/app/SocialMediaGridThumbnail.tsx` -- only used by Social Media Pack
- `src/components/app/HeroBannerThumbnail.tsx` -- only used by Website Hero Set

**3. Clean up `workflowAnimationData.tsx`**
- Remove imports and scene entries for: Social Media Pack (comment only), Lifestyle Set, Website Hero Set (comment only), Ad Refresh Set, Seasonal Campaign Set, Before & After Set
- Remove now-unused asset imports (socialProduct, socialResult, lifestyleProduct, lifestyleScene, lifestyleResult, adProduct, adModel, adResult, seasonProduct, seasonResult, baProduct, baResult)
- Remove unused icon imports that were only used by deleted scenes

**4. Clean up `WorkflowCard.tsx`**
- Remove the conditional branches for `Social Media Pack` and `Website Hero Set` that reference the deleted thumbnail components
- Remove the imports for `SocialMediaGridThumbnail` and `HeroBannerThumbnail`

**5. Delete unused asset files**
- `src/assets/workflows/workflow-social-media.jpg`
- `src/assets/workflows/workflow-lifestyle.jpg`
- `src/assets/workflows/workflow-website-hero.jpg`
- `src/assets/workflows/workflow-ad-refresh.jpg`
- `src/assets/workflows/workflow-seasonal.jpg`
- `src/assets/workflows/workflow-before-after.jpg`
- `src/assets/workflows/social-ring-hand.jpg`
- `src/assets/workflows/social-ring-plate.jpg`
- `src/assets/workflows/social-ring-portrait.jpg`
- `src/assets/workflows/social-ring-studio.jpg`

**6. Minor reference cleanup**
- Landing page text in `LandingFAQ.tsx` mentions "Ad Refresh" and "Website Hero" as examples -- update to reference kept workflows instead
- `Changelog.tsx` mentions "Lifestyle, Studio, Flat Lay, Social Media" -- update text to reflect current workflows

### What Stays Untouched
- Virtual Try-On Set (all assets, animation data, tryon components)
- Product Listing Set (assets, animation data)
- Selfie / UGC Set (assets, animation data)
- Flat Lay Set (assets, animation data)
- All generation logic, edge functions, and Generate page code
- The `Workflows.tsx` page itself (it reads from DB, so removing DB rows is enough)

### Files Summary
- **Database**: Delete 6 rows, update sort_order on remaining 4
- **Delete**: `SocialMediaGridThumbnail.tsx`, `HeroBannerThumbnail.tsx`, 10 asset images
- **Edit**: `workflowAnimationData.tsx`, `WorkflowCard.tsx`, `LandingFAQ.tsx`, `Changelog.tsx`
