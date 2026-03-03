

## Remove Hardcoded "No text" Negative Prompt from Freestyle Backend

### Rationale
The Exclude chip in the UI already offers "Text overlays" and "Watermarks" as user-selectable negatives. The hardcoded backend rule duplicates this and prevents users from generating images with intentional text/labels even when they want them.

The anatomical safety guards (exact limb counts, natural joint articulation) remain — those prevent AI artifacts no user would want.

### Change

**`supabase/functions/generate-freestyle/index.ts`** — line 96

Delete this single line from `buildNegativePrompt()`:
```
- No text, watermarks, logos, labels, or signatures anywhere in the image
```

Keep the surrounding lines (the "CRITICAL" header and the anatomical guards) intact.

One line removed, one file changed.

