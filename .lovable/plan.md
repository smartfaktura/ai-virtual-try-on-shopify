## Set Jackets "Original" tile on /home

In `src/components/home/HomeTransformStrip.tsx`, update the `JACKETS_CARDS` array so the existing ghost-mannequin image (`1776690211513-2hgcjm`) becomes the first card, relabeled `Original` with the `isOriginal: true` flag (which renders the small "Original" badge in the top-right corner, matching Swimwear / Fragrance / Eyewear).

### Change

Reorder `JACKETS_CARDS` so the ghost mannequin entry is moved from position 3 to position 1, renamed to `Original`, and tagged `isOriginal: true`. All other 11 jacket tiles keep their order.

```ts
const JACKETS_CARDS: GridCardData[] = [
  { label: 'Original',                   src: PREVIEW('1776690211513-2hgcjm'), isOriginal: true },
  { label: 'Side Profile Street Study',  src: PREVIEW('1776691909999-ra3rym') },
  { label: 'Old Money Outdoor Portrait', src: PREVIEW('1776691906436-3fe7l9') },
  { label: 'On-Model Front',             src: PREVIEW('1776690214570-al6wzo') },
  // …rest unchanged
];
```

No other files need to change — the `GridCard` component already renders the `Original` pill when `isOriginal` is true.

**Approve to apply.**