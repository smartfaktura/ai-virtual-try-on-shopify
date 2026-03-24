

# Move Prompt Helper to First Chips Row on Desktop

## Problem
On desktop, the Prompt Helper pill sits alone on a third row below the settings chips. There's plenty of space on the first row (Upload Image, Product, Model, Scene) to fit it there.

## Changes

### `src/components/app/freestyle/FreestylePromptPanel.tsx` (~lines 317-323)

Remove the standalone Prompt Helper button from after `FreestyleSettingsChips` and pass it as a prop or render it inside the chips component.

**Simpler approach**: Move the Prompt Helper button into `FreestyleSettingsChips` by passing it as a new prop (e.g. `promptHelperButton`), then render it at the end of the first row on desktop (line 326, after `{sceneChip}`) and in the mobile flow as before.

1. **`FreestyleSettingsChips.tsx`**: Add `promptHelperButton?: React.ReactNode` prop. Render it after `{sceneChip}` in the desktop first row (line 326) and at the end of the mobile chip flow.

2. **`FreestylePromptPanel.tsx`**: Instead of rendering the Prompt Helper button directly after `<FreestyleSettingsChips />`, pass it as the `promptHelperButton` prop:
   ```tsx
   <FreestyleSettingsChips
     ...
     promptHelperButton={
       <button
         onClick={() => setQuizOpen(true)}
         className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
       >
         <Wand2 className="w-3.5 h-3.5" />
         Prompt Helper
       </button>
     }
   />
   ```
   Remove the standalone button that currently lives after `</FreestyleSettingsChips>`.

### Files
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — accept and render `promptHelperButton` prop
- `src/components/app/freestyle/FreestylePromptPanel.tsx` — pass Prompt Helper as prop instead of rendering separately

