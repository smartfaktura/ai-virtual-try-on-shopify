## Goal

Rebuild `/mnt/documents/brand-scenes-newsletter.html` as a **conversion-focused, image-first** email — minimal copy, VOVV.AI minimalist-luxury aesthetic, real public vovv.ai images, and one clear path to upgrade and create.

## Aesthetic (matches vovv.ai)

- Off-white canvas `#F7F5F2`, card surface `#FFFFFF`, ink `#0A0A0A`, muted `#6B6B6B`, hairline `#E8E4DD`
- Accent black pill buttons, no gradients, no shadows
- System font stack mimicking Inter (300/400/500/600), tight tracking on display, generous line-height
- No periods on headers / single-sentence subtitles (per brand voice)
- Always "VOVV.AI"

## Structure (image-first, ~70% visual / 30% copy)

```
┌───────────────────────────────────┐
│ pre-header (hidden)               │
│ VOVV.AI · NEW                     │  small header row
├───────────────────────────────────┤
│  [ FULL-BLEED HERO IMAGE ]        │  on-model dress scene
│  Eyebrow: NEW ON VOVV.AI          │
│  H1: Your brand. Your scenes.     │
│      Your models                  │
│  One line subtitle                │
│  [ Create now → ]  (black pill)   │
├───────────────────────────────────┤
│ BRAND SCENES                      │
│ One-line pitch (≤14 words)        │
│ [img][img][img]  3-up grid        │
│ [ Build a Brand Scene → ]         │
├───────────────────────────────────┤
│ BRAND MODELS                      │
│ One-line pitch                    │
│ [img][img][img][img]  4-up grid   │
│ [ Create a Brand Model → ]        │
├───────────────────────────────────┤
│ Dark upgrade card (#0A0A0A)       │
│ "Unlock Brand Scenes & Models"    │
│ Growth · Pro · Studio             │
│ [ Upgrade plan → ] white pill     │
├───────────────────────────────────┤
│ tiny footer · unsubscribe         │
└───────────────────────────────────┘
```

## Copy (tight, conversion-led)

- Eyebrow: `NEW ON VOVV.AI`
- H1: `Your brand. Your scenes. Your models`
- Sub: `Turn any reference into a signature scene. Lock in a model that's only yours`
- Primary CTA: `Create now →` → `https://vovv.ai/app/workflows`
- Scenes pitch: `Upload a reference. We rebuild it as a reusable scene — on every product, every time`
- Models pitch: `One face. Infinite shoots. Perfect consistency across your whole catalog`
- Upgrade card H: `Unlock Brand Scenes & Models`
- Upgrade sub: `Included on Growth and above`
- Upgrade CTA: `Upgrade plan →` → `https://vovv.ai/app/billing`

No bullet lists, no "Why it matters" section, no long paragraphs.

## Images (all public vovv.ai)

Hero: `https://vovv.ai/assets/home-hero-original-dress-CI7-Bf-s.jpg` *(or replace with a generated editorial — see Q1 below)*

Brand Scenes 3-up:
- `…/1776689318257-yahkye.jpg` Editorial
- `…/1776840733386-n4bc6x.jpg` Lifestyle greenhouse
- `…/1776688413055-z73arv.jpg` Architectural

Brand Models 4-up:
- `…/scratch-uploads/models/model_029-…png` Freya
- `…/scratch-uploads/models/model_018-…png` Anders
- `…/scratch-uploads/models/model_033-…png` Sienna
- `…/scratch-uploads/models/model_049-…png` Kai

All loaded at `width=600&quality=80&resize=cover` for retina-safe email rendering.

## Technical

- 600px max-width, table-based, inline CSS, `mso` conditional fallback
- Mobile media query collapses 3/4-up grids to 2-up
- All buttons are bulletproof `<a>` with padding (no images)
- File written to `/mnt/documents/brand-scenes-newsletter.html` (overwrites current)
- Headless render screenshot for QA before delivery

## Open question

1. Hero treatment — should the hero be a **single full-bleed editorial image** with overlaid pill+headline (max impact), or a **before / after pair** (original photo → AI scene) which tells the value story instantly? My default is single full-bleed editorial; confirm or flip.
