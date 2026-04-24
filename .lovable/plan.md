## /home hero — Dresses category, final scene list

All 12 image URLs verified against `product_image_scenes`. Card #11 will be **Side Lean Pose** (Side Lean Attitude Pose, dress variant) as you asked.

### What changes

**One file, asset-only.** No workflow logic, no DB writes, no edge functions, no new dependencies, no extra storage. Same `<img loading="lazy">` + `getOptimizedUrl` rendering pipeline already in use today — zero perf impact on the rest of the app.

```text
EDIT  src/components/home/HomeHero.tsx
```

### Final 12 cards

| # | Label shown | Source |
|---|-------------|--------|
| 0 | ↑ Original photo | Your `Chocolate Brown Ruched Mini Dress` upload (existing public URL) |
| 1 | Editorial | Flash Night Fashion Campaign — *Editorial Dress Portraits* |
| 2 | Studio | On-Model Front — *garments-dresses* |
| 3 | Lifestyle | Greenhouse Elegance |
| 4 | Lookbook | Desert Tailored Walk — *Editorial Dress Portraits* |
| 5 | Campaign | Golden Coast Dress |
| 6 | Outdoor Portrait | Old Money Outdoor Portrait — *Editorial Dress Portraits* |
| 7 | Flash Glamour | Flash Glamour Portrait — *Editorial Dress Portraits* |
| 8 | Architectural | Quiet Luxury Museum Staircase |
| 9 | Mirror Selfie | Power Mirror Statement Selfie — *Editorial Dress Portraits* |
| 10 | Studio Look | Mini Dress Studio Look |
| 11 | **Side Lean Pose** | Side Lean Attitude Pose — *Editorial Dress Portraits* |

### "Original" card visual treatment

Visually distinct so it reads as the source photo:
- `object-contain` + cream `bg-[#FAFAF8]` background + thin `ring-1 ring-foreground/15` border
- Caption "↑ Original photo" in dark text on a white-to-transparent gradient
- Same `aspect-[3/4]`, same `rounded-2xl`, same width — identical layout footprint

### Code preview

```tsx
// src/components/home/HomeHero.tsx — heroImages array + a small MarqueeCard variant prop change

const ORIGINAL_DRESS = '...product-uploads/.../1776686889528-b8ysdh.png';
const PREVIEW = (id: string) => `...product-uploads/.../scene-previews/${id}.jpg`;

const heroImages = [
  { label: 'Original',         src: ORIGINAL_DRESS, isOriginal: true },
  { label: 'Editorial',        src: PREVIEW('1776689318257-yahkye') },  // Flash Night Fashion Campaign
  { label: 'Studio',           src: PREVIEW('1776688965090-edaogg') },  // On-Model Front (dresses)
  { label: 'Lifestyle',        src: PREVIEW('1776840733386-n4bc6x') },  // Greenhouse Elegance
  { label: 'Lookbook',         src: PREVIEW('1776689316419-90khdg') },  // Desert Tailored Walk
  { label: 'Campaign',         src: PREVIEW('1776688403670-i0t3r6') },  // Golden Coast Dress
  { label: 'Outdoor Portrait', src: PREVIEW('1776689319922-8yiolc') },  // Old Money Outdoor Portrait
  { label: 'Flash Glamour',    src: PREVIEW('1776689317300-luvmhd') },  // Flash Glamour Portrait
  { label: 'Architectural',    src: PREVIEW('1776688413055-z73arv') },  // Quiet Luxury Museum Staircase
  { label: 'Mirror Selfie',    src: PREVIEW('1776689320622-0lnst1') },  // Power Mirror Statement Selfie
  { label: 'Studio Look',      src: PREVIEW('1776688404914-wwy92r') },  // Mini Dress Studio Look
  { label: 'Side Lean Pose',   src: PREVIEW('1776689321496-nclkyc') },  // Side Lean Attitude Pose
];
```

Approve and I'll ship it.
