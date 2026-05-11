# Add "any product" line to hero subhead

Make clear this isn't a dresses-only service. The sample shown happens to be dresses, but the product could be anything.

## Change

In `src/pages/showcase/BrandSampleShowcase.tsx`, hero subhead only:

- Old: `One product photo. A full editorial library. Below — a sample we built for a dress brand like yours`
- New: two lines, second line muted slightly:
  - Line 1: `One product photo. A full editorial library`
  - Line 2: `Dress, hat, energy drink, sofa — anything. Below, a sample for a dress brand like yours`

Implemented as the existing `<p>` with a `<br />` break, no new component or layout shift.

Nothing else changes.
