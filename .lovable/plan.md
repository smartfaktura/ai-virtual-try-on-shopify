

# Hero Redesign — Typewriter Effect, Image-First Layout, Fix Edges

## Current Issues
- Too much text competing with images — proportions still feel off
- "Every visual you need" is static — could be more dynamic/engaging
- `object-contain` leaves gaps and some images show cut edges/artifacts from the muted background showing through
- Layout still doesn't feel image-dominant enough

## Plan

### 1. Typewriter rotating text effect
Replace the static "Every visual you need." with a typewriter animation that cycles through output types:

```
One product photo.
Every [product page image] you need.
Every [social creative] you need.
Every [editorial shot] you need.
Every [video ad] you need.
```

- Type out the bracketed word, pause ~2s, erase, type next word
- Use a blinking cursor `|` at the end during typing
- CSS animation + `useEffect` interval — no library needed
- The rotating words array: `['product page image', 'social creative', 'editorial shot', 'video ad', 'lookbook photo']`

### 2. Simplify text block — less copy, more impact
- Remove the subtitle paragraph ("Create product images, social creatives...")  — the typewriter already communicates this
- Remove "AI PRODUCT VISUALS" label — unnecessary
- Keep: H1, CTA buttons, "20 free credits" line
- This makes the left column much shorter/tighter, letting images dominate vertically too

### 3. Fix image rendering — back to `object-cover` with proper sizing
The `object-contain` approach causes visible gaps and awkward spacing. Switch back to `object-cover` but:
- Use a proper 3:4 aspect ratio container (no fixed px heights — use `aspect-[3/4]` with a fixed width)
- This ensures images fill the card naturally without weird cropping artifacts
- Remove the `bg-[hsl(var(--muted))]` background that was showing through as "cut edges"

### 4. Keep 40/60 grid but tighten left column
- Keep `lg:grid-cols-[2fr_3fr]`
- With less text content, the left 40% will feel appropriately sized
- The visual weight shifts to the 60% image area naturally

## Files Modified
- `src/components/home/HomeHero.tsx` — typewriter hook, simplified copy, image card fix

