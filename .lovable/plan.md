## Scope
`/app/video/animate` polish: fix credits guard on Generate, reposition the Generate CTA, hide the StudioChat support bubble on this route, and standardize card/spacing/radius/segmented-button styles on the visible Settings stack to match VOVV's existing pattern. No backend / pipeline logic changes.

## Changes

### 1. Hide StudioChat on this route
`src/components/app/StudioChat.tsx` — add `if (location.pathname === '/app/video/animate') return null;` alongside the existing hard-hide list (around line 64).

### 2. Credits guard + Generate footer — `src/pages/video/AnimateVideo.tsx` (lines 1308–1350)
Inside the `Generate` block compute:
- `perVideo`, `totalVideos`, `totalCredits` (already computed inline).
- `notEnoughCredits = totalCredits > creditsBalance`.

Wrap the cost summary and CTA together in a single footer card:
```
<div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
    <Sparkles className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Estimated cost:</span>
    <span className="text-sm font-semibold text-foreground">…</span>
    {notEnoughCredits && (
      <span className="text-xs font-medium text-destructive">
        Need {totalCredits - creditsBalance} more credits
      </span>
    )}
  </div>
  {notEnoughCredits ? (
    <Button
      onClick={() => openBuyModal('animate_video_cta')}
      size="lg"
      className="rounded-full gap-2 w-full sm:w-auto sm:ml-auto"
    >
      <Sparkles className="h-4 w-4" />
      Get credits
    </Button>
  ) : (
    <Button
      onClick={handleGenerate}
      disabled={bulkMode ? bulkImages.filter(i => i.url).length === 0 : !imageUrl || isUploading}
      size="lg"
      className="rounded-full gap-2 w-full sm:w-auto sm:ml-auto"
    >
      <Sparkles className="h-4 w-4" />
      {totalVideos > 1 ? `Generate ${totalVideos} Videos` : 'Generate Video'}
    </Button>
  )}
</div>
```
Pull `openBuyModal` from the existing `useCredits()` destructure on line 61.

### 3. Settings card visual polish — `src/pages/video/AnimateVideo.tsx` (line 1244)
- Container: `rounded-xl border border-border bg-card p-4 space-y-4` → `rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5`.
- Heading (line 1245): `text-sm font-medium text-foreground` → `text-base font-semibold tracking-tight text-foreground`.
- Field labels (`Aspect Ratio`, `Duration`): bump from `text-xs` → `text-sm font-medium text-foreground`, keep tooltip inline.
- Duration segmented buttons (lines 1263–1272): `px-3 py-1 rounded-md text-sm` → `px-4 py-1.5 rounded-full text-sm`.
- `AudioModeSelector` already uses `rounded-full` pills — no change.

### 4. Preservation Rules card — `src/components/app/video/PreservationRulesPanel.tsx` (line 31)
- Container: `rounded-xl border border-border bg-card p-4 space-y-3` → `rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4`.
- Section title (the existing heading inside): bump to `text-base font-semibold tracking-tight`.

### 5. Motion Refinement card — `src/components/app/video/MotionRefinementPanel.tsx` (line 70)
- `rounded-xl` → `rounded-2xl` on the outer card.
- Trigger button (line 72): keep behavior, just change `rounded-xl` → `rounded-2xl` so the corners match.

### 6. Specific Motion Note label — `src/pages/video/AnimateVideo.tsx` (line 1281)
Promote the bare label-and-textarea block into a card matching the others so it stops feeling visually orphaned:
```
<div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
  <div className="flex items-center gap-1">
    <label className="text-base font-semibold tracking-tight text-foreground">
      Specific Motion Note <span className="text-sm text-muted-foreground font-normal">(optional)</span>
    </label>
    <InfoTooltip text="…" />
  </div>
  <Textarea … className="min-h-[96px] resize-none rounded-xl" maxLength={500} />
</div>
```

## Out of scope
No edits to the upload card, motion goal selector, pipeline progress UI, results panel, or any pipeline/credits backend logic. The existing `NoCreditsModal` flow stays as a secondary safety net.
