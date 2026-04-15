

# Fix Freestyle Studio Card — Better Animations and Sizing

## Problem
The current card has issues visible in the screenshot:
- Text is too small (`text-xs` / `text-[10px]`)
- Typewriter animation doesn't work properly — the `white-space: nowrap` + `width: 0→100%` technique fails because the card constrains the width, so the text either overflows or doesn't animate visibly
- Too much empty space above the prompt bar (the visual area uses `aspect-[3/4]` with centered content)
- Pills are tiny and barely visible
- Overall feels flat and lifeless

## Root Cause of Animation Failure
The CSS typewriter technique using `width` + `steps()` + `overflow: hidden` + `white-space: nowrap` requires the text to be on a single line that expands. But the prompt text is long and the card is narrow, so it wraps or gets clipped incorrectly. The `white-space: nowrap` forces a single line that overflows the container.

## Solution
Rewrite the animation approach and tighten the layout:

**File: `src/components/app/FreestylePromptCard.tsx`**

### 1. Fix typewriter — use `max-width` + `ch` units
- Set text in a container with `white-space: nowrap` but use `max-width` animating from `0ch` to `${CHAR_COUNT}ch` instead of `width: 0 → 100%`
- Wrap the text container in an overflow-hidden div that constrains properly
- This ensures character-by-character reveal regardless of card width

### 2. Increase text sizes
- Prompt text: `text-sm` (was `text-xs`), mobile: `text-xs` (was `text-[10px]`)
- Pills: `text-xs` (was `text-[10px]`), mobile: `text-[10px]` (was `text-[8px]`)
- Title: `text-base font-bold` (was `text-sm`)

### 3. Reduce dead space
- Change visual area from `aspect-[3/4]` to a fixed padding approach (`py-8 px-5`) so it sizes to content naturally instead of forcing a tall empty box
- Move prompt bar higher with `justify-end` or tighter padding

### 4. Improve prompt bar styling
- Slightly darker background: `bg-muted/50` with stronger border `border-border/50`
- Add a subtle `shadow-sm` for depth
- Make send button more visible: `bg-primary/15` with `text-primary/70`

### 5. Add a looping reset
- After pills appear (at ~4s), hold for 2s, then fade everything out and restart
- Total loop: ~7s with `animation-iteration-count: infinite`
- Use a wrapper animation that controls opacity of the entire visual area

### 6. Ambient glow improvement
- Make the glow larger (`w-60 h-60`) and slightly more visible (`bg-primary/8`)
- Add a slow pulse animation to the glow

## Technical approach
- All CSS-only, no JS timers
- Use `@keyframes` with proper `forwards` and `infinite` where appropriate
- The typewriter uses `max-width` in `ch` units for reliable character reveal

