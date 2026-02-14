

## Improve Generated Images Results UI/UX

### Changes

**File: `src/pages/Generate.tsx`**

1. **Remove emoji** from "Click images to select them" -- delete the `👆` emoji, keep the instruction text plain

2. **Move Select All and Download All buttons** into the top action bar (next to Adjust / Start Over) so all controls are visible immediately without scrolling

3. **Restructure the top bar layout** for mobile clarity:
   - On desktop: single row with title on left, all buttons on right
   - On mobile: title on top, buttons below in a wrapped row -- `Select All`, `Download All`, `Adjust`, `Start Over`

4. **Simplify the bottom section** since Download All and Select All are now at the top:
   - Keep "Saved to your library" confirmation
   - Keep "Download Selected (N)" and "View in Library" buttons
   - Remove "Download All" from bottom (it's now at the top)

### Specific Code Changes

**Lines 1848-1856** -- Replace the header/button bar:

```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
  <div>
    <h2 className="text-base font-semibold">Generated Images</h2>
    <p className="text-xs text-muted-foreground">Click images to select them</p>
  </div>
  <div className="flex flex-wrap gap-2">
    <Button variant="outline" size="sm" onClick={() => {
      setSelectedForPublish(new Set(generatedImages.map((_, i) => i)));
    }}>Select All</Button>
    <Button variant="outline" size="sm" onClick={handleDownloadAll}>
      <Download className="w-3.5 h-3.5 mr-1.5" /> Download All
    </Button>
    <Button variant="outline" size="sm" onClick={() => setCurrentStep('settings')}>
      Adjust
    </Button>
    <Button variant="outline" size="sm" onClick={handleStartOver}>
      Start Over
    </Button>
  </div>
</div>
```

**Lines 1911-1919** -- Simplify bottom actions (remove duplicate Download All):

```tsx
<div className="space-y-3">
  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
    <CheckCircle /> Saved to your library
  </p>
  <div className="flex flex-col sm:flex-row gap-2.5">
    <Button variant="outline" onClick={downloadSelected}>
      Download Selected (N)
    </Button>
    <Button onClick={() => navigate('/app/library')}>
      View in Library
    </Button>
  </div>
</div>
```

### Result

- No emoji clutter
- All key actions (Select All, Download All, Adjust, Start Over) visible at the top in one glance
- Bottom area simplified to contextual actions only (Download Selected, View in Library)
- Mobile: buttons wrap naturally in a flex-wrap row, all tappable at 44px+ height
