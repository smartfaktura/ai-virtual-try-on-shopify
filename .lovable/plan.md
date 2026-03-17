

## Add Tooltips to Upscale & Perspectives Buttons

Wrap the two buttons in the WorkflowPreviewModal with `Tooltip` components to give users a brief description of what each function does.

### Changes (`src/components/app/WorkflowPreviewModal.tsx`)

1. **Import** `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`

2. **Wrap the grid** with `<TooltipProvider delayDuration={300}>`

3. **Upscale button** — wrap in `<Tooltip>` with content: "Enhance to 2K or 4K resolution with AI-reconstructed details"

4. **Perspectives button** — wrap in `<Tooltip>` with content: "Generate front, back & side angles from this image"

No layout changes — tooltips appear on hover only.

