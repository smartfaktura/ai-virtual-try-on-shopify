

# Fix Two Issues: White Borders on Lifestyle Scenes + Lightbox Header Gap

## Problem 1: White Borders on Lifestyle Scenes
The background auto-injection system (lines 1270-1277) appends a solid background instruction to ALL scenes that don't have `{{background}}` in their template, even lifestyle scenes like "On-Foot Lifestyle" that intentionally use street/environmental backgrounds. Additionally, the "CRITICAL" preamble (line 1261-1262) is prepended regardless.

This creates contradictory prompts: the template says "Natural ambient lighting in a realistic street context" but the injected text says "CRITICAL: background must be exactly #F8F8F5". The AI tries to satisfy both, resulting in white borders/frames around lifestyle images.

**Fix:** Only inject background + preamble when the scene actually has `background` in its `trigger_blocks`. Scenes without that trigger are intentionally environment-driven and should not receive any background override.

**File: `src/lib/productImagePromptBuilder.ts`**

1. Line 1232 — Gate `bgHexForReinforcement` on scene having `background` trigger:
```ts
const sceneHasBgTrigger = (scene.triggerBlocks || []).includes('background');
const bgHexForReinforcement = sceneHasBgTrigger
  ? bgResolved.match(/flat solid exact (#[0-9A-Fa-f]{6})/)?.[1] || null
  : null;
```

2. Lines 1270-1277 — Gate auto-injection on scene having `background` trigger:
```ts
if (!hasBgToken && !isAuto(bgTone) && sceneHasBgTrigger) {
```

This ensures lifestyle/editorial scenes never get conflicting background instructions.

## Problem 2: Lightbox Header Gap
The lightbox counter badge ("9 / 16") sits at `top-5` (20px from top), and the image container has `max-h-[90vh]` — but the image itself starts below the counter area. The image wrapper doesn't account for the space taken by the counter and action bar, creating a visual gap at the top.

**File: `src/components/app/ImageLightbox.tsx`**

Add vertical padding to the image container to account for the counter and action bar, ensuring the image centers in the available space between them:
```ts
// Line 128-131: Add pt-14 to push content below the counter badge
<div className={cn(
  'relative z-10 flex flex-col items-center animate-in zoom-in-95 fade-in duration-200 overflow-hidden pt-14',
  isMobile ? 'max-w-[94vw] max-h-[90vh] px-1' : 'max-w-[90vw] max-h-[90vh]'
)}>
```
And reduce the image max-height to account for the top padding + bottom action bar:
```ts
// Desktop: max-h-[75vh] instead of max-h-[80vh]
```

## Files Changed
1. `src/lib/productImagePromptBuilder.ts` — gate background preamble + auto-injection on `trigger_blocks` containing `background`
2. `src/components/app/ImageLightbox.tsx` — add top padding to center image below counter badge

