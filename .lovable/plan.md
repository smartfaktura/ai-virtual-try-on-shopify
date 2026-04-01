

# 3 Changes: Model Grid 6-per-row, Free User Model Toast, Default High Quality

## 1. Model grid: 6 columns per row

**Current**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` in Generate.tsx (line 3621) and `grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8` in CatalogStepModels.tsx

**New**: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6` in Generate.tsx — gives 6 on desktop, scales down nicely on mobile.

CatalogStepModels already shows 6+ so no change needed there.

### Files
- `src/pages/Generate.tsx` line 3621 — update grid classes

## 2. Free user model toast (like scene toast)

**Current** (Generate.tsx ~line 980): Free users silently replace the single model selection with no feedback.

**New**: Show `toast.info("Free plan allows 1 model per generation. Upgrade for more.")` and return `prev` (block, don't replace) — exactly like the scene handler at line 1016-1018.

### Files
- `src/pages/Generate.tsx` lines 980-984 — replace silent swap with toast + return

## 3. Default quality to `'high'`

**Current**: `useState<ImageQuality>('standard')` in Generate.tsx line 425

**New**: `useState<ImageQuality>('high')`

### Files
- `src/pages/Generate.tsx` line 425 — change default from `'standard'` to `'high'`

