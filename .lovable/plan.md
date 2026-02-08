

# Add AI Studio Team Touchpoints to Brand Profile Wizard

## Overview

Add contextual, encouraging messages from relevant AI Studio Team members at each step of the Brand Profile wizard. This creates a sense that real specialists are guiding the user through the process and will personally take care of their brand identity.

## Design

Each wizard step will show a small "team tip" banner at the top of the step content, featuring:
- A circular avatar of the relevant team specialist (living video avatar)
- The specialist's name and role
- A short, reassuring message explaining how they'll use this information

The banner will be compact (not intrusive) -- a subtle card with a soft accent background, sitting right below the step indicator and above the form fields.

## Team Member Mapping Per Step

| Step | Specialist | Why |
|---|---|---|
| **Step 1: Your Brand** | **Sienna** - Brand Consistency Manager | She ensures every visual matches your brand DNA. Perfect for the identity/description step. |
| **Step 2: Visual Style** | **Sophia** - Product Photographer + **Luna** - Retouch Specialist | Sophia handles lighting/composition, Luna handles color correction. Both are relevant to visual style choices. |
| **Step 3: Avoid These** | **Kenji** - Campaign Art Director | He designs cohesive campaigns. Knowing what to avoid helps him keep everything on-brand. |

## Messages

- **Step 1 (Sienna):** "I'll memorize your brand identity and make sure every visual feels unmistakably yours."
- **Step 2 (Sophia + Luna):** "We'll use your style preferences to dial in the perfect lighting, colors, and mood for every shoot."
- **Step 3 (Kenji):** "Your exclusions become my guardrails. I'll make sure nothing off-brand ever makes it through."

## UI Component

A new `TeamStepTip` inline component inside `BrandProfileWizard.tsx`:

```text
+----------------------------------------------------------+
|  [avatar] [avatar]  Sophia & Luna                        |
|  Product Photographer + Retouch Specialist               |
|  "We'll use your style preferences to dial in the        |
|   perfect lighting, colors, and mood for every shoot."   |
+----------------------------------------------------------+
```

- Rounded card with `bg-primary/5 border-primary/10` styling
- Avatar(s) displayed as small circular images (32x32px)
- Subtle, not distracting -- blends with the wizard's existing aesthetic
- On steps with 2 specialists, avatars are stacked/overlapping slightly

## Technical Details

### File Modified: `src/components/app/BrandProfileWizard.tsx`

1. **Add imports** for the team avatar images at the top of the file:
   - `avatarSienna`, `avatarSophia`, `avatarLuna`, `avatarKenji`

2. **Define a `STEP_TEAM_TIPS` array** containing the team tip configuration for each step:
   - Each entry has: `avatars` (array of image paths), `names` (string), `roles` (string), `message` (string)

3. **Add a `TeamStepTip` component** (inline, not a separate file) that renders the tip banner:
   - Takes the current step index and renders the corresponding tip
   - Displays overlapping avatars for multi-specialist steps
   - Shows the personalized message in italic quotes

4. **Insert the `TeamStepTip`** inside `<CardContent>` at the very top, before the step-specific form content:
   - Positioned right after the `<CardContent className="p-6 space-y-6">` opening
   - Renders before the `{step === 0 && ...}` conditional blocks

5. **Add a final reassurance message** at the save step: When the user is on Step 3, add a small footer note below the navigation buttons saying something like "Your entire studio team will apply this profile to every generation."

