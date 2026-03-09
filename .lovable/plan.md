

## Hide Generation Bar on Mobile & Improve In-Progress/Complete UX

### Changes

**1. Hide GlobalGenerationBar on mobile entirely**
- In `GlobalGenerationBar.tsx`, add `hidden sm:block` to the outermost container so it only renders on desktop. Mobile users won't see the "1 running" pill at all.

**2. Improve the workflow generation in-progress banner in Freestyle**
- In `src/pages/Freestyle.tsx` (~lines 596-613), redesign the workflow progress card:
  - Use a cleaner layout with workflow name if available
  - Show a more polished progress indicator with elapsed time
  - Softer styling with better spacing and typography

**3. Show context-aware completion message on Freestyle**
- When a generation completes and the user is on `/app/freestyle`:
  - For **workflow** jobs: show "Generation complete — results are in your Library" with a "View Library" button linking to `/app/library`
  - For **freestyle** jobs: images already appear in the gallery, no change needed
- In `GlobalGenerationBar.tsx`, detect if user is on freestyle and adjust the completed group's "View" button to say "View Library" and navigate to `/app/library`
- In `Freestyle.tsx`, when `activeJob` was a workflow and completes, show a brief success toast or inline banner with "View Library" CTA

### Files to edit
| File | Change |
|------|--------|
| `src/components/app/GlobalGenerationBar.tsx` | Add `hidden sm:block` to root container; update completed state to show "View Library" when on freestyle |
| `src/pages/Freestyle.tsx` | Redesign workflow in-progress banner with better typography/layout; add completion banner for workflow jobs with "View Library" link |

