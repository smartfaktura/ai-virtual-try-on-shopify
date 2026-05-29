## Scope
Polish credit cost copy + Generate CTAs + floating bar layout + page header on `/app/video/animate` and `/app/video/start-end` so the two pages feel identical. No backend / pipeline logic changes.

## Changes

### 1. `src/components/app/video/CreditEstimateBox.tsx` (shared by both pages)
- Remove the `Coins` icon and its import.
- Change label `"Estimated cost:"` → `"Cost:"`.
- Container stays the same shape but loses the leading icon. Result:
  ```
  <div ref={ref} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
    <span className="text-sm text-muted-foreground">Cost:</span>
    <span className="text-sm font-semibold text-foreground">{credits} credits</span>
  </div>
  ```

### 2. `src/pages/video/AnimateVideo.tsx` — Generate footer copy
Inside the inline cost block (added last turn), change `Estimated cost:` → `Cost:` and drop the leading `<Sparkles>` icon next to that label so it matches the shared component.

### 3. `src/pages/video/StartEndVideo.tsx` — header parity with Animate
- Replace the current wrapper `<div className="container max-w-5xl py-8 space-y-6">` with `<div className="max-w-4xl mx-auto space-y-6">` (identical to Animate).
- Remove the standalone Back button block (lines 259–264) and the `flex items-start justify-between` wrapper around the PageHeader (lines 265–275). Use Animate's pattern instead:
  ```
  <PageHeader
    title="Start & End Video"
    subtitle="Upload two frames and let AI generate a smooth, cinematic transition between them"
    backAction={{ content: 'Video', onAction: () => navigate('/app/video') }}
  >
    <div />
  </PageHeader>
  ```
  The Beta badge gets relocated inline next to the title — render it as a small pill inside the subtitle row by passing it as the trailing element of the title string is not possible, so keep it visually by appending a small badge under the subtitle:
  ```
  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-[0.14em] uppercase">Beta</span>
  ```
  placed as the PageHeader child (where `<div />` is) so it lives in the same header block. Drop trailing period from subtitle (memory rule).

### 4. `src/pages/video/StartEndVideo.tsx` — floating Generate bar parity with Animate
Replace the sticky bar (line 393) with the same static card pattern Animate uses:
```
<div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
    <CreditEstimateBox params={creditParams} />
  </div>
  <Button
    size="lg"
    className="rounded-full gap-2 w-full sm:w-auto sm:ml-auto"
    disabled={!canGenerate}
    onClick={handleGenerate}
  >
    {project.isGenerating ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {project.pipelineStage === 'queued' ? 'Queued…' : 'Generating…'}
      </>
    ) : (
      <>
        <Sparkles className="h-4 w-4" />
        Generate Video
      </>
    )}
  </Button>
</div>
```
Drops `sticky bottom-6`, `backdrop-blur-md`, the `min-w-[240px]` button, and shortens the CTA label.

## Out of scope
No changes to refinement panels, compatibility cards, pipelines, or analytics. AnimateVideo's existing footer structure stays intact aside from the label/icon tweak in step 2.
