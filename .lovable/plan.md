

## Remove Image Count Stepper Entirely from Freestyle

The image count stepper code (definition + both render points) will be fully deleted — not hidden, not conditional, completely gone. We'll also clean up the related props from the component chain.

### Changes

| File | What |
|------|------|
| `FreestyleSettingsChips.tsx` | Delete `imageCountStepper` variable (lines 278-297). Remove both render references (line 382, line 495). Remove `imageCount`, `onImageCountChange`, `maxImageCount` from props interface and destructuring. Remove `Minus`, `Plus`, `Image` icon imports if unused elsewhere. |
| `FreestylePromptPanel.tsx` | Remove `imageCount`, `onImageCountChange`, `maxImageCount` from props interface and pass-through to `FreestyleSettingsChips`. |
| `Freestyle.tsx` | Remove `imageCount` state, `maxImageCount` derivation, and all prop-passing for these to `FreestylePromptPanel`. Hardcode `imageCount: 1` where it's used in generation/credit calculation. |

Three files, purely removing dead code. The stepper can be re-added later when multi-image generation is ready.

