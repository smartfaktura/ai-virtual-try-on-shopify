## Scope
Edit only `src/pages/showcase/MakaraWearShowcase.tsx`. No data, routing, or component changes.

## Changes

### 1. Hero copy (lines 108–116)
- Eyebrow: `Brand example · MAKARA WEAR`
- H1: `This is what VOVV.AI makes from one product photo`
- Subtitle: `A complete swim campaign — 75 visuals, ready for web, social, and lookbook`

### 2. Remove the "Yours would look like this" section (lines 161–167)
Delete entire section block. Bottom dark CTA section (`Want this for your brand?` + buttons) stays untouched.

### 3. Re-shuffle the image grid
Replace current alternating order with a deterministic interleave that pulls bottom-half images upward and spreads variants:

```text
1. Split current IMAGES list in half: top[0..37], bottom[38..74]
2. Build new list by interleaving bottom-first:
   bottom[0], top[0], bottom[1], top[1], ...
3. Apply a stride pass to ensure no two adjacent items share the same scene
   (swap with next non-conflicting index when collision detected)
```

This produces a fresh visual mix where previously-bottom images appear near the top, while keeping all 75 entries.

### 4. SEO `<title>` / `<description>` — leave as-is (already brand-example framed).

## Out of scope
- Stats tile values, lightbox behavior, dark CTA section, route, navigation.
