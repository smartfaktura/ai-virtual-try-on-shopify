

## Replace Scene Cards in Environment Showcase

### Change
In `src/components/landing/EnvironmentShowcaseSection.tsx`, replace 3 items in ROW_2 (Night Drive Glam, Desert Sunset, Golden Radiance Product) with the 8 requested scenes, using their database image URLs.

**File: `src/components/landing/EnvironmentShowcaseSection.tsx` (lines 29-37)**

Replace the current ROW_2 array with:

```typescript
const ROW_2: EnvironmentCard[] = [
  d('Greenhouse Elegance', `${SB}/8accd42f-72de-482c-a0e2-5ac2f0162f74.jpg`),
  d('Sunlit Botanical Surface', `${SB}/d576a95a-5d0a-4768-b8b6-62c8f9a5d240.png`),
  d('Frozen Aura', `${SB}/2f6bb14f-fe0b-4d06-9aa9-a318a8fd39fd.png`),
  d('Marble Console Vignette', `${SB}/84f7f8e7-6535-4a4c-8008-854f3906b5b5.png`),
  d('Dynamic Water Splash', `${SB}/baebb27e-f66f-4968-95d1-0ce7e21a84e4.png`),
  d('Frozen Product', `${SB}/6c8fd139-0a5b-4b27-a861-c5c7cb1adc78.png`),
  d('Amber Glow Studio', `${SB}/91418be3-6c16-4573-b97b-8c757b37a792.png`),
  d('Prism Glow Showcase', `${SB}/5f8adc87-03b4-4238-827a-fd0ec79c4695.png`),
  d('Urban Motion', `${SB}/4c1ee736-0e5e-475c-a5a2-06492f472c33.jpg`),
  d('Stadium Seating Fashion', `${SB}/f5122391-5b70-4b6b-9d61-be96e27d376f.jpg`),
  d('Desert Horizon', `${SB}/9dca223b-3e30-4f21-8d3c-41cd5f790208.png`),
  d('Fisheye Portrait', `${SB}/0544388b-9cb9-4a2d-b101-c8c85640e67e.png`),
];
```

This removes Night Drive Glam, Desert Sunset, and Golden Radiance Product, adds the 8 new scenes (Greenhouse Elegance, Frozen Aura, Dynamic Water Splash, Frozen Product, Amber Glow Studio, Urban Motion, Stadium Seating Fashion, Fisheye Portrait), and keeps the existing items that weren't mentioned. The marquee duration on ROW_2 may need a slight bump since it now has more items.

### Impact
- Single file edit, no logic changes
- All image URLs sourced from the existing Supabase storage bucket

