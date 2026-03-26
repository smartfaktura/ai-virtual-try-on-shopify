

# Animate Image Page — UX & Branding Polish

## Problems to Fix

1. No back button to return to Video Hub
2. No VOVV.AI team avatar branding on the page
3. The generation progress screen is plain — needs team avatar takeover with personality
4. Redundant "Video generation started" toast in `useGenerateVideo.ts`

## Changes

### 1. Add Back Button to Video Hub
In `AnimateVideo.tsx`, use the existing `PageHeader` `backAction` prop:
```
backAction={{ content: 'Video', onAction: () => navigate('/app/video') }}
```
Add `useNavigate` from react-router-dom.

### 2. Add VOVV.AI Team Tips Banner (below header, before upload)
Add a branded banner at the top of the form showing 3-4 team member avatars in a row with a rotating tip. Structure:
- A compact card with overlapping team avatars (use `TEAM_MEMBERS` data — pick 4 relevant ones like Sophia, Kenji, Zara, Leo)
- A short tip text that cycles or is static, e.g. "Our AI team analyzes your image to build the perfect motion plan"
- Subtle styling: `bg-muted/30` border card, small avatars (28px), muted text

### 3. Branded Generation Progress Takeover
Replace the current plain spinner card with a richer branded experience:
- Show 3 cycling team avatars with a crossfade (reuse pattern from `WorkflowActivityCard`)
- Show the team member's `statusMessage` below the avatars (e.g. "Setting up the lighting...", "Building the scene...")
- Keep the existing stage text ("Analyzing your image...", "Building motion plan...", "Generating your video...")
- Add a subtle "VOVV.AI Studio" label
- Progress bar remains for the generating stage
- Cycle avatars every 3 seconds

### 4. Remove "Video generation started" Toast
In `src/hooks/useGenerateVideo.ts` line 283, remove the `toast.info(...)` call. The pipeline progress UI already communicates this clearly — the toast is redundant.

## Files to Modify
- `src/pages/video/AnimateVideo.tsx` — back button, team tips banner, branded progress takeover
- `src/hooks/useGenerateVideo.ts` — remove toast on line 283

