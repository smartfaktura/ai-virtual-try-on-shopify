

## Modernize Forgot Password Dialog

Polish the reset password dialog to feel cleaner and more modern:

### File: `src/pages/Auth.tsx` (lines 225-295)

**Form state (lines 250-292):**
- Remove the `Label` — use placeholder-only input with `rounded-full bg-muted/50 border-0 h-11 px-5` styling to match modern auth pages
- Make the "Send reset link" button `rounded-full` with subtle shadow
- Style "Back to sign in" link with slightly more padding and smoother hover transition

**Success state (lines 236-249):**
- Add a soft green/primary tinted circle background behind the CheckCircle icon
- Make "Try another email" button `rounded-full` to match
- Add a subtle `text-center` to the success description

**Dialog container (line 226):**
- Add `rounded-2xl` to `DialogContent` for softer corners
- Add slight padding bump for breathing room

