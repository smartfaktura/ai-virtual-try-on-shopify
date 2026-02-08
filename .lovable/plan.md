

# Simplified Brand Profile Wizard -- Modern, Clean Redesign

## Problem with Current Wizard

The current 6-step wizard is overloaded with technical photography jargon (composition bias, lighting style, color temperature). It forces choices that lock every future generation into the same look -- e.g., always "centered" composition, always "studio flat" lighting. This is counterproductive for a tool that should produce varied, brand-consistent images. The visual design also feels form-heavy and outdated compared to the rest of the app's luxury-minimal aesthetic.

## New Approach: 3 Simple Steps

Collapse from 6 steps to 3 easy steps. Focus on **brand feel** rather than technical camera settings. Remove composition bias and single-choice lighting/background (those belong at generation time, not brand level). Keep the wizard on the same page (`/app/brand-profiles/new` and `/:id/edit`) with the same styling system.

### Step 1: Your Brand
- Brand name (required)
- Short description (optional, 1-2 sentences)
- Target audience (optional, short text)

### Step 2: Visual Style
- **Mood** -- visual card grid (replaces "tone"), same options but presented as large clickable mood cards with descriptions: Luxury, Clean, Bold, Minimal, Playful
- **Color Feel** -- new simplified selector replacing color temperature + color palette. Options: `Warm & Earthy`, `Cool & Crisp`, `Neutral & Natural`, `Rich & Saturated`, `Muted & Soft`, `Vibrant & Bold`. Each maps to prompt text behind the scenes. Users can optionally add brand hex colors below.
- **Brand Keywords** -- chip picker with suggestions (sustainable, handcrafted, premium, etc.)

### Step 3: Avoid These
- **Do-Not Rules** -- chip-style selector with common suggestions + custom input
- Combined "Review" section at the bottom showing the live prompt impact preview before saving

### Removed Fields
- **Composition Bias** -- removed entirely (bad to lock all shots to same composition)
- **Lighting Style** as a single forced choice -- removed (the AI should pick lighting contextually)
- **Background Style** as a single forced choice -- removed (varies per generation)
- **Color Temperature** -- replaced by the friendlier "Color Feel" selector
- **Photography Reference** -- removed (niche, rarely used)
- **Preferred Scenes** -- removed from brand profile (belongs at generation time)
- **Separate Review step** -- integrated into Step 3 bottom section

### Database Impact
- The existing columns remain (backward compatible) but the wizard simply stops writing to `composition_bias`, `lighting_style`, `background_style`, `preferred_scenes`, `photography_reference` -- they keep their defaults
- No new migration needed. The new `color_feel` concept maps to the existing `color_temperature` column (reused with new values)

### Prompt Builder Updates
- `brandPromptBuilder.ts` updated to handle the new "Color Feel" values and generate richer, less restrictive prompt text
- Instead of "Lighting: studio flat", the builder produces guidance like "Prefer warm, earthy tones with natural warmth" -- giving the AI creative freedom while maintaining brand feel

---

## Detailed File Changes

### `src/components/app/BrandProfileWizard.tsx` -- Full Rewrite
- 3 steps instead of 6: "Your Brand", "Visual Style", "Avoid These"
- Visual mood card grid for tone selection (large cards with icon/description, not small text chips)
- Color Feel selector as a 2x3 grid of visual cards with color gradient previews
- Inline prompt impact preview at the bottom of Step 3 (no separate review step)
- Sleek progress indicator (3 dots/segments instead of 6 chips)
- Same `max-w-2xl mx-auto` layout, same card styling
- Save button on Step 3 with inline prompt preview above it

### `src/lib/brandPromptBuilder.ts` -- Update
- Add `COLOR_FEEL_DESCRIPTIONS` mapping (e.g., `'warm-earthy' -> 'warm earth tones, natural warmth, amber and terracotta accents'`)
- Simplify `buildBrandPrompt` to not produce overly rigid instructions for composition/background
- Remove composition and lighting from the style guide output (they were making all images look the same)
- Keep the individual step impact functions but simplify them to match 3 steps

### `src/components/app/BrandProfileCard.tsx` -- Update
- Remove composition bias and lighting display rows
- Show Color Feel as a styled label instead
- Keep color palette dots and keyword tags

### `src/components/app/freestyle/BrandProfileChip.tsx` -- Minor update
- Remove composition/lighting from the popover summary
- Show Color Feel instead

### `supabase/functions/generate-freestyle/index.ts` -- Update
- Update `BrandProfileContext` to use the new Color Feel field
- Remove rigid composition/lighting injection
- Use the friendlier prompt text from the updated builder logic

### `supabase/functions/generate-product/index.ts` -- Update
- Same changes as freestyle: use Color Feel, remove rigid composition instructions

---

## Visual Design for New Wizard

**Step indicator**: 3 minimal dots with connecting lines at the top, active dot is filled primary color.

**Mood cards (Step 2)**: 
- 5 cards in a responsive grid (2-3 columns)
- Each card: ~120px tall, rounded-xl, subtle border
- Selected state: primary border + light primary background tint
- Contains: mood name (capitalized), 1-line description in muted text

**Color Feel cards (Step 2)**:
- 6 cards in a 2x3 grid
- Each card: rounded-lg, left border with gradient matching the color feel
- Contains: name + short description
- Selected state: primary ring + tinted background

**Prompt Impact (Step 3 bottom)**:
- Collapsible section titled "What the AI will see"
- Shows the assembled brand style guide text
- Styled with the existing `border-primary/20 bg-primary/5` pattern

---

## Technical Details

### Color Feel Mapping

| UI Label | Stored Value | Prompt Text |
|----------|-------------|-------------|
| Warm and Earthy | warm-earthy | warm earth tones, natural warmth, amber and terracotta accents |
| Cool and Crisp | cool-crisp | cool tones, clean whites, blue and silver undertones |
| Neutral and Natural | neutral-natural | true-to-life colors, balanced exposure, no heavy grading |
| Rich and Saturated | rich-saturated | deep saturated colors, bold and vivid palette, high color impact |
| Muted and Soft | muted-soft | desaturated pastels, soft muted tones, dreamy and gentle palette |
| Vibrant and Bold | vibrant-bold | high energy colors, bright and punchy, strong contrast |

These values are stored in the existing `color_temperature` column (repurposed with richer values).

### Brand Palette (Optional Add-on in Step 2)

Below the Color Feel cards, an optional "Brand Colors" section lets users add hex colors. These are stored in the existing `color_palette` array column. The prompt builder appends them as: `"Brand accent colors: #F5E6D3, #2C3E50"`.

### Files Summary

| File | Action |
|------|--------|
| `src/components/app/BrandProfileWizard.tsx` | Rewrite (3-step simplified wizard) |
| `src/lib/brandPromptBuilder.ts` | Update (Color Feel mapping, remove rigid fields) |
| `src/components/app/BrandProfileCard.tsx` | Update (remove composition/lighting rows) |
| `src/components/app/freestyle/BrandProfileChip.tsx` | Update (simplified summary) |
| `supabase/functions/generate-freestyle/index.ts` | Update (new brand context shape) |
| `supabase/functions/generate-product/index.ts` | Update (new brand context shape) |

No database migration needed -- reuses existing columns with new values.

