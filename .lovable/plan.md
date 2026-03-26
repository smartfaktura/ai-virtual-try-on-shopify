

# Premium Video Results UI + Correction Confirmation Flow

## Overview
Redesign the video results panel to remove boxy borders and feel more premium, and add branded confirmation dialogs for quick corrections/variations that show credit cost, explanation, and VOVV.AI team avatars before generating.

## 1. Premium Results Panel Redesign

**File: `src/components/app/video/VideoResultsPanel.tsx`**

- Remove all `border border-border` from cards — use subtle `bg-muted/5` with `shadow-sm` or no container at all
- Remove the outer `rounded-xl border` wrapper around the player — let the video float cleanly with just `rounded-xl overflow-hidden shadow-lg` and no explicit border
- Remove borders from Generation Details, Quick Variations, and Quick Corrections cards — use subtle background tints and spacing instead of bordered boxes
- Make the player background a soft gradient (`bg-gradient-to-b from-muted/20 to-muted/40`) instead of flat `bg-muted/30`
- Auto-play the video immediately on result (skip the "click to play" poster state)
- Make Video/Original toggle more pill-shaped with `rounded-full` and better contrast
- Merge Quick Variations and Quick Corrections into a single section with labeled sub-groups instead of two separate bordered cards
- Add credit cost badge to each variation/correction chip (e.g., "More subtle · 10 ⚡")

## 2. Correction Confirmation Modal

**New file: `src/components/app/video/CorrectionConfirmModal.tsx`**

Create a branded confirmation dialog that appears when a user clicks any quick variation or correction chip:

- Shows the preset label as title (e.g., "Keep closer to original")
- Short explanation of what this correction will do (stored as `description` in each preset)
- VOVV.AI team avatars row with a message like "Our team will regenerate your video with these adjustments"
- Credit cost display: "This will use **10 credits** from your balance" with current balance shown
- Two buttons: "Cancel" (ghost) and "Generate Variation" (primary)
- Uses existing `Dialog` component, no new dependencies

Add `description` and `creditEstimate` fields to each preset in `QUICK_VARIATIONS` and `CORRECTION_VARIATIONS`:
- `more_subtle`: "Reduces motion intensity and softens camera movement for a calmer, more refined result."
- `keep_closer`: "Maximizes preservation of the original image — tighter identity, scene, and product fidelity with minimal motion."
- `no_added_objects`: "Adds explicit negative prompts to prevent the AI from inventing products, props, or objects not in your source image."
- etc.

## 3. Wire confirmation flow

**File: `src/components/app/video/VideoResultsPanel.tsx`**

- When user clicks a chip, open `CorrectionConfirmModal` with the preset details
- On confirm, call `onQuickVariation(preset)` as before
- Pass credit estimate (computed from `estimateCredits`) and `creditsRemaining` as props

**File: `src/pages/video/AnimateVideo.tsx`**

- Pass `creditsRemaining` from CreditContext to `VideoResultsPanel`
- Pass current generation params so credit estimate can be computed for the variation

## Technical Details

- **Files created**: `src/components/app/video/CorrectionConfirmModal.tsx`
- **Files modified**: `src/components/app/video/VideoResultsPanel.tsx`, `src/pages/video/AnimateVideo.tsx`
- **No backend changes**
- Credit estimation uses existing `estimateCredits()` from `videoCreditPricing.ts`
- Team avatars from existing `TEAM_MEMBERS` data

