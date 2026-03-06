

## Create Product Landing Pages

Create 4 dedicated landing pages for the Product footer links (Workflows, Virtual Try-On, Creative Drops, Brand Profiles). Pricing already scrolls to `/#pricing` which is fine.

Each page uses the existing `PageLayout` wrapper (LandingNav + LandingFooter) and follows the same pattern as `About.tsx` — hero section, feature highlights, how-it-works steps, and a CTA at the bottom.

### Pages to Create

| Page | Route | File |
|------|-------|------|
| Workflows | `/features/workflows` | `src/pages/features/Workflows.tsx` |
| Virtual Try-On | `/features/virtual-try-on` | `src/pages/features/VirtualTryOn.tsx` |
| Creative Drops | `/features/creative-drops` | `src/pages/features/CreativeDrops.tsx` |
| Brand Profiles | `/features/brand-profiles` | `src/pages/features/BrandProfiles.tsx` |

### Page Structure (each page)

1. **Hero** — Badge icon + headline + subtitle + "Get Started Free" CTA button
2. **Key Benefits** — 3-column card grid with icons highlighting the main value props
3. **How It Works** — 3 numbered steps explaining the feature flow
4. **CTA Section** — Final call-to-action pointing to `/auth`

### Content per Page

- **Workflows**: Automated visual pipelines — upload once, get on-model, lifestyle, flat lay shots. Benefits: no prompts needed, batch processing, consistent brand output.
- **Virtual Try-On**: See products on real AI models. Benefits: diverse model library, realistic fitting, multiple angles.
- **Creative Drops**: Monthly curated visual drops. Benefits: fresh content monthly, trending styles, seasonal themes.
- **Brand Profiles**: Save brand guidelines for consistent output. Benefits: color/style consistency, reusable presets, team sharing.

### Other Changes

- **`src/App.tsx`** — Add 4 new public routes under `/features/*`
- **`src/components/landing/LandingFooter.tsx`** — Update Product links from `/#features` to the new routes (`/features/workflows`, etc.)

