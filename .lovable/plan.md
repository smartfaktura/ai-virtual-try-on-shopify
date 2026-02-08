

## Add Team Avatars to the Final CTA Section

Add a row of all 10 team member avatars below the CTA button area to create the impression that "your team is waiting for you." This reinforces the Studio Team narrative from earlier on the page and gives a personal, inviting feel right before the user signs up.

### Design

Below the trust badges ("Free to try", "No prompts", "Cancel anytime"), add a cluster of overlapping circular avatars (like a stacked avatar group) with a subtle label like "Your team is ready" or similar. The avatars will use the same static images already imported elsewhere (from `src/assets/team/`).

Layout:
- 10 circular avatars, slightly overlapping (negative margin), centered
- Each avatar has a white ring border for separation
- A small text label underneath: "Your studio team is ready"
- Subtle scale-up animation on hover for a lively feel

### Technical Details

**File: `src/components/landing/FinalCTA.tsx`**

- Import all 10 team avatar images from `src/assets/team/`
- Create a `TEAM_AVATARS` array with name and avatar image
- Add a new `div` after the trust badges section containing:
  - A flex row of overlapping circular avatar images (w-10 h-10 or w-12 h-12, rounded-full, border-2 border-background, -ml-3 for overlap)
  - A subtle text label below: "Your studio team is ready"
- Avatars will use the static `.jpg` images (not videos) to keep the section lightweight

No other files need to change.
