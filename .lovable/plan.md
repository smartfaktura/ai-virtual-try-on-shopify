
## Move "Add styling direction" after "Edit all shots in bulk"

### Current state
- The "Add styling direction" collapsible (lines 2846-2870) sits between the mode pills and the manual mode content, visible in both AI and manual modes
- The "Edit all shots in bulk" collapsible ends at line 3212

### Changes in `ProductImagesStep3Refine.tsx`

1. **Remove** the styling direction collapsible from its current position (lines 2846-2870)

2. **Insert** it right after the "Edit all shots in bulk" `</Collapsible>` closing tag (after line 3212), before the Appearance collapsible. Keep the same compact style but place it inside the manual mode block.

3. **For AI mode**: Insert the same collapsible right after the AI confirmation box (after line 2844), so AI mode users can also add styling direction — just positioned lower, right after the AI confirmation message.

This keeps the collapsible in the same minimal style but moves it to a less prominent position, right after the bulk edit section in manual mode and after the confirmation in AI mode.
