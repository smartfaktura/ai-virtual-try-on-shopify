

# Improve Prompt Builder: Position, Layout, Mobile UX, and Prompt Quality

## Changes

### 1. Move Prompt Helper button inline with prompt textarea (`FreestylePromptPanel.tsx`)
- Remove the standalone `promptHelperButton` from the settings chips section
- Add a small "Prompt Helper" trigger button **inside the prompt textarea row**, positioned at the bottom-right of the textarea area (like a floating action pill)
- Style: subtle pill with Wand2 icon, `text-xs`, positioned absolute bottom-right of the prompt input area

### 2. Improve Quiz modal layout and mobile UX (`PromptBuilderQuiz.tsx`)
- **Mobile**: Use `h-[100dvh]` full-screen sheet anchored from bottom with `rounded-t-2xl`, content area `flex-1 overflow-y-auto`, footer pinned to bottom
- **Desktop**: Keep centered dialog but increase `max-w-xl` for more breathing room
- **Option cards**: Increase padding, add more vertical gap between grid items
- **Step content area**: Add more generous padding (`px-6 py-6`) for spacious feel
- **Header**: Clean VOVV.AI branded bar — remove emoji from "Your prompt is ready" title
- **Progress**: Replace dots with a thin progress bar under the header
- **Footer**: Sticky bottom with generous padding, subtle top border

### 3. Enhance prompt engineering templates (`promptBuilderTemplates.ts`)
Add photography-grade technical language to the assembled prompts:

- **Camera/lens hints per mood**: e.g., luxury gets "shot with 85mm f/1.4 lens, shallow depth of field"; minimal gets "even diffused lighting, 50mm prime lens"
- **Lighting directives per setting**: studio = "three-point lighting setup"; outdoor = "golden hour natural light"; indoor = "soft window light with fill bounce"
- **Composition cues per framing**: full-body = "rule of thirds placement, negative space above"; close-up = "macro detail, bokeh background"
- **Surface/texture hints per category**: food = "rustic wood or marble surface"; jewelry = "velvet or reflective surface"
- **Color temperature hints per mood**: warm = "warm white balance 4500K"; minimal = "neutral daylight 5600K"

These additions make prompts ~20-30% richer without being overly long, following Gemini best practices for specificity.

### Files
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — move button inline with prompt
- `src/components/app/freestyle/PromptBuilderQuiz.tsx` — layout/spacing/mobile improvements
- `src/lib/promptBuilderTemplates.ts` — richer prompt fragments with camera/lighting/composition details

