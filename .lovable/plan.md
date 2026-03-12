

## Increase Topaz Upscaling Sharpness & Texture

### Change — 1 file

**`supabase/functions/upscale-worker/index.ts`** (lines 10-13)

Push all texture/sharpness parameters higher while keeping denoise very low to preserve natural grain:

| Parameter | 2K now → new | 4K now → new |
|-----------|-------------|-------------|
| sharpen | 0.6 → 0.85 | 0.7 → 0.9 |
| fix_compression | 0.5 → 0.6 | 0.5 → 0.65 |
| denoise | 0.15 → 0.05 | 0.1 → 0.03 |
| strength | 0.7 → 0.85 | 0.8 → 0.9 |

- **sharpen** cranked up for crisp micro-detail (fabric weave, skin texture, hair strands)
- **denoise** dropped near zero to keep natural grain and avoid the smooth "AI" look
- **fix_compression** bumped slightly to clean source artifacts without softening
- **strength** raised for more aggressive detail recovery

