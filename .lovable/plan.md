

## Creative Drops Onboarding -- Apple-Inspired Redesign

Rebuild the onboarding section to be clean, minimal, and fit within the viewport without scrolling.

---

### Problems to Fix

1. **Broken image**: `showcase/fashion-tee-lifestyle.jpg` does not exist in the asset library -- replace with verified assets
2. **Too tall**: Current layout requires scrolling to see the CTA on desktop -- everything must fit in one screen
3. **Too busy**: Glassmorphism cards with accent stripes, rotated image collage, and benefit chips create visual noise instead of elegance
4. **Mobile not optimized**: Cards stack vertically making it even taller on mobile

---

### New Design -- Apple "Feature Page" Style

**Philosophy**: Remove decoration, increase whitespace, let typography and spacing do the work. Single viewport, no scroll needed.

**Layout (top to bottom, compact):**

1. **Headline + subtitle** -- Clean, large SF-style headline with normal foreground color (no gradient text). Shorter subtitle, single line on desktop. Remove the Infinity icon -- unnecessary decoration.

2. **Three steps as a single horizontal row of minimal items** -- Not cards. Just icon + title + one-line description in a clean inline layout. No borders, no backgrounds, no accent stripes. Steps separated by subtle vertical dividers on desktop, stacked cleanly on mobile. Each step: a small circular icon container (muted bg) + title (font-medium) + description (text-muted-foreground, text-sm). This is dramatically more compact.

3. **Preview images strip** -- 5 overlapping circular thumbnails (like avatar stacks), no rotation. Use verified assets: `fashion-blazer-golden`, `skincare-serum-marble`, `food-coffee-artisan`, `skincare-cream-botanical`, `fashion-dress-garden`.

4. **CTA button** -- Clean rounded-full button, standard size, no oversized shadow. Trust line stays as subtle text below.

5. **Remove benefit chips entirely** -- They add clutter without value. The headline and steps already communicate the benefits.

---

### Technical Details

**File: `src/pages/CreativeDrops.tsx`**

Replace the `CreativeDropsOnboarding` component (lines 412-509) and supporting data (lines 378-410).

**New structure:**

```tsx
const onboardingSteps = [
  { icon: Package, title: 'Pick Products', desc: 'Choose which products get fresh visuals.' },
  { icon: Layers, title: 'Choose Workflows', desc: 'Select generation styles and formats.' },
  { icon: RefreshCw, title: 'Set & Forget', desc: 'Schedule frequency. Images arrive on time.' },
];

const previewImages = [
  getLandingAssetUrl('showcase/fashion-blazer-golden.jpg'),
  getLandingAssetUrl('showcase/skincare-serum-marble.jpg'),
  getLandingAssetUrl('showcase/food-coffee-artisan.jpg'),
  getLandingAssetUrl('showcase/skincare-cream-botanical.jpg'),
  getLandingAssetUrl('showcase/fashion-dress-garden.jpg'),
];
```

**Desktop layout**: `max-w-2xl mx-auto`, reduced spacing (`space-y-8` instead of `space-y-12`), compact step row with `flex justify-center gap-10` and dividers.

**Mobile layout**: Steps stack with `flex-col sm:flex-row`, smaller text, reduced padding (`py-6` instead of `py-12`). The entire section should fit in the visible area below the page header without scrolling.

**Animations**: Keep subtle `animate-in fade-in-0` on the container only (no per-element staggering -- cleaner).

**Removed elements**: Infinity icon, gradient text, glassmorphism cards, accent stripes, rotated image collage, benefit chips row, oversized CTA shadow.

