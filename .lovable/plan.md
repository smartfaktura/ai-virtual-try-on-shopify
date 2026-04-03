

# Fix Muted Look & Modernize Category Tabs

## Problems
1. **Section background `bg-[hsl(var(--muted)/0.35)]`** — adds a washed-out grey tint over the whole section, making everything look muted/dull
2. **Category pills use `rounded-full` with faint ring** — looks like generic 2020-era filter buttons, not modern tabs
3. **Image quality param `quality: 55`** — too low, contributing to the muted/washed appearance
4. **Card border `border-border/60`** — adds grey framing that dulls the images further

## Changes (all in `HomeTransformStrip.tsx`)

### 1. Remove muted section background
- Change `bg-[hsl(var(--muted)/0.35)]` → `bg-background` — clean white background, images pop

### 2. Modern underline-style tabs instead of pills
- Replace `rounded-full` pill buttons with a clean inline tab bar:
  - Active: `text-foreground font-semibold` with an animated bottom border/underline (2px)
  - Inactive: `text-muted-foreground hover:text-foreground`
  - No background fill, no ring — just clean text tabs with underline indicator
  - Wrap in a horizontal scrollable container with a subtle bottom border line

### 3. Boost image quality
- Increase `quality` from `55` to `75` for marquee cards
- Increase original thumbnail quality from `55` to `75`

### 4. Clean up card borders
- Remove `border border-border/60` from ImageCard — let the rounded corners and shadow define the card edge
- Keep `shadow-md` for subtle depth without the grey border dulling the image

## File Modified
- `src/components/home/HomeTransformStrip.tsx`

