

# Fix Animation Hopping & Update Card Title/Subtitle

## Problems
1. **Chip text hopping**: `CyclingChip` labels have varying widths ("Skincare" vs "Leather Bag"), causing the flex row to reflow on each cycle. Fix: give the text span a fixed `min-w` so width doesn't change.
2. **MiniAvatars pulse**: The CSS `pulse` animation scales the dots, shifting neighboring chips. Fix: remove the pulse animation.
3. **Flex wrap reflow**: The chips container uses `flex-wrap`, so width changes cause line-break jumps. Fix: use `flex-nowrap overflow-hidden` so chips stay on one line.
4. **Title/subtitle mismatch**: Card still says "Freestyle Studio" / "Prompt + product + model + scene". Should match the nav label "Create with Promt".

## Changes — `src/components/app/FreestylePromptCard.tsx`

### 1. Fix CyclingChip width stability (line 84)
Change `truncate max-w-[60px]` to a fixed width: `w-[60px] truncate` — this prevents the chip from resizing when labels change.

### 2. Remove MiniAvatars pulse animation (line 105)
Remove `animation: \`pulse 2.5s...\`` from the style prop. The dots stay static — no more layout shift.

### 3. Prevent chip row wrapping (line 149)
Change `flex flex-wrap` to `flex flex-nowrap` and add `overflow-hidden` to keep chips on a single stable line.

### 4. Update badge text (line 145)
"Freestyle Studio" → "Create with Promt"

### 5. Update title & subtitle (lines 191-194)
- Title: "Freestyle Studio" → "Create with Promt"
- Subtitle: "Prompt + product + model + scene" → "Describe any product shot you imagine"

### 6. Update button label (line 206)
"Open Studio" → "Start Creating"

