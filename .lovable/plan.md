

## Compact "Share to Discover" Button with Tooltip

Move the Share to Discover from a separate banner below the action bar into a compact button inline with the other action buttons (Download, Copy Prompt, Delete). Use a tooltip to show the contest details on hover.

### Changes in `src/components/app/ImageLightbox.tsx`

1. **Remove the separate `onShare` block below the action bar** (lines ~172-180) — the standalone banner with Trophy icon and long text.

2. **Add a compact button inside the action bar** (after Delete button, ~line 170), matching the same style as other buttons (`bg-white/10 text-white/80 hover:bg-white/20`):
   ```
   <Tooltip>
     <TooltipTrigger asChild>
       <button onClick={onShare(currentIndex)} className="...same as other buttons...">
         <Trophy className="w-4 h-4" />
         Share
       </button>
     </TooltipTrigger>
     <TooltipContent>Win up to 10,000 credits each month</TooltipContent>
   </Tooltip>
   ```

3. **Wrap the bottom action bar** in a `<TooltipProvider>` so the tooltip works.

4. **Import** `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`.

Result: A clean, inline "Share" button with Trophy icon that matches the other buttons, with contest info revealed on hover via tooltip.

