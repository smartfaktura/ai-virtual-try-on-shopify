## Add generation summary section (mobile credit visibility)

On mobile, the floating sticky pill hides the "20 credits · Balance N" hint (`hidden sm:inline`), so mobile users have no signal of the cost before tapping Generate. Add a recap section in the wizard form so the info is visible on every viewport.

### Change

Insert a new `<Section title="Summary">` between `Reference` and the admin block in the `sections` layout (`src/pages/BrandModels.tsx` around line 825), using the existing `Section` wrapper so styling matches Essentials / Appearance / Reference.

Contents (all read from existing state — no new logic):
- **Top row**: small avatar thumbnail (24×24 rounded, `previewUrl` if uploaded, else `Users` icon in `bg-muted`) + model name (or muted "New brand model" placeholder).
- **Trait chips row** (only chips with values render — same `text-[10px] uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded` style already used in `ModelCard`): gender, age, ethnicity, region, body type, hair color. Skipped silently if empty.
- **Divider** (`h-px bg-border/50 my-3`).
- **Cost + balance row** (`flex items-center justify-between text-xs`):
  - Left: `Sparkles` icon + `"3 variations · 20 credits"` (or `"3 variations · Free (Public)"` when `makePublic`).
  - Right: `text-muted-foreground` → `Balance {balance}` (hidden when `makePublic`).
- If `validationError` present (e.g. no credits), show it underneath in `text-[11px] text-destructive` — tappable when `isLowCreditsError` to open `NoCreditsModal` (reuse same handler the sticky bar uses).

### Mechanics
- Pure presentational; reads `modelName`, `previewUrl`, `gender`, `age`, `ethnicity`, `region`, `bodyType`, `hairColor`, `makePublic`, `balance`, `validationError`, `isLowCreditsError` — all already in `UnifiedGenerator` scope.
- Render only inside `if (layout === 'sections')` branch — legacy default layout still has its `inlineFooterBlock` and is unchanged.
- Keep the sticky bar as-is; this is additive context, not a replacement.

### Out of scope
- No changes to sticky bar, generation logic, validation, or other pages.
- No new icons beyond the already-imported `Sparkles`, `Users`.