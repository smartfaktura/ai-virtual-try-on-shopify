

## Team Avatar Video Interlude — Before Pricing

A cinematic full-width section placed between `CreativeDropsSection` and `LandingPricing` featuring a large cropped avatar video with scroll-triggered parallax and simulated team chat messages.

### Concept

A dark, full-bleed strip (~60vh) with a single large avatar video (e.g. Kenji or Sophia) cropped tight to head/shoulders, positioned to one side. On the opposite side, staggered chat-style message bubbles fade in as the user scrolls into view — each from a different team member with their small avatar, name, and a short status-style message. The overall feel: "your team is already working on it."

```text
┌──────────────────────────────────────────────────────┐
│  ┌─────────────┐                                     │
│  │             │    ○ Sophia: "Lighting set up ✓"    │
│  │  BIG VIDEO  │                                     │
│  │  (Kenji)    │    ○ Zara: "Styling complete"       │
│  │  cropped    │                                     │
│  │  parallax   │    ○ Luna: "Retouching in progress" │
│  │             │                                     │
│  └─────────────┘    "Your team. Always on."          │
└──────────────────────────────────────────────────────┘
```

### New Component: `TeamVideoInterlude.tsx`

**Layout:**
- Full-width section with `bg-foreground/[0.97]` (near-black) for contrast
- Left: Large video element (~50% width on desktop, full-width on mobile) with `object-cover` cropped to upper body, slight parallax via `transform: translateY()` on scroll
- Right: 3-4 chat bubbles that stagger in with `animate-fade-in` + increasing delays as the section enters the viewport
- Each bubble: small round avatar (24px), member name, short message, subtle timestamp
- Bottom tagline: "Your team. Always on." in large editorial type

**Scroll animation:**
- Intersection Observer triggers entrance once (same pattern as HowItWorks)
- Video parallax: simple `onScroll` listener that shifts the video Y position by ~10% of scroll delta within the section bounds
- Chat bubbles: CSS stagger using `animation-delay: 0s, 0.2s, 0.4s, 0.6s`

**Data:** Pick 4 team members from `TEAM_MEMBERS` (Sophia, Kenji, Luna, Zara) with their existing `videoUrl`, `avatar`, and `statusMessage` fields — no new data needed.

**Mobile:** Stack vertically — video on top (aspect 16:9 cropped), messages below.

### Integration in `Landing.tsx`

- Lazy-load `TeamVideoInterlude` between `CreativeDropsSection` and `LandingPricing`
- Single new file, no changes to existing components

