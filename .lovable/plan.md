

## Dynamic Generation Timer with Rotating Team Messages

### What Changes

Replace the static "Usually takes a few seconds" text with a live elapsed timer, realistic time estimates based on complexity, and rotating studio team status messages to keep users engaged during longer generations.

### User Experience

**Before**: Static "Generating your images... Usually takes a few seconds" with a frozen progress bar at 50%.

**After**:
- Live elapsed timer: "12s elapsed"
- Dynamic estimate based on what was selected: "This usually takes about 45-60 seconds"
- Rotating team member messages every 4 seconds: "Sophia is setting up the lighting...", "Kenji is reviewing the composition...", etc.
- Progress bar that animates smoothly based on estimated duration instead of sitting at 50%

### How It Works

**1. Add `GenerationMeta` to `QueueJob`** (`src/hooks/useGenerationQueue.ts`)

Store complexity metadata (image count, quality, whether model/scene/product references are attached) on the active job when `enqueue()` is called. This is client-side only -- no database changes.

```
interface GenerationMeta {
  imageCount: number;
  quality: string;
  hasModel: boolean;
  hasScene: boolean;
  hasProduct: boolean;
}
```

**2. Pass metadata at enqueue time** (`src/pages/Freestyle.tsx`, `src/pages/Generate.tsx`)

After calling `enqueue()`, store the meta on the active job from the payload that's already available (modelImage, sceneImage, sourceImage, imageCount, quality).

**3. Overhaul `QueuePositionIndicator`** (`src/components/app/QueuePositionIndicator.tsx`)

Major changes to the processing state:

- **Elapsed timer**: Uses `useState` + `useEffect` with a 1-second interval, calculating seconds since `job.started_at` (or `job.created_at` as fallback). Displays "12s elapsed" next to the estimate.

- **Time estimate calculation**:
  | Factor | Added time |
  |--------|-----------|
  | Base | 15s |
  | Per image | +10s each |
  | High quality (Pro model) | +15s |
  | Model reference | +10s |
  | Scene reference | +5s |
  | Product reference | +5s |
  | 2+ references combined | +10s extra |
  
  Displayed as a range: "~45-60 seconds" (estimate x0.8 to x1.2).

- **Rotating team messages**: Import `TEAM_MEMBERS` from `src/data/teamData.ts` (already has statusMessage per member). Cycle through them every 4 seconds with a fade transition. Shows messages like "Sophia is setting up the lighting..." and "Kenji is reviewing the composition..."

- **Animated progress bar**: Instead of static `value={50}`, calculate progress as `(elapsed / estimatedSeconds) * 90` (caps at 90% until complete, never shows 100% prematurely). Smooth CSS transition.

### Files Changed

- `src/hooks/useGenerationQueue.ts` -- add `GenerationMeta` type and `generationMeta` field to `QueueJob`, store it when setting active job in `enqueue()`
- `src/components/app/QueuePositionIndicator.tsx` -- elapsed timer, dynamic estimate, rotating team messages, animated progress bar
- `src/pages/Freestyle.tsx` -- pass `generationMeta` to the queue hook after enqueue
- `src/pages/Generate.tsx` -- pass `generationMeta` to the queue hook after enqueue

### No other changes
- No database changes
- No edge function changes
- No new dependencies (uses existing `TEAM_MEMBERS` data)

