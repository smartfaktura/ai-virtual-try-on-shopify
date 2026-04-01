

# Video Showcase Section for Landing Page

## Placement
Insert **between FreestyleShowcaseSection and ModelShowcaseSection** (after line 60 in Landing.tsx). This is the ideal CRO position because:
- Visitor has already seen static image results (hero, categories, freestyle)
- Video motion creates a pattern interrupt that re-engages scroll momentum
- It answers the objection "do these look real?" with moving proof before the model/environment deep-dives

## Design
A full-bleed section with edge-to-edge video grid, no container padding — videos run right to the edges for a cinematic, modern feel. Subtle gradient overlays top and bottom so it blends into surrounding sections.

```text
────────────────────────────────────────────────
  Your Products, In Motion
  AI-generated video ads ready in minutes,
  not weeks.

  ┌────┐┌────┐┌────┐┌────┐┌────┐
  │3:4 ││3:4 ││3:4 ││3:4 ││3:4 │  ← row 1
  │auto││auto││auto││auto││auto│
  └────┘└────┘└────┘└────┘└────┘
  ┌────┐┌────┐┌────┐┌────┐┌────┐
  │3:4 ││3:4 ││3:4 ││3:4 ││3:4 │  ← row 2
  └────┘└────┘└────┘└────┘└────┘

  [Start Creating Videos →]        ← CTA button
────────────────────────────────────────────────
```

- **Grid**: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1` with tiny gaps for a mosaic look
- **Cards**: `aspect-[3/4] rounded-lg overflow-hidden` — all uniform, no labels
- **Videos**: `<video autoPlay muted loop playsInline>` with `object-cover`
- **Copy** (CRO-optimized):
  - Heading: "Your Products, In Motion"
  - Subheading: "AI-generated video ads ready in minutes, not weeks."
- **CTA**: Primary button linking to `/app/video` (or `/auth` if not logged in)
- **Mobile**: collapses to 2 columns, showing 6 videos (hide last 4 on small screens)
- Uses existing `/videos/showcase/showcase-1.mp4` through `showcase-10.mp4`

## Files

| File | Change |
|------|--------|
| `src/components/landing/VideoShowcaseSection.tsx` | New component with video grid, heading, CTA |
| `src/pages/Landing.tsx` | Lazy-import and insert between FreestyleShowcase and ModelShowcase |

