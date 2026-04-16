

# Fix Inline Card Subtitle + Modal Mobile Scroll + Subline Copy

## Changes

### 1. PostGenerationUpgradeCard — remove subtitle truncation
In `PostGenerationUpgradeCard.tsx` line 86, remove `sm:line-clamp-1` so the subtitle is never truncated:
```
<p className="text-xs text-muted-foreground leading-snug">{copy.subline}</p>
```

### 2. NoCreditsModal — fix mobile scroll
The `DialogContent` on mobile uses `max-sm:h-full` but the content area likely can't scroll. Add `max-sm:overflow-y-auto` to the DialogContent (line 71) to enable scrolling on mobile.

### 3. Simplify generation count subline
In `src/lib/conversionCopy.ts`, replace `getLayer3Subline` to remove the "You've created X images" text and the range. New copy:
- `generationCount <= 1`: `"Brands like yours typically need 100+ visuals per month"`
- else: `"Brands like yours typically need 100+ visuals per month"`

Effectively a single return: `"Brands like yours typically need 100+ visuals per month"`

### Files
- `src/components/app/PostGenerationUpgradeCard.tsx` — line 86
- `src/components/app/NoCreditsModal.tsx` — line 71
- `src/lib/conversionCopy.ts` — lines 295-300

