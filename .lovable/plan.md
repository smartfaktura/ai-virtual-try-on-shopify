

# Move Prompt Helper to Settings Chips Row, Keep Reset in Top-Right

## Changes

### `src/components/app/freestyle/FreestylePromptPanel.tsx`

1. **Remove Prompt Helper from the top-right absolute container** (lines 263-281) — keep only the Reset button there, with more right padding (`right-4 sm:right-6`) to avoid overlapping long prompts

2. **Add Prompt Helper as a pill in the settings chips row** (after line 324, inside the chips `<div>`) — styled like other pills (rounded-full, border, same height):
   ```tsx
   <button
     onClick={() => setQuizOpen(true)}
     className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
   >
     <Wand2 className="w-3.5 h-3.5" />
     Prompt Helper
   </button>
   ```

3. **Reset button stays top-right** but pushed slightly further from edge:
   ```tsx
   <div className="absolute top-2 right-4 sm:top-3 sm:right-6">
     {isDirty && onReset && (
       <button ...>
         <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
       </button>
     )}
   </div>
   ```

4. **Textarea right padding** increased from `pr-8` to `pr-10` to give Reset button breathing room on both mobile and desktop.

