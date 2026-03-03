

## Hide Image Count Stepper for Free Users in Freestyle

The image count stepper is unnecessary visual clutter for free users who are locked to 1 image. Rather than showing a disabled stepper stuck at "1", simply hide it entirely.

### Changes

1. **`src/components/app/freestyle/FreestyleSettingsChips.tsx`** — Conditionally render `imageCountStepper` only when `maxImageCount > 1`. In both the desktop layout (line ~382, ~495) and mobile collapsible section, wrap the stepper in `{maxImageCount > 1 && imageCountStepper}`.

That's it — one file, two render points. The stepper disappears for free users and reappears when they upgrade.

