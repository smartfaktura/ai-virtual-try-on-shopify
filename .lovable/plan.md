

# Rewrite All Branded Avatar Messages — Role-Accurate + Rotating Variants

## What's Changing

Two sources of branded messages, used across 10 UI surfaces total.

---

### Source 1: `statusMessage` in `src/data/teamData.ts`

Used in: Sidebar tooltip, Sidebar expanded text, GlobalGenerationBar, WorkflowActivityCard, QueuePositionIndicator, MultiProductProgressBanner, Perspectives page, CatalogGenerate page, Landing TeamVideoInterlude.

**Important**: Several consumers prepend "is" — e.g. `"Sophia is setting up the lighting..."` — so messages must work grammatically after "is".

We'll convert `statusMessage: string` to `statusMessages: string[]` (3-5 per member) and add a helper `getStatusMessage(member)` that picks a random one. All consumers will be updated.

| Member | Role | Current | New Rotating Messages |
|--------|------|---------|----------------------|
| **Sophia** | E-commerce Photographer | "Setting up the lighting..." | "Setting up the studio lighting..." · "Framing the hero shot..." · "Adjusting the key light..." · "Composing the product angle..." |
| **Amara** | Lifestyle Photographer | "Adjusting the exposure..." | "Styling the lifestyle scene..." · "Placing the product in context..." · "Setting the natural mood..." · "Composing the story shot..." |
| **Luna** | Retouch Specialist | "Retouching the highlights..." | "Retouching the highlights..." · "Cleaning up the background..." · "Refining the color balance..." · "Polishing the final pixels..." |
| **Kenji** | Campaign Art Director | "Reviewing the composition..." | "Reviewing the art direction..." · "Directing the visual layout..." · "Refining the campaign look..." · "Orchestrating the scene..." |
| **Yuki** | Ad Creative Director | "Building the scene..." | "Optimizing for ad performance..." · "Crafting the ad creative..." · "Formatting for the platform..." · "Building the conversion layout..." |
| **Omar** | Visual CRO Strategist | "Styling the set..." | "Analyzing the visual hierarchy..." · "Optimizing for conversions..." · "Testing the color psychology..." · "Tuning the visual impact..." |
| **Sienna** | Brand Identity Guardian | "Grading the colors..." | "Checking brand consistency..." · "Grading the color palette..." · "Locking the brand look..." · "Matching the brand DNA..." |
| **Max** | Platform Optimization | "Calibrating the lights..." | "Formatting for every platform..." · "Optimizing the export settings..." · "Resizing for marketplace specs..." · "Preparing the multi-platform output..." |
| **Zara** | Fashion Stylist | "Aligning with brand guidelines..." | "Curating the outfit details..." · "Styling the garment presentation..." · "Coordinating the color palette..." · "Perfecting the fashion frame..." |
| **Leo** | Scene & Set Designer | "Creating your video..." | "Building the set design..." · "Constructing the background..." · "Arranging the props..." · "Designing the environment..." |

---

### Source 2: `BRANDED_MESSAGES` in `ProductImagesStep5Generating.tsx`

These are standalone sentences (no "is" prefix). Will be rewritten to match each member's expertise:

| Member | Current | New |
|--------|---------|-----|
| Sophia | "Dialing in studio lighting for your product…" | "Dialing in studio lighting for the perfect shot…" |
| Kenji | "Finding the best camera angle for this scene…" | "Art directing the visual layout…" |
| Amara | "Balancing highlights and shadows…" | "Placing your product in a lifestyle moment…" |
| Luna | "Polishing every detail to pixel perfection…" | "Retouching every detail to pixel perfection…" |
| Sienna | "Making sure this matches your brand look…" | "Locking in your brand identity…" |
| Leo | "Constructing the perfect background…" | "Constructing the perfect set and background…" |
| Omar | "Fine-tuning contrast for maximum impact…" | "Analyzing visual hierarchy for maximum conversions…" |
| Zara | "Styling the final frame — almost there…" | "Styling the perfect outfit presentation…" |

---

### Implementation

1. **`src/data/teamData.ts`** — Change `statusMessage: string` to `statusMessages: string[]`, keep backward-compat `statusMessage` as first item. Add `getRandomStatusMessage(member: TeamMember): string` helper.

2. **`src/components/app/product-images/ProductImagesStep5Generating.tsx`** — Update `BRANDED_MESSAGES` with role-accurate copy.

3. **Update all 8 consumer files** to use `getRandomStatusMessage()` or `member.statusMessages[0]` (for static displays like sidebar tooltip):
   - `SidebarTeamAvatar.tsx` — use first message (static)
   - `GlobalGenerationBar.tsx` — use random picker
   - `WorkflowActivityCard.tsx` — use random picker
   - `QueuePositionIndicator.tsx` — use random picker
   - `MultiProductProgressBanner.tsx` — use random picker
   - `Perspectives.tsx` — use random picker
   - `CatalogGenerate.tsx` — use random picker
   - `BulkProgressBanner.tsx` — use random picker
   - `TeamVideoInterlude.tsx` — use first message (static)

### Files
- `src/data/teamData.ts`
- `src/components/app/product-images/ProductImagesStep5Generating.tsx`
- `src/components/app/SidebarTeamAvatar.tsx`
- `src/components/app/GlobalGenerationBar.tsx`
- `src/components/app/WorkflowActivityCard.tsx`
- `src/components/app/QueuePositionIndicator.tsx`
- `src/components/app/MultiProductProgressBanner.tsx`
- `src/pages/Perspectives.tsx`
- `src/pages/CatalogGenerate.tsx`
- `src/components/app/video/BulkProgressBanner.tsx`
- `src/components/landing/TeamVideoInterlude.tsx`

