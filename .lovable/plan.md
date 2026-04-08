

# Fix: Strengthen Background Directive in Back View & Interior View (Bags)

## Problem
Two bag scenes use a weak inline `{{background}}` token that the AI model ignores during generation:

- **Back View**: `...structural details. {{background}} {{lightingDirective}}...` — background sits between sentences, gets lost
- **Interior View**: `...around the opening. {{background}} Soft even studio lighting...` — same issue, AI hallucinates its own background instead of using the selected gradient

Meanwhile, portrait scenes like "On Shoulder Editorial" and "Mid Portrait Hold" use the stronger pattern `BACKGROUND: {{background}} — use ONLY this background.` and those work correctly.

## Fix (2 database UPDATEs)

Replace the weak inline `{{background}}` with the enforced directive pattern in both templates:

### 1. Back View
**Before**: `...structural details. {{background}} {{lightingDirective}} {{materialTexture}}.`
**After**: `...structural details. BACKGROUND: {{background}} — use ONLY this background. {{lightingDirective}} {{materialTexture}}.`

### 2. Interior View  
**Before**: `...around the opening. {{background}} Soft even studio lighting...`
**After**: `...around the opening. BACKGROUND: {{background}} — use ONLY this background. Soft even studio lighting...`

## Why This Works
The `BACKGROUND: ... — use ONLY this background.` pattern is already proven in 2 other bag scenes (on-shoulder-editorial, mid-portrait-hold). It makes the directive explicit and authoritative so the AI model respects gradient/color selections instead of hallucinating its own environment.

## No frontend changes needed
Both scenes already have `background` in `trigger_blocks` — the UI background picker already appears. This is purely a prompt template fix.

