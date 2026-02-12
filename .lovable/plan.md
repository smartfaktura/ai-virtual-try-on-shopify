

## Migrate Static Assets to Backend Storage

### Why This Matters

All 268 landing page images are currently bundled into the app via Vite static imports. This means:
- Every visitor downloads all images upfront as part of the app bundle
- No image optimization is possible (quality/width params don't work on bundled assets)
- `loading="lazy"` has limited effect since Vite includes them in the bundle regardless
- The app bundle is likely 50-100MB+ heavier than it needs to be

### The Plan

#### Phase 1: Create a Public Storage Bucket

Create a `landing-assets` public bucket in storage with open read access (no auth needed for public landing page images).

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-assets', 'landing-assets', true);

CREATE POLICY "Public read access for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-assets');
```

#### Phase 2: Upload Script (Edge Function)

Create a one-time edge function that takes the image files and uploads them to the bucket, organized by folder:

```
landing-assets/
  models/model-female-slim-asian.jpg
  showcase/fashion-activewear-bright.jpg
  drops/drop-june-1.jpg
  hero/hero-output-beach.jpg
  products/candle-soy.jpg
  poses/pose-studio-front.jpg
  templates/clothing-studio.jpg
  team/avatar-amara.jpg
  features/feature-ai-models.jpg
  workflows/workflow-flat-lay.jpg
```

Since we can't bulk-upload from the app directly, we'll create a **migration page** (admin-only) that:
1. Imports all 268 images (they're already in the bundle)
2. Fetches each one and uploads to the storage bucket
3. Shows progress

#### Phase 3: Create URL Helper

Create a mapping utility that converts asset names to storage URLs:

```typescript
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/landing-assets`;

export function getLandingAssetUrl(path: string): string {
  return `${STORAGE_BASE}/${path}`;
}
```

This returns URLs like:
`https://xxx.supabase.co/storage/v1/object/public/landing-assets/models/model-female-slim-asian.jpg`

These URLs work with `getOptimizedUrl` for quality/width optimization.

#### Phase 4: Update All Landing Components

Replace every static import with the URL helper. For each component:

**Before:**
```typescript
import modelYuki from '@/assets/models/model-female-slim-asian.jpg';
// ...
<img src={modelYuki} />
```

**After:**
```typescript
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
// ...
<img
  src={getOptimizedUrl(getLandingAssetUrl('models/model-female-slim-asian.jpg'), { quality: 60 })}
  loading="lazy"
  decoding="async"
/>
```

**Files to update (10 components):**

| Component | Images | Optimization |
|-----------|--------|-------------|
| `ModelShowcaseSection.tsx` | 44 models | quality: 60, lazy |
| `EnvironmentShowcaseSection.tsx` | ~18 scenes | quality: 60, lazy |
| `ProductCategoryShowcase.tsx` | ~20 products | quality: 60, lazy |
| `CreativeDropsSection.tsx` | ~33 drops | quality: 60, lazy |
| `HowItWorks.tsx` | ~12 step images | quality: 60, lazy |
| `HeroSection.tsx` | ~10 hero images | quality: 75, **eager** (above fold) |
| `FinalCTA.tsx` | 10 team avatars | width: 80, quality: 50, lazy |
| `StudioTeamSection.tsx` | 10 team avatars | quality: 60, lazy |
| `BeforeAfterGallery.tsx` | ~12 images | quality: 60, lazy |
| `LandingPricing.tsx` | if any images | quality: 60, lazy |

#### Phase 5: Remove Static Assets

Once everything works from storage, delete the `src/assets/` folders that were migrated. This dramatically shrinks the app bundle.

#### Phase 6: Delete Migration Page

Remove the one-time admin migration page and edge function.

### Data Constants Approach

For the model/environment arrays (like `ROW_1`, `ROW_2`), we'll switch from imported images to string paths:

**Before (44 import statements):**
```typescript
import modelYuki from '@/assets/models/model-female-slim-asian.jpg';
// ... 43 more imports
const ROW_1 = [{ name: 'Yuki', image: modelYuki }, ...];
```

**After (zero imports, just data):**
```typescript
const ROW_1 = [
  { name: 'Yuki', path: 'models/model-female-slim-asian.jpg' },
  // ...
];
```

Then in the render: `src={getOptimizedUrl(getLandingAssetUrl(model.path), { quality: 60 })}`

### Expected Impact

- App bundle size: reduced by 50-100MB+ (all images removed from bundle)
- Initial page load: only hero images loaded eagerly, everything else lazy
- Image quality control: full `getOptimizedUrl` support (quality + width params)
- Marquee images (132 elements): served at quality 60 instead of full resolution
- Team avatars (40px): served at width 80, quality 50

### Execution Order

1. Create storage bucket (SQL migration)
2. Build migration page + edge function
3. Run migration (upload all 268 images)
4. Create `getLandingAssetUrl` utility
5. Update all 10 landing components (remove imports, use URL helper)
6. Test everything works from storage
7. Delete `src/assets/` folders for migrated images
8. Delete migration page and edge function

### Risk Mitigation

- We keep static imports working until storage is confirmed
- Hero section uses `eager` loading to maintain fast first paint
- Public bucket means no auth required for landing page visitors
- CDN caching ensures fast repeat visits

