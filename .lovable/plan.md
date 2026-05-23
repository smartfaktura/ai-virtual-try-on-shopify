## Problem

In the Step 4 tab bar, completed sub-steps render a check mark — except **Essentials**, which never gets one even when its required fields are filled. The code explicitly excludes essentials:

```
const done = t !== "essentials" && getSubStepDisabledReason(...) === null;
```

## Change

In `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`, remove the `t !== "essentials"` guard so every sub-step (Look, Essentials, People, Interaction, Styling) shows the check when its `getSubStepDisabledReason` returns `null`.

No other behavior changes.