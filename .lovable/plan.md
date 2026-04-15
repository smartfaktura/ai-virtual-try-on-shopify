

# Bigger Preset Cards + Typing Effect in Prompt Bar

## Changes

### 1. Enlarge quick-start scene cards
**File: `src/components/app/freestyle/FreestyleQuickPresets.tsx`**

- Increase thumbnail from `w-11 h-11` to `w-14 h-14` (lines 218-219)
- Increase card padding from `px-3.5 py-2.5` to `px-4 py-3` (line 209)
- Bump scene name text from `text-xs` to `text-sm` (line 222)
- Bump category text from `text-[10px]` to `text-xs` (line 223)

### 2. Add typing placeholder effect to prompt textarea
**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

When the prompt is empty and the user hasn't focused the textarea yet, cycle through example prompts with a typewriter effect in the placeholder area:

- Add a small custom hook/state inside `FreestylePromptPanel` that cycles through 3-4 example phrases:
  - "A luxury perfume on marble with golden hour lighting..."
  - "Streetwear jacket on a model in an industrial warehouse..."
  - "Minimalist skincare flat-lay with botanicals and morning light..."
  - "Sneakers on concrete with dramatic shadow play..."
- The effect types one character at a time, pauses, then erases and moves to the next phrase
- Disappears immediately when user focuses the textarea or starts typing (set a `hasInteracted` flag)
- Implementation: overlay a `<span>` with the animated text on top of the textarea (since native `placeholder` can't animate), hide it when `prompt.length > 0` or focused

### Technical notes
- Typing speed: ~40ms per character, pause 2s at full text, erase at ~20ms
- The overlay span uses same font/size/color as the placeholder (`text-base text-muted-foreground/50`)
- 2 files changed, no new files

