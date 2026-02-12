

## Phase 4: Update All Components to Use Storage URLs

Now that all 268 images are uploaded to the `landing-assets` bucket, we need to replace static imports with storage URLs across ALL consumers — both landing page AND app components.

### Key Finding: App Components Also Use These Images

The same static assets from `src/assets/` are imported in app-side files too. Updating them is safe because:
- The images are already in storage (migration complete)
- We're just changing where the browser loads them from (bundle to CDN)
- The app will actually benefit from the same optimization (smaller bundle, lazy loading)

### Files to Update

**Landing Page Components (already planned):**

| File | What changes |
|------|-------------|
| `ModelShowcaseSection.tsx` | 44 model imports to path strings |
| `EnvironmentShowcaseSection.tsx` | ~18 scene imports to path strings |
| `ProductCategoryShowcase.tsx` | 20 showcase imports to path strings |
| `CreativeDropsSection.tsx` | ~33 drop/model imports to path strings |
| `HowItWorks.tsx` | ~12 step image imports to path strings |
| `HeroSection.tsx` | ~10 hero imports to path strings (eager, quality: 75) |
| `FinalCTA.tsx` | 10 team avatar imports to path strings |
| `StudioTeamSection.tsx` | 10 team avatar imports to path strings |
| `BeforeAfterGallery.tsx` | ~12 images to path strings |

**App Components (also need updating):**

| File | What changes |
|------|-------------|
| `data/mockData.ts` | ~175 imports (models, poses, products, scenes, templates) to storage URLs |
| `data/teamData.ts` | 10 team avatar imports to storage URLs |
| `app/workflowAnimationData.tsx` | ~10 workflow/model/pose imports to storage URLs |
| `app/TemplatePreviewCard.tsx` | 17 template imports to storage URLs |
| `app/WorkflowCard.tsx` | 1 fallback image import |
| `app/EmptyStateCard.tsx` | 3 showcase imports |
| `app/OnboardingChecklist.tsx` | 3 imports |
| `app/TryOnUploadGuide.tsx` | 6 product imports |
| `app/BrandProfileWizard.tsx` | 4 team avatar imports |
| `app/freestyle/FreestyleSettingsChips.tsx` | 1 avatar import |
| `app/RecentCreationsGallery.tsx` | 6 showcase imports |
| `app/StudioChat.tsx` | avatar imports |

### Pattern for Each File

**Before (static import):**
```typescript
import modelYuki from '@/assets/models/model-female-slim-asian.jpg';
// used as: src={modelYuki}
```

**After (storage URL):**
```typescript
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

// For data arrays:
{ name: 'Yuki', path: 'models/model-female-slim-asian.jpg' }

// In render:
src={getOptimizedUrl(getLandingAssetUrl(model.path), { quality: 60 })}
```

### Optimization Settings by Context

- **Hero section**: quality: 75, loading="eager" (above the fold)
- **Marquee/showcase images**: quality: 60, loading="lazy"
- **Team avatars**: width: 80, quality: 50, loading="lazy"
- **App thumbnails (mockData)**: quality: 60 (these are small preview images)
- **Workflow previews**: quality: 60

### Execution Order

1. Update `getLandingAssetUrl` helper (already exists, no changes needed)
2. Update `data/mockData.ts` — the biggest file, ~175 imports to URL strings
3. Update `data/teamData.ts` — 10 avatar imports
4. Update all landing page components (9 files)
5. Update all app components (8 files)
6. Test both landing page and /app sections
7. After confirmed working: delete migrated `src/assets/` folders

### What Will NOT Change

- The actual image files in storage (already uploaded)
- Any user-uploaded content (products, custom scenes) — those already use storage
- The `getOptimizedUrl` utility (already works perfectly with storage URLs)
- The `getLandingAssetUrl` utility (already created)

### Risk: Zero

- Images are already in storage and confirmed working
- We're only changing import paths, not logic
- If anything breaks, the fix is just reverting the import
- App functionality (generation, try-on, freestyle) is unaffected — those use user-uploaded images from separate buckets, not these static preview images

