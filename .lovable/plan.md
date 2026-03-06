

## Fix: Auto-scroll into view when feedback banner expands

The feedback banner sits at the bottom of the page. When clicking "Share feedback" on the collapsed version, it expands but the new content is below the viewport — the user has to manually scroll down.

### Fix

In `src/components/app/FeedbackBanner.tsx`, add a `useRef` on the expanded banner's container and call `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` after `setCollapsed(false)` (via a short `setTimeout` or `useEffect` reacting to `collapsed` becoming `false`).

### Changes

**`src/components/app/FeedbackBanner.tsx`**
- Add a `ref` to the expanded banner wrapper div
- When transitioning from collapsed → expanded, call `ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })` after a brief delay (~100ms) to let the DOM update
- Same approach when the textarea area expands after selecting a feedback type chip

### Files changed
- `src/components/app/FeedbackBanner.tsx`

