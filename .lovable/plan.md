## Polish pass — `/app/models` and `/app/models/new`

### 1. Header layout on `/app/models/new`
Current `PageHeader` puts back button inline with the title (sm: same row). On wide screens it produces the awkward "Brand Models  New brand model" alignment in the screenshot.

Use a local header inside `BrandModelNew.tsx` instead of `PageHeader`:
- Row 1: back button alone (`ghost`, `<ArrowLeft/>` + "Brand Models").
- Row 2: `<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">New brand model</h1>`.
- Row 3: subtitle `<p class="text-base text-muted-foreground mt-1.5">Describe the person you want VOVV.AI to create</p>`.
- Wrap UnifiedGenerator below (no PageHeader wrapper).

### 2. Hide StudioChat launcher on /app/models routes (mobile only)
In `src/components/app/StudioChat.tsx`, extend `hideOnMobile` to include:
- `/app/models`
- `/app/models/new`

Desktop stays unchanged.

### 3. Sticky bar — match other workflows
Current bar in `BrandModels.tsx` (sections layout) still differs from peer flows. Align to the **Generate.tsx** pattern (the canonical "Product Visuals" sticky bar):

```
fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30 lg:left-60
```

Inner container: `max-w-7xl mx-auto flex items-center justify-between` (matches Generate exactly). Drop the `backdrop-blur` and `bg-background/95` (those are BundleVisuals' lighter style; user wants the Generate / Product Visuals look since that's the dominant workflow pattern).

Mobile stacking stays (flex-col → flex-row at sm).

### 4. Generate button copy + icon
In sections-layout sticky footer:
- Button label: `Generate brand model` → **`Generate`**.
- Public variant: `Generate (free)` → **`Generate · free`** (keeps free signal without the parenthetical).
- Remove the `<Wand2/>` icon.
- Drop the `gap-2` class since no icon.

### 5. Empty state — use real full-body model photos
Current uses `TEAM_MEMBERS` avatar headshots (160px square crops). Replace with three real brand-model portraits already shipped under `getLandingAssetUrl('models/...')` (referenced in `src/data/mockData.ts`):

- `models/model-female-slim-nordic.jpg`
- `models/model-male-athletic-european.jpg`
- `models/model-female-athletic-indian.jpg`

Render as a horizontal strip of three `aspect-[3/4]` portrait cards (`w-24` each, `rounded-xl`, subtle `ring-1 ring-border/60`, slight `-ml-3` overlap with `ring-2 ring-background` for cohesion). This matches what the actual `ModelCard` looks like once populated, so the empty state previews the real output format — not avatar circles.

Use `getLandingAssetUrl` directly (import in `BrandModels.tsx`); no new TEAM_MEMBERS coupling.

### Files
- `src/pages/BrandModelNew.tsx` — replace `PageHeader` with local header block.
- `src/components/app/StudioChat.tsx` — extend `hideOnMobile` route list.
- `src/pages/BrandModels.tsx`
  - Empty state: swap avatars for 3 full-body portraits via `getLandingAssetUrl`.
  - Sticky footer: align classes to Generate pattern, drop icon, shorten label.

### Out of scope
- No DB/edge changes.
- No populated-grid changes.
- No StudioChat desktop visibility change.