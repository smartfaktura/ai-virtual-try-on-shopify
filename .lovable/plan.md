Tighten the subgroup header row in `SubGroupSection` (`ProductImagesStep2Scenes.tsx`, ~line 852) so it breathes a bit more without changing layout structure.

**Changes** (one row only):
1. Add ~6px space right after the "EDITORIAL SHOTS" label so the divider line doesn't hug the text — bump the row's `gap-2` to `gap-3`, or add `ml-1` to the divider `<div className="h-px flex-1 bg-border ...">`.
2. Add a few px between the "2 selected" pill and the "Clear" button — change the inner `<div className="flex items-center gap-2 shrink-0">` from `gap-2` to `gap-3`.

No other elements, no font/size changes, no behavior changes. Single file edit.