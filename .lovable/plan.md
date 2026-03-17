

## Lock Flat Lay to High Quality Only

Two changes in `src/components/app/generate/WorkflowSettingsPanel.tsx`:

1. **Force high quality on mount** (line 161-163): Add `isFlatLay` to the existing useEffect:
   ```ts
   useEffect(() => {
     if (isSelfieUgc || isFlatLay) setQuality('high');
   }, [isSelfieUgc, isFlatLay, setQuality]);
   ```

2. **Hide quality selector for flat lay** (lines 598-606): Wrap the Quality dropdown so it only shows when not flat lay, and display a static "High — Best quality" label instead:
   ```tsx
   <div className="space-y-2">
     <Label>Quality</Label>
     {isFlatLay ? (
       <p className="text-sm text-muted-foreground">High — Best quality</p>
     ) : (
       <Select ...>...</Select>
     )}
   </div>
   ```

The credit display (line 621) will automatically show `× 16 credits` since quality is always `'high'`.

