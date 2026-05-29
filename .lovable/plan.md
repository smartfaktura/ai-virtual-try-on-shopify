## Scope
`/app/video/animate` and `/app/video/start-end` look inconsistent: cramped header, random Beta pill, and a non-floating Generate bar that sits inline at the very bottom instead of staying anchored above the fold. Make both pages share an identical chrome — same wrapper width / rhythm, same header treatment (with optional inline badge), and a properly floating Generate bar matching the project's existing pattern (`src/components/app/product-images/ProductImagesStickyBar.tsx`).

No backend, pipeline, settings, or business-logic changes.

## Changes

### 1. `src/components/app/PageHeader.tsx` — support an inline badge next to the title
Add an optional `titleBadge?: React.ReactNode` prop and render it inline next to the `<h1>` (after the title, same row, vertically centered). Default `undefined` so all existing callers are unaffected.

```tsx
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
{titleBadge && <span className="inline-flex">{titleBadge}</span>}
```

(`titleBadge` lives inside the same `flex flex-col sm:flex-row sm:items-center` row as the back button + title.)

### 2. `src/pages/video/StartEndVideo.tsx` — header, wrapper, floating CTA
- Wrapper: `max-w-4xl mx-auto py-2 sm:py-4 space-y-6 sm:space-y-8 pb-32` (matches Animate after step 3 and reserves space for the floating bar).
- PageHeader: drop the `<span Beta>` child (no more "random floating element" under the subtitle); pass the same pill via the new `titleBadge` prop so it sits inline with the title. Children become `<></>` (PageHeader still requires a child).
- Generate row (currently lines 384–407): convert to floating CTA:
  ```tsx
  <div className="sticky bottom-4 z-10 pb-[env(safe-area-inset-bottom)]">
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        <CreditEstimateBox params={creditParams} />
      </div>
      <Button size="lg" className="rounded-full gap-2 w-full sm:w-auto sm:ml-auto" disabled={!canGenerate} onClick={handleGenerate}>
        {project.isGenerating ? (<><Loader2 className="h-4 w-4 animate-spin" />{project.pipelineStage === 'queued' ? 'Queued…' : 'Generating…'}</>) : (<><Sparkles className="h-4 w-4" />Generate Video</>)}
      </Button>
    </div>
  </div>
  ```

### 3. `src/pages/video/AnimateVideo.tsx` — match StartEnd exactly
- Wrapper (line 532): `max-w-4xl mx-auto py-2 sm:py-4 space-y-6 sm:space-y-8 pb-32` (was `max-w-4xl mx-auto space-y-6`).
- PageHeader stays as is — no badge needed.
- Generate row (the existing `rounded-2xl border border-border bg-card p-4 sm:p-5 …` block around line 1318): wrap in the same `sticky bottom-4 z-10 pb-[env(safe-area-inset-bottom)]` shell and apply `bg-card/95 backdrop-blur-md shadow-lg` to the inner card so it visually matches StartEnd. All inner logic (notEnoughCredits branch, Get credits button, bulk totals copy) stays untouched.

### 4. Verification
- Eyeball both pages at desktop (1264) and mobile (375) widths via the preview screenshot tool to confirm:
  - Headers share the same size, back-action style, subtitle treatment.
  - The Beta pill on StartEnd sits inline next to "Start & End Video", not floating below the subtitle.
  - The Generate bar stays pinned 16 px above the viewport bottom on both pages while scrolling, with the cost label on the left and CTA on the right; on mobile it stacks (cost row above CTA).
  - Last card on each page is not visually hidden under the sticky bar (`pb-32` confirms clearance).

## Out of scope
- No copy changes inside the existing settings/refinement panels.
- No changes to the Audio & Note card, Compatibility card, Recent-result banner, results panel, or pipeline UI.
- No animation work, no library/upload-modal changes.
- Other pages that use PageHeader keep their current rendering (new prop is optional).
