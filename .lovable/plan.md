

## Add Freestyle First-Time Helper Guide

### Concept
A dismissible, step-by-step tooltip/card guide that appears the first time a user visits the Freestyle page. It highlights the key chips in the prompt bar (Add Product, Model, Scene, Generate) with numbered steps explaining what each does. The user can step through or dismiss entirely, and the dismissed state persists via `localStorage`.

### Steps (what the user sees)

1. **"Add Your Product"** — "Select the product you want featured in your image"
2. **"Choose a Model"** — "Pick a specific model to appear in your photo"
3. **"Set the Scene"** — "Choose a background or environment for the shoot"
4. **"Write a Prompt & Generate"** — "Describe any extra details, then hit Generate!"

### Design
- A floating card anchored near the prompt panel (above it on desktop, overlay on mobile)
- Shows current step number (e.g., "Step 1 of 4"), title, description, and a "Next" / "Got it" button
- Each step subtly highlights the relevant chip area using a pulsing ring or arrow indicator
- "Skip guide" link to dismiss immediately
- Compact, non-blocking — doesn't cover the gallery

### Implementation

**1. New component: `src/components/app/freestyle/FreestyleGuide.tsx`**
- Accepts `currentStep`, `onNext`, `onDismiss` props
- Renders a small card with step content, progress dots, Next/Skip buttons
- Each step has a `targetLabel` that maps to a chip name for visual emphasis
- Uses `localStorage` key `freestyle_guide_dismissed` to persist dismissal

**2. `src/pages/Freestyle.tsx`**
- Add state: `showGuide` initialized from `localStorage` (show if not dismissed)
- Add `guideStep` state (0-3)
- Render `<FreestyleGuide>` above/beside the prompt panel
- On dismiss: set `localStorage` item and hide
- Pass a `highlightedChip` prop down to `FreestylePromptPanel` → `FreestyleSettingsChips` to add a subtle pulse ring on the active step's chip

**3. `src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Accept optional `highlightedChip?: string` prop
- When a chip's key matches `highlightedChip`, add a `ring-2 ring-primary/50 animate-pulse` class to draw attention

### Files changed — 3
- `src/components/app/freestyle/FreestyleGuide.tsx` (new) — Step-by-step helper card
- `src/pages/Freestyle.tsx` — Guide state management and rendering
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — Optional highlight ring on targeted chip

