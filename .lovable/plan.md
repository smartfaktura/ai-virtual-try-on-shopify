

## Add "Video Generation — Coming Soon" Button to Library & Workflow Modals

Add a disabled "Generate Video" button with a "Coming Soon" badge in two places:

### 1. `src/components/app/LibraryDetailModal.tsx` (~line 245, after "Generate Perspectives")

```tsx
<Button
  variant="outline"
  disabled
  className="w-full h-11 rounded-xl text-sm font-medium opacity-60 cursor-not-allowed"
>
  <Video className="w-4 h-4 mr-2" />
  Generate Video
  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coming Soon</span>
</Button>
```

Import `Video` from `lucide-react`.

### 2. `src/components/app/WorkflowPreviewModal.tsx` (~line 302, after the Upscale/Perspectives grid)

Add a full-width disabled button below the 2-column grid:

```tsx
<button
  disabled
  className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground/50 bg-muted/20 border border-border/20 cursor-not-allowed"
>
  <Video className="w-3.5 h-3.5" />
  Generate Video
  <span className="ml-1 text-[9px] uppercase tracking-wider font-semibold">Soon</span>
</button>
```

Both buttons are fully disabled with reduced opacity — no click handler, just a visual teaser.

