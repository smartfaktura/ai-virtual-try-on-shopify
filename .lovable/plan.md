## /home — "Built for every category" updates (corrected)

You were right: the DB has **108 earring scenes** with previews in `product_image_scenes`. I was looking at the wrong table. Plan is now grounded in real data.

**File:** `src/components/home/HomeTransformStrip.tsx`

### 1. Footwear — prepend "Original" sneaker shot
Insert one new card at index 0 of `FOOTWEAR_CARDS` (~line 88), pointing at the supplied original render and labeled **"Original"**:

```ts
{ label: 'Original',
  src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/pair-display-shoes-sneakers-1776008063507.jpg?quality=60' },
```

Existing 12 cards stay; total becomes 13 — sets up the "input → outputs" story when the strip auto-rotates.

### 2. Bags — promote sculptural still to first slot, label as "Original"
In `BAGS_CARDS` (~line 104):
- Remove the entry currently at index 8 (`'Sculptural Product Still'`, preview `1776749548695-11dzfk`).
- Insert it at index 0 with label **"Original"**.

```ts
const BAGS_CARDS: GridCardData[] = [
  { label: 'Original', src: PREVIEW('1776749548695-11dzfk') },
  { label: 'Sculptural Studio Hero',     src: PREVIEW('1776239449949-ygljai') },
  { label: 'On-Shoulder Editorial',      src: PREVIEW('1776239446567-7mvigz') },
  // …rest in current order, with the old index-8 entry removed
];
```

### 3. Jewelry — earrings only, refreshed from DB (12 cards)
Replace the entire `JEWELRY_CARDS` array (~line 120) with the top 12 earring scenes from `product_image_scenes`, hand-picked across the available `sub_category` buckets (Essential Shots, On-Ear Editorial, Beauty Lifestyle UGC) for visual variety:

```ts
const JEWELRY_CARDS: GridCardData[] = [
  { label: 'Earring Touch Portrait', src: PREVIEW('1776753278458-z7rmxg') },
  { label: 'Side Profile Earrings',  src: PREVIEW('1776753261985-yi93vf') },
  { label: 'Sunlit Ear Study',       src: PREVIEW('1776753256682-343bsf') },
  { label: 'Window Shadow Still',    src: PREVIEW('1776753253052-fd9tdt') },
  { label: 'Sky Bloom Profile',      src: PREVIEW('1776753259830-t0mrxv') },
  { label: 'Hair Tucked Ear',        src: PREVIEW('1776753273285-bgevon') },
  { label: 'Sunlit Skin Close-Up',   src: PREVIEW('1776753255640-wl0j9d') },
  { label: 'Flash Glow Portrait',    src: PREVIEW('1776753275522-ljuq5p') },
  { label: 'Neckline & Earrings',    src: PREVIEW('1776753755775-c36aay') },
  { label: 'Shadow Gem Drop',        src: PREVIEW('1776753265588-dmlr31') },
  { label: 'Ear Stack Study',        src: PREVIEW('1776753279560-dyelri') },
  { label: 'Sunlit Beauty Moment',   src: PREVIEW('1776753754579-2rfq11') },
];
```

(Necklace entries `1776243905045-8aw72b`, `1776243907007-f0mhvm`, `1776243889543-u2eppc`, `1776243916154-emtkzb`, `1776243897922-iqre1y` are removed. The 6 earring previews previously in the file are kept; 6 new earring scenes are pulled in from the DB so it's a true 12-card jewelry grid — no duplicates.)

If you want a different curated mix (e.g. more On-Ear Editorial, fewer UGC), say so before I implement and I'll re-pick from the 108-scene pool.

### Risk
None — pure data-array changes. The existing warm-cache `useEffect` (line ~224) and pill-switch logic handle the new cards automatically.

**Approve to implement.**