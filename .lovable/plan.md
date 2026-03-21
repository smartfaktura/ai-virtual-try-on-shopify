

# Premium Redesign for TryShot Hero

## Problem
The current heading looks flat — "Product shots for jewelry" lacks typographic refinement. The blue accent color is too muted, and the overall hero feels generic rather than premium.

## Changes

### File: `src/pages/TryShot.tsx`

**1. Headline typography upgrade**
- Increase heading size: `text-5xl sm:text-6xl md:text-7xl` for more editorial impact
- Change `font-medium` to `font-semibold` for the static text — premium sites use confident weight
- Reduce letter-spacing further: `tracking-tighter` instead of `tracking-tight`
- Change line height to `leading-[1.05]` for tighter, more polished stacking

**2. Rotating word color — richer blue**
- Change from `hsl(217,60%,45%)` to `hsl(220,70%,50%)` — a richer, more saturated royal blue that reads as premium
- Keep `font-bold` for weight contrast against `font-semibold` static text

**3. Cursor styling**
- Change the blinking cursor `|` from `animate-pulse` to a proper blinking animation: `animate-[blink_1s_step-end_infinite]` with a CSS keyframe
- Make cursor thinner and use the same blue color as the word

**4. Subtitle refinement**
- Bump to `text-lg` and use `font-light` for editorial contrast against the heavy heading
- Increase `max-w-md` to `max-w-lg`

**5. Input bar polish**
- Change from `bg-secondary` to `bg-white` with `shadow-sm` — cleaner, more Apple-like
- Border: `border-border/60` — subtler
- Increase height slightly: `h-[3.5rem]` → keep at `h-14`

**6. Hero image card**
- Remove `rotate-[-2deg]` tilt — cleaner, more premium without the tilt
- Add `shadow-2xl` instead of `shadow-xl` for more depth
- Increase size slightly: `w-60 sm:w-72`

**7. "Free · No sign-up required" text**
- Change to `text-xs tracking-wide uppercase text-muted-foreground/40 font-medium` — more editorial

## Technical detail
Add a CSS keyframe for the cursor blink in the component or `index.css`:
```css
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
```

## Summary
- 1 file modified, minor CSS keyframe addition
- Larger, bolder typography with tighter spacing
- Richer blue accent color
- Cleaner input bar (white, subtle shadow)
- Straighter hero image with more shadow depth
- Overall shift from "template" to "premium editorial" feel

