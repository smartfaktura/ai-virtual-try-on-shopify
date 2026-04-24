## Changes to `/home`

Small polish pass — typography sizing, a CTA link fix, and two hero tweaks.

### 1. Hero — video card cleanup (`HomeHero.tsx`)
- Remove the `VIDEO` badge: only show the "Original" pill when `isOriginal`, never for video
- Keep the video tile in **row 1 only**: `row2 = heroImages.slice(6).concat(heroImages.slice(0, 2)).filter(c => !c.isVideo)` so the video never appears in the second marquee

### 2. TransformStrip — caption sizing (`HomeTransformStrip.tsx`)
- Line 255: bump `"35+ categories · 1000+ scenes · one upload"` from `text-xs` → `text-sm`, slightly stronger color (`text-foreground/70`)

### 3. FAQ readability (`HomeFAQ.tsx`)
- Question (`AccordionTrigger`): `text-[15px]` → `text-base sm:text-[17px]`, `font-medium` → `font-semibold`, `py-5` → `py-6`
- Answer (`AccordionContent`): `text-sm` → `text-[15px] sm:text-base`, soften color from `#6b7280` → `text-foreground/70`, `pb-5` → `pb-6`

### 4. Final CTA — fix secondary link (`HomeFinalCTA.tsx`)
- Replace the `<a href="#examples">See real examples</a>` with a `<Link to="/discover">` so it routes to the public Explore page instead of an in-page anchor that no longer matches user intent
- Keep button styling identical

### Files
- `src/components/home/HomeHero.tsx`
- `src/components/home/HomeTransformStrip.tsx`
- `src/components/home/HomeFAQ.tsx`
- `src/components/home/HomeFinalCTA.tsx`

No other sections need changes — heading scale, eyebrows, section padding, and primary CTA shape are already unified across `/home` from the previous pass.
