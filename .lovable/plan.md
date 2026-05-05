## Changes

### `src/lib/productSpecFields.ts` — Replace size-only fields with visually relevant ones

Size doesn't affect generated images. Replace with fields that describe what the garment actually looks like:

**Swimwear** (currently: just Size)
- `style`: Bikini, One-piece, Tankini, Swim trunks, Board shorts, Coverup, Rash guard
- `coverage`: Minimal, Moderate, Full
- `cut`: High-cut, Classic, Brazilian, Boy-short, String

**Lingerie** (currently: just Size)
- `style`: Bra, Bralette, Bodysuit, Slip, Corset, Set, Robe
- `coverage`: Sheer, Light, Full

**Activewear** (currently: just Size)
- `style`: Leggings, Shorts, Sports bra, Tank top, Jacket, Set, Other
- `fit`: Compression, Slim, Regular, Loose
