

## Friendly Error Cards for Generation Failures

Currently, when a generation fails (timeout, rate limit, or generic error), the user sees a brief red toast notification that disappears in a few seconds. This feels alarming and provides no recovery path. The `ContentBlockedCard` already handles content-policy errors beautifully with branded UI, crew avatar, and a "Rephrase" action — we should follow the same pattern for other failure types.

### What Changes

**1. `src/components/app/freestyle/FreestyleGallery.tsx` — Add `GenerationFailedCard`**

Create a new card component (sibling to `ContentBlockedCard`) that renders in the gallery grid when a generation fails. It will:
- Use the same dark navy gradient style as `ContentBlockedCard` (brand consistency)
- Show a random STUDIO_CREW avatar with a friendly message
- Display a clear, non-scary explanation based on error type:
  - **Timeout**: "[Name] ran out of time on this one — complex prompts with multiple references can take longer. Your credits have been refunded."
  - **Rate limit**: "[Name] is handling a lot right now — try again in a moment. Credits refunded."
  - **Generic**: "[Name] hit an unexpected issue. Credits have been refunded — give it another try."
- Include a "Try Again" button (re-populates the prompt bar) and a "Dismiss" button
- Sit in the gallery at 1:1 aspect ratio, same as `ContentBlockedCard`

**2. `src/hooks/useGenerationQueue.ts` — Route failures to gallery instead of toast**

- Add a new `onGenerationFailed` callback (alongside existing `onContentBlocked`)
- For timeout, rate-limit, and generic errors: call `onGenerationFailed(jobId, errorMessage, errorType)` instead of `toast.error()`
- The parent component (`Freestyle.tsx`) will store these in state and pass them to `FreestyleGallery`

**3. `src/pages/Freestyle.tsx` — Wire failed entries to gallery**

- Add state for failed generation entries (similar to existing `blockedEntries`)
- Pass `onGenerationFailed` callback to `useGenerationQueue`
- Pass failed entries to `FreestyleGallery` for rendering as `GenerationFailedCard`s
- Handle "Try Again" by re-populating the prompt and clearing the card

### Files Modified

| File | Change |
|---|---|
| `src/components/app/freestyle/FreestyleGallery.tsx` | Add `GenerationFailedCard` component, render failed entries in grid |
| `src/hooks/useGenerationQueue.ts` | Add `onGenerationFailed` callback, stop using `toast.error` for failures |
| `src/pages/Freestyle.tsx` | Wire failed entries state and callbacks between hook and gallery |

