

## Add Shimmer Loading States to All Image Components

### Problem
Most image-heavy components render raw `<img>` tags without any loading placeholder. When images load from cloud storage, they appear in chunks — giving a "laggy", broken feel. Only 3 components (LibraryImageCard, DiscoverCard, FreestyleGallery) currently have shimmer loading states.

### Solution: Reusable `ShimmerImage` Component

Create a single reusable `ShimmerImage` component that wraps any `<img>` with the existing shimmer animation. This avoids duplicating `useState`/`onLoad` logic across 15+ files.

```text
ShimmerImage
  - Shows a shimmer placeholder (bg-muted + animate-shimmer gradient) while loading
  - On image load, crossfades to the real image (300ms opacity transition)
  - Accepts all standard img props + optional aspectRatio for placeholder sizing
  - Falls back gracefully if image fails to load
```

### Components to Update

**Landing Page (public-facing, high impact):**

| Component | Images affected |
|-----------|----------------|
| HeroSection | Product upload card + 8 output carousel cards |
| ModelShowcaseSection | 44+ model cards in marquee rows |
| BeforeAfterGallery | Output images + PiP inset originals |
| ProductCategoryShowcase | Category grid images |
| EnvironmentShowcaseSection | Environment preview images |
| StudioTeamSection | Team member avatars |
| CreativeDropsSection | Drop preview images |

**App (authenticated, functional):**

| Component | Images affected |
|-----------|----------------|
| ModelSelectorCard | Model preview thumbnails in generation flow |
| PoseSelectorCard | Pose/scene thumbnails in generation flow |
| WorkflowAnimatedThumbnail | Background image + floating chip images |
| RecentCreationsGallery | Dashboard recent images |
| ProductImageGallery | Product detail images |
| TryOnPreview | Try-on result preview |

### Technical Details

**Step 1: Create `src/components/ui/shimmer-image.tsx`**

A lightweight wrapper component:
- Uses `useState(false)` for `loaded` state
- Renders a shimmer div (using existing Tailwind `animate-shimmer` keyframe) as placeholder
- Renders the `<img>` with `onLoad` callback to flip state
- Uses `opacity-0`/`opacity-100` with `transition-opacity duration-300` for smooth crossfade
- Accepts `className`, `aspectRatio` (for placeholder sizing), and all standard `<img>` props
- Accepts optional `onError` fallback

**Step 2: Update landing page components**

Replace raw `<img>` tags with `ShimmerImage` in:
- `HeroSection.tsx` — product card image + output carousel images
- `ModelShowcaseSection.tsx` — marquee model cards
- `BeforeAfterGallery.tsx` — output + PiP images
- `ProductCategoryShowcase.tsx` — category images (these already stack, add shimmer to initial load)
- `EnvironmentShowcaseSection.tsx` — environment cards
- `CreativeDropsSection.tsx` — drop previews

**Step 3: Update app components**

Replace raw `<img>` tags with `ShimmerImage` in:
- `ModelSelectorCard.tsx` — model preview in generation
- `PoseSelectorCard.tsx` — pose preview in generation
- `WorkflowAnimatedThumbnail.tsx` — background image + floating element images
- `RecentCreationsGallery.tsx` — dashboard thumbnails
- `ProductImageGallery.tsx` — product detail images

**Step 4: Migrate existing implementations**

Refactor `LibraryImageCard`, `DiscoverCard`, and `FreestyleGallery` to use `ShimmerImage` instead of their custom inline `loaded`/`onLoad` logic, reducing code duplication.

### Shimmer Placeholder Behavior

```text
Before load:
+-------------------+
|  ~~~shimmer~~~    |  <- bg-muted with animated gradient sweep
|  ~~~shimmer~~~    |     (uses existing animate-shimmer keyframe)
+-------------------+

After load (300ms crossfade):
+-------------------+
|                   |
|   actual image    |
|                   |
+-------------------+
```

### Files Changed

| File | Action |
|------|--------|
| `src/components/ui/shimmer-image.tsx` | **Create** -- reusable shimmer image component |
| `src/components/landing/HeroSection.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/landing/ModelShowcaseSection.tsx` | Update marquee `<img>` to `<ShimmerImage>` |
| `src/components/landing/BeforeAfterGallery.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/landing/ProductCategoryShowcase.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/landing/EnvironmentShowcaseSection.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/landing/CreativeDropsSection.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/app/ModelSelectorCard.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/app/PoseSelectorCard.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/app/WorkflowAnimatedThumbnail.tsx` | Update background + chip `<img>` to `<ShimmerImage>` |
| `src/components/app/RecentCreationsGallery.tsx` | Update `<img>` to `<ShimmerImage>` |
| `src/components/app/LibraryImageCard.tsx` | Refactor to use `<ShimmerImage>` (remove inline logic) |
| `src/components/app/DiscoverCard.tsx` | Refactor to use `<ShimmerImage>` (remove inline logic) |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Refactor to use `<ShimmerImage>` (remove inline logic) |

