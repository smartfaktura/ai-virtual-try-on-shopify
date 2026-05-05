## Improve hat dimension fields for more accurate AI generation

Add crown height, brim type, and conditional style-specific fields for headwear categories.

### Changes in `src/lib/productSpecFields.ts`

**Hats** (line 125-129) — expand fields:
- Add `crownHeight` (Crown Height) input field after circumference
- Add `brimType` (Brim Type) select: Flat / Stiff, Slightly curved, Floppy / Soft, Upturned, Snap brim
- Keep existing: style, circumference, brimWidth

**Caps** (line 120-124) — add:
- `crownHeight` (Crown Height) input, placeholder 10cm
- `brimType` (Brim Type) select: Flat, Pre-curved, Slightly curved

**Beanies** (line 130-133) — add:
- `height` (Height) input, placeholder 22cm — how tall when laid flat
- `foldCuff` (Cuff) select: No cuff, Single fold, Double fold

**Conditional fields** via `CONDITIONAL_FIELDS`:
- `hats::style::Cowboy` — add `crownCrease` select: Cattleman, Pinch front, Gus, Open crown
- `hats::style::Bucket` — hide `brimType` (bucket hats don't have rigid brim distinction) via `CONDITIONAL_HIDE`

These fields feed directly into the AI prompt via the existing spec system, giving the generation model precise shape information (crown proportions, brim stiffness) for more realistic results.
