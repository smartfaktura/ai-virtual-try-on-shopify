

# Revamp Press Page

## Remove
- **Company at a Glance** section with fake stats (founded 2024, 25+ team, 2M+ images, etc.)
- **Recent Coverage** section with fabricated TechCrunch/Retail Dive/The Verge mentions
- **mediaMentions** and **brandFacts** data arrays

## Keep & Improve
- **Hero** — rewrite copy: "Press & Media Resources" focus, premium tone
- **Brand Assets** — expand into a proper section with individual downloadable items (logo dark, logo white, brand colors, product screenshots) as visually distinct cards instead of a single "coming soon" button. Each card shows a preview and downloads a real asset from storage
- **Brand Guidelines** — keep Logo Usage and Brand Voice cards, polish copy
- **Press Inquiries** — expand into a more prominent, premium CTA section with hello@vovv.ai

## Add
- **What is VOVV.AI** — a short 2-3 sentence section explaining the product truthfully: "AI-powered visual studio for e-commerce brands. Upload a product photo, generate studio-quality images across workflows — from virtual try-on to product listings — in seconds."
- **Brand Colors** visual strip — show the actual primary color (dark navy `hsl(217 33% 17%)`) and accent (`hsl(210 17% 70%)`) as swatches inside the brand assets area

## Brand Asset Downloads
Generate real downloadable assets by creating SVG logos programmatically in the component:
- **Logo Dark** (dark text on transparent) — rendered as inline SVG, downloaded via blob
- **Logo White** (white text on transparent) — same approach
- **Brand Colors** — download a small JSON/text file with hex values

Each asset card will have a preview thumbnail and a download button that triggers a client-side blob download (no storage upload needed).

## Visual Polish
- Use subtle gradient backgrounds on hero section
- Larger spacing, refined typography
- Premium card styling with hover effects

## File
`src/pages/Press.tsx` — full rewrite of the component. No other files affected.

