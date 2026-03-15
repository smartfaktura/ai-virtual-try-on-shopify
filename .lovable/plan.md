

## Make All Perspectives Show Full Reference Upload Zone

### What changes

**`src/pages/Perspectives.tsx`** — Two changes:

1. **Update `FALLBACK_VARIATIONS`** (lines 47-53): Give every variation a `referenceUpload` config with `recommended: true` so they all show the full drag-drop zone instead of the small text link. Currently `closeup` and `wide` have `referenceUpload: null`, and `left`/`right` have `recommended: false`.

```typescript
const FALLBACK_VARIATIONS: VariationType[] = [
  { id: 'closeup', label: 'Close-up / Macro', instruction: '...', category: 'detail',
    referenceUpload: { prompt: 'Upload a close-up reference of your product for best results (optional)', recommended: true } },
  { id: 'back', label: 'Back Angle', instruction: '...', category: 'angle',
    referenceUpload: { prompt: 'Upload a back view of your product for best results (optional)', recommended: true } },
  { id: 'left', label: 'Left Side', instruction: '...', category: 'angle',
    referenceUpload: { prompt: 'Upload a left side view of your product for best results (optional)', recommended: true } },
  { id: 'right', label: 'Right Side', instruction: '...', category: 'angle',
    referenceUpload: { prompt: 'Upload a right side view of your product for best results (optional)', recommended: true } },
  { id: 'wide', label: 'Wide / Environment', instruction: '...', category: 'context',
    referenceUpload: { prompt: 'Upload a wide/environment reference of your product for best results (optional)', recommended: true } },
];
```

2. **Remove the non-recommended code path** (lines 936-970): Delete the entire `{hasRefUpload && !v.referenceUpload!.recommended && (...)}` block since all variations now use `recommended: true`.

### Regarding whether reference images are sent to generation

Yes, confirmed. The data flow works correctly:
- `referenceImages[i]` is passed as `referenceImageUrl` on each variation (line 431)
- In `useGeneratePerspectives.ts`, it's converted to base64 (line 357) and added to the payload as `referenceAngleImage` (line 391)
- In `generate-freestyle/index.ts`, it's injected into the multimodal content array as `[REFERENCE IMAGE]` (lines 944-947)
- The prompt already contains angle-specific `ANGLE REFERENCE` instructions when a reference is present (lines 253-267)

No changes needed on the generation side — the reference images are already correctly wired end-to-end.

### Files changed
| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | Set all variations to `recommended: true` with proper prompts; remove non-recommended UI block |

