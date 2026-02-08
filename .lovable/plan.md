

## Integrate AI Team Touchpoints Across the App Dashboard

Bring the 10 AI studio professionals to life inside the `/app` experience with subtle, contextual micro-touches that remind users they have a full creative team working behind the scenes. These are lightweight additions -- no new pages, no heavy components.

### Touchpoint 1: Team Avatar on the "Generating" Loading Screen

**Where**: The generating/loading step in `/app/generate` (the card that says "Creating Your Images..." or "Creating Virtual Try-On...")

**What**: Below the progress bar, show one team member avatar with a contextual message. The team member shown depends on the generation mode:
- Product Photos: Sophia (Product Photographer) -- "Sophia is setting up the lighting..."
- Virtual Try-On: Zara (Fashion Stylist) -- "Zara is styling the look..."

This makes the wait feel human rather than mechanical.

**Implementation**: In `src/pages/Generate.tsx`, add a small avatar + message row below the progress bar in the `generating` step section (around line 988-1003). Import 2 team avatars (Sophia, Zara).

---

### Touchpoint 2: Team Attribution on Completed Results

**Where**: The results step in `/app/generate`, as a subtle footer below the generated images grid

**What**: A small "Crafted by your studio team" bar with 3-4 overlapping avatars (similar to the FinalCTA stacked avatars), giving the impression the team produced these visuals.

**Implementation**: In `src/pages/Generate.tsx`, add a small component at the bottom of the results section (after the image grid, around line 1070+). Import a few team avatars and render them as an overlapping row with a label.

---

### Touchpoint 3: Contextual Tips with Team Faces

**Where**: The existing `DashboardTipCard` component shown on the returning user dashboard

**What**: Each rotating tip gets a team member avatar and attribution, making the tip feel like advice from a specific team member. For example:
- "Schedule monthly Creative Drops..." -- attributed to Kenji (Campaign Art Director)
- "Add a Brand Profile..." -- attributed to Sienna (Brand Consistency Manager)
- "Virtual Try-On now supports 40+ models..." -- attributed to Zara (Fashion Stylist)
- "Use Workflows..." -- attributed to Omar (CRO Visual Optimizer)

**Implementation**: Update `src/components/app/DashboardTipCard.tsx` to import 4 team avatars and add `avatar` and `name` fields to each tip in the `TIPS` array. Display a small circular avatar next to the tip icon with the team member's name.

---

### Touchpoint 4: Activity Feed Team Attribution

**Where**: The `ActivityFeed` component on the returning user dashboard

**What**: Each activity row gets a tiny team avatar instead of (or alongside) the generic icon. This makes it feel like a team member performed the action:
- Job completed: Sophia's avatar (she "shot" it)
- Product uploaded: Max's avatar (he "processed" it)
- Brand profile created: Sienna's avatar (she "approved" it)

**Implementation**: Update `src/components/app/ActivityFeed.tsx` to import 3 team avatars and assign them based on activity type (`job-` gets Sophia, `product-` gets Max, `brand-` gets Sienna). Replace or supplement the icon with a small avatar.

---

### Technical Details

**Files to modify:**

1. **`src/pages/Generate.tsx`** (2 changes)
   - Import `avatarSophia`, `avatarZara`, and a few more team avatars from `@/assets/team/`
   - In the `generating` step (~line 988-1003): Add a flex row below the progress bar with a 32px circular avatar image and a short message like "Sophia is setting up the lighting..."
   - In the `results` step (~line 1070+): Add a centered footer with 4 overlapping circular avatars (same pattern as FinalCTA) and text "Crafted by your studio team"

2. **`src/components/app/DashboardTipCard.tsx`**
   - Import 4 team avatars (avatarKenji, avatarSienna, avatarZara, avatarOmar)
   - Add `avatar` (image path) and `memberName` (string) to each item in the `TIPS` array
   - Render a small circular avatar (w-8 h-8) next to the icon, with the member name in the tip highlight area

3. **`src/components/app/ActivityFeed.tsx`**
   - Import 3 team avatars (avatarSophia, avatarMax, avatarSienna)
   - Create a helper that maps activity `id` prefix to the corresponding avatar
   - Replace the icon `div` with a circular avatar image, or show both side-by-side

No new files or dependencies needed. All changes use existing avatar assets from `src/assets/team/`.

