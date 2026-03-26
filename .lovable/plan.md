

# Improve Global Generation Bar with Team Avatars & Richer UI

## Overview
Replace the generic spinner/icon pill with contextual VOVV.AI team member avatars per job type, add rotating status messages, and improve the expanded detail panel with warmer, more branded styling.

## File: `src/components/app/GlobalGenerationBar.tsx`

### 1. Map job types to team members
Create a helper that returns the appropriate team member based on `job_type`:
- `video` → Leo (Scene & Set Designer) — "Animating the sequence..."
- `freestyle` → Sophia (E-commerce Photographer) — "Setting up the lighting..."
- `upscale` → Luna (Retouch Specialist) — "Retouching the highlights..."
- `workflow` / default → Kenji (Art Director) — "Reviewing the composition..."
- `tryon` → Zara (Fashion Stylist) — "Aligning with brand guidelines..."
- Creative Drops → Amara (Lifestyle Photographer)

### 2. Compact pill improvements
- Replace the generic `Loader2` spinner with the relevant team member's avatar (with a subtle spinning ring animation around it)
- Show the team member's name in the pill text: e.g., "Leo is animating..." instead of "1 running"
- When multiple job types are active, show stacked avatars (up to 2-3) with count

### 3. Expanded panel improvements
- Each active group row: show the assigned team member avatar + their contextual `statusMessage` as a subtitle
- Add a rotating status message that cycles through relevant team member quotes every 4 seconds (reuse existing pattern from `QueuePositionIndicator`)
- Replace the plain `PROCESSING` / `QUEUED` badges with warmer styled variants (subtle primary tint for processing, muted for queued)
- Add elapsed time with a small clock icon inline

### 4. Completed group improvements
- Show a success avatar (Sophia) with "Your images are ready!" message
- For video completions, show Leo with "Your video is ready!"

### Key changes summary
- One new helper function `getTeamMemberForJob(group: BatchGroup): TeamMember`
- Rotating `teamIndex` state with 4s interval (already patterned in QueuePositionIndicator)
- Avatar replaces spinner in pill; avatar + status message in expanded rows
- Warmer badge styling with subtle color tints per state

