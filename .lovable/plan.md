## Goal

Remove the admin-only "Asset Preview Generation" block from `/app/settings`. It's a one-off maintenance tool that doesn't belong in user settings and could cause issues if accidentally clicked.

## Changes (one file: `src/pages/Settings.tsx`)

### 1. Remove the JSX block (lines 714–744)

Delete the entire `{/* ─── Admin: Asset Preview Generation ─── */}` block including the `<Separator />` and the card.

### 2. Remove the handler (lines 425–463)

Delete `handleGenerateAssetPreviews` function entirely — no longer referenced.

### 3. Remove unused state (lines 256–257)

```tsx
const [isGenerating, setIsGenerating] = useState(false);
const [genProgress, setGenProgress] = useState({ processed: 0, total: 19 });
```

### 4. Clean up unused import

Remove `RefreshCw` from the lucide-react import on line 4 (only used by this block):

```tsx
// Before
import { Building2, Check, ExternalLink, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
// After
import { Building2, Check, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
```

`Progress` import stays as-is (used elsewhere — actually let me leave it untouched to be safe; the linter will flag if truly unused).

## Result

- Admin block gone — no risk of accidental triggers
- Admin Feedback Panel below it stays untouched
- The edge function `generate-asset-previews` itself is **not** deleted — it remains available if needed later via direct invocation, just not exposed in the Settings UI