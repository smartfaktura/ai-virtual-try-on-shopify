

# Add Loading Spinner to Download Button in Results

## Problem
The "Download All" button in the Product Images results (Step 6) changes its text to "Downloading…" but keeps the static Archive icon — no spinner or visual loading indicator to clearly signal work is happening.

## Fix

### File: `src/components/app/product-images/ProductImagesStep6Results.tsx`

**Line 4** — Add `Loader2` to the lucide import:
```typescript
import { Download, RefreshCw, CheckCircle, Archive, Loader2 } from 'lucide-react';
```

**Lines 161-162** — Replace the static Archive icon with a spinner when downloading:
```tsx
<Button variant="outline" onClick={handleDownloadAll} disabled={downloading || totalImages === 0} className="gap-1.5">
  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
  {downloading ? 'Downloading…' : 'Download All'}
</Button>
```

## Impact
- 1 file, 2 small changes
- Adds a spinning loader icon during ZIP download so users see clear activity feedback

