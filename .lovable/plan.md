

## Two Changes to Freestyle Prompt Panel

### 1. Bigger textarea on mobile

Currently `rows={isMobile ? 2 : 3}` with `min-h-[48px]` — too small for editing long prompts on mobile.

**Change in `FreestylePromptPanel.tsx` (line 243-244):**
- Increase mobile rows from 2 → 4
- Increase mobile `min-h` from `48px` → `100px`
- Keep desktop at rows=3 / `min-h-[72px]`

### 2. Reset button

Add a "Reset" button to the action bar (Row 3) that clears all prompt bar state in one click.

**FreestylePromptPanel changes:**
- Add a new `onReset` prop
- Render a ghost button with a `RotateCcw` icon + "Reset" label in the action bar, left-aligned (`mr-auto`), only visible when there's something to reset (prompt has text, or any setting is non-default)

**Freestyle.tsx changes:**
- Create a `handleReset` callback that resets all state to defaults:
  - `prompt` → `''`
  - `sourceImage` / `sourceImagePreview` → `null`
  - `selectedModel` → `null`
  - `selectedScene` → `null`
  - `selectedProduct` → `null`
  - `aspectRatio` → `'1:1'`
  - `quality` → `'standard'`
  - `stylePresets` → `[]`
  - `negatives` → `[]`
  - `cameraStyle` → `'pro'`
  - `framing` → `null`
  - `selectedBrandProfile` → `null`
  - `polishPrompt` → `true`
- Pass `onReset={handleReset}` to `FreestylePromptPanel`

The reset button appears on all viewports (mobile, tablet, desktop) and only shows when at least one setting differs from defaults.

### Files to modify
- `src/components/app/freestyle/FreestylePromptPanel.tsx`
- `src/pages/Freestyle.tsx`

