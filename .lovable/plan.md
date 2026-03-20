

# Elevate the About Page — Premium, Founder-Centric Redesign

## What's Wrong Now
- The page feels flat and generic — plain white sections, no visual richness
- The founder section is an afterthought — tiny circle photo, just "Founder" and a LinkedIn link
- No narrative arc connecting the founder's vision to the product
- The hero is functional but lacks personality and premium feel

## Changes

### 1. Elevated Hero with subtle gradient backdrop
Replace the plain hero with a refined section using a subtle gradient background (`bg-gradient-to-b from-primary/5 via-background to-background`). Add a thin decorative line or accent element above the heading for visual distinction.

### 2. Redesign the Founder section as the emotional anchor
Move the founder section between Mission and Values (or after Values, before AI Team) so it flows narratively: Problem → Approach → Founder's Vision → Values → Team.

Redesign to a horizontal card layout:
- Left: larger photo (w-32 h-32 or bigger), rounded-2xl with a subtle shadow and ring
- Right: Name, title, a short 1-2 sentence founder quote/vision statement (italic, styled as a quote with a left border accent), LinkedIn icon button
- Wrap in a card with subtle border and premium feel

### 3. Add a founder quote
Add a compelling, short quote: *"Every brand deserves visuals that look like they came from a professional studio — without the cost, the wait, or the complexity."* This anchors the page emotionally.

### 4. Polish section spacing and typography
- Increase section padding consistency
- Add subtle section dividers or gradient transitions between sections
- Use `tracking-tight` on all headings for premium feel

### File: `src/pages/About.tsx`
- Restructure section order: Hero → Mission → Founder (redesigned) → Values → AI Team
- Founder section: horizontal layout with quote, larger photo, subtle card treatment
- Hero: add gradient background
- Minor spacing/typography polish throughout

