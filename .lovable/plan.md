

## Fix: Incorrect Credit Pricing Across UI

The actual pricing logic (in `enqueue-generation`) is simple: **4 credits** (freestyle without model/scene) or **8 credits** (with model/scene, workflows, try-on). Several UI locations still show old, incorrect pricing (12, 15, 16, 20, 30 credits).

### Changes

**1. `src/components/app/freestyle/FreestyleSettingsChips.tsx`** — line 167
- Change `"12 credits/image"` → `"8 credits/image"`

**2. `src/pages/HelpCenter.tsx`** — line 35
- Rewrite the credits FAQ answer to reflect the simplified model: Freestyle = 4 credits (no model/scene) or 8 credits (with model/scene). Workflows and Virtual Try-On = 8 credits/image.

**3. `src/pages/HelpCenter.tsx`** — line 77
- Remove the "Standard (8 credits) / High Quality (16 credits)" distinction since quality no longer changes price. Replace with accurate 4/8 pricing.

**4. `src/components/landing/LandingFAQ.tsx`** — line 37
- Rewrite to match: Workflows and Try-On = 8 credits. Freestyle = 4 (basic) or 8 (with model/scene). Remove "16 credits", "30 credits" references.

**5. `src/pages/Generate.tsx`** — lines 2702-2703, 3229-3230, 3363-3365, 3484-3485
- Remove credit cost labels from quality selectors (since quality doesn't change price), or update them all to show 8 credits consistently.

**6. `src/components/app/GenerationModeToggle.tsx`** — lines 21-22
- Product Shot: `"4-8 credits/image"` (4 without model, 8 with)
- Virtual Try-On: `"8 credits/image"` (flat rate)

