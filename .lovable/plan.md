

## Remove Spinning Ring from GlobalGenerationBar

The "bug-like" rotating element is the animated border ring overlaid on the avatar stack in the compact pill. Two instances to remove:

### Changes in `src/components/app/GlobalGenerationBar.tsx`

1. **Line 214-217** — Remove the spinning ring on the compact pill (the one visible in your screenshot):
   ```
   {/* Spinning ring on primary avatar */}
   {processingJobs > 0 && (
     <span className="absolute -inset-0.5 rounded-full border-2 border-transparent border-t-primary animate-spin pointer-events-none" />
   )}
   ```
   Delete these 4 lines entirely.

2. **Line 262-264** — Remove the spinning ring on individual avatars in the expanded detail list:
   ```
   {isProcessing && (
     <span className="absolute -inset-0.5 rounded-full border-[1.5px] border-transparent border-t-primary animate-spin pointer-events-none" />
   )}
   ```
   Delete these 3 lines entirely.

The "Processing" badge and progress bar remain as loading indicators — only the spinning border effect is removed.

