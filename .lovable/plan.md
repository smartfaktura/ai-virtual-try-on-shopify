## Three fixes — Brand Model generation flow

### 1. "Generation happens server-side..." copy — change intent

Current copy says navigate away and "your model will appear here when ready" — wrong, because the user still needs to choose between 3 variations before saving. Replace in both places it appears (loader and inline footer):

- Loader (`BrandedLoadingState`, line ~191-196): change to **"Stay on this page — you'll pick your favorite of 3 variations next"** with the same `Info` icon styling.
- Inline footer block (line ~811-816): same replacement copy.

### 2. Variation picker — clean up the cramped layout

The end-results screen currently stacks: page title → page subtitle → "Choose the Best Variation" → meta line → 3 images → buttons, all packed tightly. Restructure for breathing room (lines ~419-489):

- Wrap the whole picker in the same `Card` container the Generate loader uses (`<Card><CardContent className="p-8 sm:p-10 space-y-8">`) so it visually separates from the page heading.
- Header: `text-lg font-semibold` (was `text-base`), subtitle `text-xs text-muted-foreground` with more space (`space-y-1.5`).
- Image grid: increase gap from `gap-3` → `gap-4 sm:gap-5`, give container `mt-2`.
- Action row: keep two buttons but give it `pt-4 border-t border-border/50` separator and `gap-3`.
- Button labels:
  - Save flow: **"Save as Brand Model"** (no `(20 credits)` suffix — already shown elsewhere, redundant).
  - Public flow: keep "Publish as Public Model" (already clean).
- Keep `Check`/`Star` icons on the primary buttons.

### 3. Loading animation — match the canonical Generate.tsx pattern

The current `BrandedLoadingState` uses a 32×32 carousel of team-avatar squares with rotating names. The rest of the product (`Generate.tsx` line ~4417) uses a much simpler, consistent pattern:

```tsx
<Card><CardContent className="p-10 flex flex-col items-center gap-6">
  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 animate-pulse-subtle">
    <img src={…} className="w-full h-full object-cover" />
  </div>
  <div className="text-center">
    <h2 className="text-lg font-semibold">Creating Your Images…</h2>
    <p className="text-sm text-muted-foreground mt-1">…subtitle…</p>
  </div>
  <Progress … />
</Card>
```

Rebuild `BrandedLoadingState` to follow this:
- `<Card><CardContent className="p-10 flex flex-col items-center gap-6">` wrapper (matches Generate loader card).
- Single circular avatar `w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20 animate-pulse-subtle`. Use the reference photo if uploaded, else first `TEAM_MEMBERS` avatar — no carousel, no rotating name chip.
- Title: `text-lg font-semibold` → **"Creating your brand model…"** (matches Generate's "Creating Your Images…" cadence).
- Subtitle: `text-sm text-muted-foreground mt-1` → cycles through `LOADING_TIPS` (keep tip rotation, drop the "overtime" copy unless `ratio >= 1.3`).
- `Progress` bar `h-2` + small `Est. ~1–2 min · Ns elapsed` row underneath (matches Generate batch progress row).
- Drop: the 6-dot progress-step indicator, the avatar carousel pulse ring, the name/expertise tag.
- Server-side info pill: replace copy per fix #1.

Accept an optional `previewUrl?: string` prop so the loader can show the user's reference photo when present; default to first TEAM_MEMBER avatar otherwise. Pass `previewUrl` from `UnifiedGenerator` where `BrandedLoadingState` is rendered (line ~492).

### Files

- `src/pages/BrandModels.tsx`
  - Rewrite `BrandedLoadingState` (lines 99-199) per fix #3.
  - Pass `previewUrl` when rendering it (line ~492): `<BrandedLoadingState previewUrl={previewUrl ?? undefined} />`.
  - Update inline footer info-pill copy (line ~813) per fix #1.
  - Restructure variation picker JSX (lines 419-489) per fix #2 + drop `(20 credits)` from save button label.

### Out of scope
- No changes to generation logic, edge functions, credit handling, or other pages.
- No changes to the sticky bar from previous turn.