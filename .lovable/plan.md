

# Premium Setup Step Redesign

## Problem
The current Setup step feels overcrowded and lacks premium spacing. Specific issues:
- "Choose model" section has redundant text ("Select a model or skip..."), dated All/Women/Men pill tabs, and a single `User` icon instead of a visual model indicator
- "Outfit details" and "Model styling" feel disconnected — users don't understand they're related styling controls
- Style direction cards are plain white boxes with no visual personality
- "Needs model" uses amber/yellow which isn't on-brand for VOVV.AI
- Sticky bar still says "Refine" instead of "Setup"

## Changes

### 1. Rename "Refine" → "Setup" in sticky bar
**File: `ProductImagesStickyBar.tsx`**
- Change `STEP_LABELS[3]` from `'Refine'` to `'Setup'`
- Change CTA label case 2 from `'Refine'` to `'Setup'`

### 2. Redesign "Choose model" card
**File: `ProductImagesStep3Refine.tsx` — `ModelPickerSections`**
- Remove the redundant subtitle "Select a model or skip to customize manually below."
- Replace `User` icon in header with 3 small overlapping avatar circles (CSS `flex -space-x-2` with 3 `w-5 h-5` rounded-full divs using `Users` icon or gradient placeholders)
- Replace the `Tabs` (All/Women/Men) with inline text-style filter links: `All · Women · Men` using simple underline-active styling (no pill background)
- Move filter into the header row (right-aligned) to save vertical space
- Add more padding (`p-5`) and `space-y-5` for premium breathing room

### 3. Replace amber "Needs model" with branded color
**File: `ProductImagesStep3Refine.tsx`**
- Replace all `amber-100/amber-700/amber-400/amber-900` references with `primary/10`, `primary`, `primary/80` (the dark navy brand color)
- Shot card "Needs model" badge: `bg-primary/10 text-primary border border-primary/20`
- Summary stat chip for "N need a model": same primary-tinted style
- Background "select a background" hint: use `primary/5` bg with `primary/60` text instead of amber

### 4. Add visual flair to Style direction cards
**File: `ProductImagesStep3Refine.tsx` — `OutfitPresetsOnly`**
- Add a subtle colored accent bar (3px) at the top of each card using preset-specific tones:
  - Studio Standard: `bg-slate-300`
  - Editorial: `bg-zinc-800`
  - Minimal: `bg-stone-200`
  - Streetwear: `bg-neutral-700`
  - Luxury Soft: `bg-amber-200`
- Increase card width from `w-[160px]` to `w-[170px]`, add `overflow-hidden` for the accent bar
- Increase internal padding slightly for premium feel

### 5. Merge "Outfit details" + "Model styling" under unified section
**File: `ProductImagesStep3Refine.tsx` — Optional section**
- Replace the separate "Optional" label + two independent collapsibles with a single `Card` wrapper titled **"Outfit & Model styling"** with subtitle "Fine-tune outfit pieces, appearance, and accessories."
- Inside: two collapsible sub-sections (Outfit details, Appearance) — same content, but now visually grouped as one related unit
- Remove the generic "Optional" uppercase label

### 6. Add premium spacing throughout
**File: `ProductImagesStep3Refine.tsx`**
- Increase outer `space-y-6` to `space-y-8`
- Add `space-y-5` inside section cards instead of `space-y-3`
- Add subtle section dividers with more margin (`my-6` on Separators)

### Files modified
1. `src/components/app/product-images/ProductImagesStickyBar.tsx` — "Refine" → "Setup"
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — all UI changes above

