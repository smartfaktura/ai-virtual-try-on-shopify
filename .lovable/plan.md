

## Redesign: Team Video Interlude — From Default to Extraordinary

### What's wrong now
- Only 4 of 10 team members shown, no role labels
- Single static video with basic chat bubbles beside it — feels like a template
- No sense of the *team working together* — just a video dump with text

### New concept: "The War Room" — a live studio control room

A full-width cinematic dark section that feels like you're peering into a live production control room where all 10 team members are actively working on your shoot.

```text
┌─────────────────────────────────────────────────────────────┐
│                    AI STUDIO TEAM                           │
│         Your team. Always on.                               │
│  10 specialists working on every visual you create.         │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │VIDEO │ │VIDEO │ │ BIG  │ │VIDEO │ │VIDEO │              │
│  │small │ │small │ │VIDEO │ │small │ │small │  ← row 1     │
│  │Sophia│ │Amara │ │Kenji │ │Yuki  │ │Omar  │              │
│  └──────┘ └──────┘ │ hero │ └──────┘ └──────┘              │
│  ┌──────┐ ┌──────┐ │      │ ┌──────┐ ┌──────┐              │
│  │VIDEO │ │VIDEO │ │      │ │VIDEO │ │VIDEO │  ← row 2     │
│  │Luna  │ │Sienna│ │      │ │Zara  │ │Leo   │              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                             │
│  Each small tile: video + name + role + green "active" dot  │
│  Center hero: larger, with floating status message          │
│  Tiles stagger-fade-in on scroll entry                      │
│  Subtle glow/pulse on the "active" member                   │
└─────────────────────────────────────────────────────────────┘
```

### Layout details

**Desktop (md+):** A bento-style grid — center cell spans 2 rows and is ~2x larger (the "hero" member, Max or Kenji). Surrounding 8 cells are smaller video tiles. 10th member fills a remaining spot. All videos auto-play muted on scroll entry.

**Each tile contains:**
- Muted looping video with `object-cover`
- Bottom gradient overlay with name, role, and a pulsing green dot ("active")
- On hover: slight scale-up + the member's `statusMessage` appears as a floating tooltip/chip
- Staggered entrance: each tile fades in with 80ms delay increments

**Hero center tile:**
- 2x size, slight parallax on scroll
- Floating chat-style status message animates in ("Reviewing the composition...")
- Subtle animated ring/glow border to draw the eye

**Section header:** "AI Studio Team" kicker + "Your team. Always on." headline + subtext, centered above the grid.

**Mobile:** 2-column grid, hero member spans full width on top, remaining 9 in 2-col below. Smaller tiles, same hover/active treatment.

### Technical approach

**Single file change:** Rewrite `src/components/landing/TeamVideoInterlude.tsx`
- Use all 10 `TEAM_MEMBERS` with their `videoUrl`, `avatar`, `name`, `role`, `statusMessage`
- Intersection Observer to trigger entrance + start video playback
- CSS Grid with named areas for the bento layout
- Parallax only on the hero center tile (reuse existing scroll logic)
- Green pulsing dot via CSS `@keyframes pulse` animation
- Each video uses `poster={member.avatar}` for instant visual before video loads

No new files, no data changes, no new dependencies.

