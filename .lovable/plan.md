## Rebuild `/features/workflows` as the new Visual Studio overview page

### Why
The current page sells "6 Visual Pipelines" — outdated framing. The product has evolved: the flagship is now the **6-step Product Images wizard** (`/app/generate/product-images`), with a constellation of focused tools around it (Brand Models, Virtual Try-On, Perspectives, Catalog Studio, Freestyle, Short Film, Upscale, Creative Drops, Brand Profiles, Real Estate Staging).

### New page architecture (single file: `src/pages/features/WorkflowsFeature.tsx`)

Same minimal monochrome luxury aesthetic as `/`, `/home`, and the new auth screen. No primary blue accents — uses `foreground` / `muted-foreground` / `border` tokens. Uses `<PageLayout>` and `<SEOHead>`.

**1. Hero**
- Eyebrow: `THE STUDIO`
- H1: `One workspace. Every visual your brand needs.`
- Sub: positions Product Images as the core, everything else as specialised tools.
- Primary CTA `Start free` → `/auth` · Secondary `See it in action` → `/discover`

**2. The Hero Tool — Product Images (flagship spotlight)**
Large editorial card, `bg-foreground text-background`, with the 6-step flow rendered as numbered chips: `Products → Shots → Setup → Generate → Results`. Includes:
- Headline: `Product Images — your AI photo studio`
- 4 value bullets (one upload → many scenes; category-aware shots; brand-consistent; pro 6-credit quality)
- "Open the studio" CTA → `/app/generate/product-images`

**3. Studio toolkit (10 supporting features grid)**
3-col responsive grid of minimal cards. Each: tiny icon, name, one-line tagline, `→ Learn more` link.

| Tool | Path | Tagline |
|---|---|---|
| Brand Models | `/app/models` | Cast your own AI models, lock identity across shoots |
| Virtual Try-On | `/features/virtual-try-on` | See garments on 40+ diverse AI models |
| Perspectives | `/features/perspectives` | One photo, every camera angle |
| Catalog Studio (BETA) | `/app/catalog` | Phase-aware ecommerce sets at scale |
| Freestyle | `/app/freestyle` | Open-prompt creative playground |
| Short Film | `/app/video/short-film` | AI campaign director — script to motion |
| Image Upscaling | `/features/upscale` | 2K/4K refinement with Topaz-grade clarity |
| Creative Drops | `/features/creative-drops` | Scheduled monthly content drops on autopilot |
| Brand Profiles | `/features/brand-profiles` | Lock palette, mood, lighting across every output |
| Real Estate Staging | `/features/real-estate-staging` | Stage empty rooms in 12 design styles |

**4. How the studio fits together**
3-step minimal walkthrough — `Bring your products` → `Direct the shoot` → `Ship campaigns`.

**5. Why teams pick VOVV**
3 minimal stat blocks:
- 2 min from upload to first hero shot
- 30+ scenes across 14 categories
- 6 credits per pro-quality image (no surprise pricing)

**6. Final CTA** — `Your studio is one upload away` + Start free button.

### Implementation notes
- All copy rewritten to current product reality (Product Images wizard step names, Brand Models, Catalog BETA, Short Film, etc.).
- No primary-blue accents; consistent with new monochrome landing system.
- Uses lucide-react icons only (`Sparkles, Layers, Camera, Wand2, Compass, Film, ArrowUpCircle, CalendarClock, Palette, Home`, etc.).
- Removes `WorkflowAnimatedThumbnail` dependency from this page — the flagship spotlight uses a static numbered-step strip for clarity and zero animation overhead.
- One file edit only: `src/pages/features/WorkflowsFeature.tsx`.

**Approve to apply.**