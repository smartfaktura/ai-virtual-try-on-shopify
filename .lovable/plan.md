## Final, safety-checked loader-unification plan

### Re-verification done
- **73 files** import/use `Loader2`. Confirmed by `rg`.
- **Zero** Loader2 usages on public pages (`/`, `/home`, `/auth`, `/pricing`, `/discover`). Public-facing risk is near-zero.
- **2 special-case files** that need careful handling (not a blind replace):
  1. `src/components/app/DropCard.tsx:41` — `Loader2` is referenced as a **static icon in a config object** (`{ icon: Loader2, ... }`), not a `<JSX>` element. We'll wrap it with a tiny adapter (or swap the config value) so the rendered output still spins.
  2. `src/pages/admin/LoadingLab.tsx` — uses `Loader2` intentionally as the "before" comparison. **Leave that demo block intact**; rebuild the rest of the page as the canonical reference.
- **Special render shape**: `<DotPulse>` is an inline `<span>` of dots that inherits `currentColor`, while `<Loader2>` is a single SVG. Inside a few `flex` rows the centering can shift by 1–2px. The plan accounts for this by using `flex-shrink-0` and matching parent `text-*` color on the wrapper.

### Final unified system

**1. `<BrandLoaderProgressGlyph>` — Wordmark sweep**
Used for: anything **page-/route-/section-level** ("we are loading the screen").
- App-level Suspense fallbacks
- Page guards (admin/auth check on `/app/admin/loading-lab`, etc.)
- Generation hero progress
- "Loading list…" page-center placeholders (current `w-6 h-6 / w-8 h-8 text-muted-foreground` Loader2)

**2. `<DotPulse size="sm | md | lg">` — Three-dot pulse**
Used for: anything **control-/inline-level** ("this button/badge is busy").
- `sm` (default) → inside `<Button size="sm">`, badges, status pills, tiny inline rows. Replaces all `w-3 / w-3.5 / w-4 / h-4 w-4` Loader2.
- `md` → inline list footers, "Loading more…" rows. Replaces `w-5 h-5` Loader2.
- `lg` → mid-card overlays where wordmark would feel too big. Replaces some `w-6 h-6` Loader2 spots that are *not* page-level.
- Inherits `currentColor` so it works on light cards, dark sidebars, primary buttons, primary-foreground pills — all uniform.

**3. `<Skeleton>` / `AppShellLoading`** — unchanged. They handle layout placeholders, not "spinner" semantics.

**4. `<ShimmerBar>`** — unchanged. Top-of-page progress bar for long async actions.

### Phased execution (single PR, three phases)

#### Phase 1 — Global entry points
- `src/App.tsx:126` (public Suspense): swap inline `border-spinner` → `<BrandLoaderProgressGlyph fullScreen />`.

#### Phase 2 — Replace Loader2 across 73 files (mechanical)
For every match, follow this size table:

| Existing Loader2 | Replacement |
|---|---|
| `w-3` / `w-3.5` / `w-4 h-4` / `h-4 w-4` (any color) | `<DotPulse className="..." />` (keep parent text color) |
| `w-5 h-5` | `<DotPulse size="md" />` |
| `w-6 h-6` inside a centered "loading" page block | `<BrandLoaderProgressGlyph />` |
| `w-6 h-6` inside a card/overlay | `<DotPulse size="lg" />` |
| `w-8 h-8` | `<BrandLoaderProgressGlyph />` |

Rules:
- Drop `animate-spin` (DotPulse animates itself).
- Keep any `mr-1.5 / ml-2` margin classes by moving them onto the DotPulse wrapper.
- Remove `Loader2` from each file's `lucide-react` import once it's no longer referenced.
- For `DropCard.tsx`'s config-object case, change the value to a small inline wrapper (`() => <DotPulse size="sm" />`) and update the render site — preserves the icon-key API.

#### Phase 3 — Cleanup + canonical reference
- **Delete** unused brand loaders (kept the file count lean):
  - `src/components/ui/brand-loader-aperture.tsx`
  - `src/components/ui/brand-loader-frames.tsx`
  - `src/components/ui/brand-loader.tsx` (V + arc — superseded by wordmark sweep)
- Rewrite `src/pages/admin/LoadingLab.tsx` as a **single-source-of-truth** reference page documenting:
  - WordmarkSweep (page / fullScreen variants + when to use)
  - DotPulse sm/md/lg, including a **dark-sidebar mock** and **inside-button** demo
  - A small "before / after" with the legacy `Loader2` for context

### What I will NOT change
- Skeletons (layout-shape placeholders).
- ShimmerBar.
- The `BrandLoaderProgressGlyph` component itself (already production-ready).
- Any animation timing/keyframes — they already exist in `index.css`.
- Public marketing pages — none use Loader2.

### Risk assessment
- **Public pages**: zero risk (no Loader2 there).
- **In-app**: low risk — DotPulse already exists, is tested in LoadingLab, and inherits color cleanly. Worst-case visual difference is a 2–3px height delta inside a button row, fixed by `flex items-center` (already present in every site).
- **Bundle**: net negative (3 brand-loader files deleted, Loader2 still imported by lucide tree-shake when needed elsewhere).
- **Tests/storybook**: project has no test/storybook coverage on these icons.

### Files touched (estimate)
- ~73 modified (Loader2 swaps; mostly 2-line edits each)
- 1 modified: `src/App.tsx` (Suspense fallback)
- 1 rewritten: `src/pages/admin/LoadingLab.tsx`
- 3 deleted: `brand-loader-aperture.tsx`, `brand-loader-frames.tsx`, `brand-loader.tsx`

**Approve to execute the full unification in one pass.**