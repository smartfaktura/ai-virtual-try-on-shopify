## Change

`src/features/brand-scenes/wizard/steps/Step4Environment.tsx` (line 133)

Remove the redundant `<ChapterHeading>Scene</ChapterHeading>` that sits directly above the `Scene type` Section. Keep only the `Scene type` Section label so the page reads cleanly:

- Where does it happen?
- Scene type (single label)
- [picker cards]

The wrapper `<div>` stays so layout/spacing is unchanged.

## Result
No more duplicate "SCENE / SCENE TYPE" stack — just one "SCENE TYPE" label above the picker.
