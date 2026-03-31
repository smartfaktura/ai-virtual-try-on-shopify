

## Revert Output Format to PNG

The JPEG switch was made in the last edit. Reverting both lines back to `'png'`.

### Changes

#### File 1: `supabase/functions/generate-tryon/index.ts`
- Line 449: Change `output_format: 'jpeg'` → `output_format: 'png'`

#### File 2: `supabase/functions/generate-workflow/index.ts`
- Line 663: Change `output_format: 'jpeg'` → `output_format: 'png'`

### Note on File Size
The 20MB issue was caused by something else (not the format). PNG at 2K is lossless and will produce large files for photographic content — but since other generation paths (freestyle, Seedream) already output PNG at similar sizes without issue, this is consistent behavior. If the 20MB problem recurs, we can investigate the specific Selfie/UGC pipeline separately.

