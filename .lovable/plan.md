## Scope
Match the AnimateVideo floating cost bar to StartEndVideo: same `CreditEstimateBox` pill, same muted typography, no red "Need X more credits" text, no cheap inline error. Only the floating bar on `/app/video/animate` changes — pricing logic, CTAs, and StartEndVideo stay untouched.

## Changes

### `src/pages/video/AnimateVideo.tsx` — floating Generate bar (block around lines 1317–1363)

Replace the inline "Cost: 25 credits  Need 25 more credits" row with the same `CreditEstimateBox` component used on StartEnd, plus a small muted multiplier line. Drop the destructive red copy entirely — the disabled Generate button + `Get credits` CTA already communicate the state.

New inner layout (still inside the existing `sticky bottom-4 z-10` shell and the existing IIFE that computes `perVideo`, `totalVideos`, `totalCredits`, `notEnoughCredits`, `generateDisabled`):

```tsx
<div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
    <CreditEstimateBox
      params={{ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion }}
    />
    {totalVideos > 1 && (
      <span className="text-xs text-muted-foreground">
        × {totalVideos} {totalVideos === 1 ? 'video' : 'videos'} = {totalCredits} credits
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
      disabled={generateDisabled}
      size="lg"
      className="rounded-full gap-2 w-full sm:w-auto sm:ml-auto"
    >
      <Sparkles className="h-4 w-4" />
      {totalVideos > 1 ? `Generate ${totalVideos} Videos` : 'Generate Video'}
    </Button>
  )}
</div>
```

Add the missing `CreditEstimateBox` import (already imported at top of the file — no new import).

### What's removed
- `<span className="text-sm text-muted-foreground">Cost:</span>` + the bold credits span (replaced by `CreditEstimateBox`).
- `(N camera motions × M images)` parenthetical (collapsed into the simpler `× N videos = X credits` muted line).
- The red `text-destructive` "Need X more credits" pill — gone. State is now communicated by the disabled Generate button and the `Get credits` CTA only, matching StartEnd's restraint.

### Out of scope
- No changes to `CreditEstimateBox.tsx`, pricing logic, the IIFE math, or `NoCreditsModal`.
- No changes to StartEndVideo.
- No changes to PageHeader or wrapper styles (already unified in the previous turn).

## Verification
Eyeball `/app/video/animate` in single-video and multi-motion/bulk states at 1264 × 821 and 375 × 812:
- Cost pill matches StartEnd exactly (rounded `bg-muted/50` border).
- No red text anywhere in the bar.
- Multi-video state shows quiet muted multiplier line next to the pill.
- Generate / Get credits CTAs still work as expected.
