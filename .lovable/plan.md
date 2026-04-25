## Tighten and re-skin `/features/workflows`

Five focused changes to `src/pages/features/WorkflowsFeature.tsx`.

### 1. Flagship spotlight — fix step count + cut copy

The wizard is **4 steps**, not 6 (matches `STEP_DEFS` in `ProductImages.tsx`: Product · Shots · Setup · Generate).

- Replace `wizardSteps` array with the real 4 steps:
  ```ts
  const wizardSteps = [
    { n: '01', label: 'Product',  icon: Package },
    { n: '02', label: 'Shots',    icon: Layers },
    { n: '03', label: 'Setup',    icon: Paintbrush },
    { n: '04', label: 'Generate', icon: Sparkles },
  ];
  ```
- Eyebrow above ladder: `The 4-step flow` (was 6).
- Drop the long bullet list entirely. Replace heading + paragraph + 4 bullets with a leaner block:
  - H2: `Your AI photo studio.` (drop "Product Images —")
  - One-line sub: `Upload a product. Get a full editorial shoot — category-aware, brand-consistent, ready to ship.`
  - Single CTA `Open the studio` → `/app/generate/product-images`
- Removes `flagshipBullets`, `CheckCircle2`, `ClipboardCheck` (no longer needed).

### 2. Toolkit — remove Creative Drops

Delete the Creative Drops entry from `tools` (and the now-unused `CalendarClock` import). Grid becomes 9 tools, still 3-col responsive.

### 3. Stats — update to real numbers, drop credit stat

```ts
const stats = [
  { kpi: '~2 min',   label: 'From upload to first hero shot' },
  { kpi: '35+',      label: 'Product categories supported' },
  { kpi: '1500+',    label: 'Curated scenes in the library' },
];
```

### 4. Final CTA — dark hero block (matches homepage `HomeFinalCTA`)

Replace the white border-top section with a full-width dark block in the same `bg-[#1a1a2e]` style as the homepage final CTA, including the soft slate blur orbs:

- Section: `bg-[#1a1a2e]` with two blurred slate circles (opacity-10).
- Eyebrow: `Get started` (white/50).
- H2: `Your studio is one upload away.` (white).
- Sub: `Start free. Generate your first hero shot in minutes.` (slate-400).
- Primary CTA: white pill → `/auth` (`Start free`).
- Secondary CTA: white-bordered ghost → `/pricing` (`See pricing`).

Same exact aesthetic tokens as `HomeFinalCTA.tsx` so the page closes with the brand's signature dark moment.

### 5. Cleanup

Remove unused icon imports (`CalendarClock`, `CheckCircle2`, `ClipboardCheck`, `Camera` if unused) so lint stays clean.

**Single file edited:** `src/pages/features/WorkflowsFeature.tsx`. Approve to apply.