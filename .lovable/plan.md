

# Add "More Tools" Section to New User Dashboard

## Summary
Insert a compact utility section with 3 cards (Picture Perspectives, Image Upscaling, Catalog Studio) between the "Your Products, In Motion" video showcase and the Feedback Banner on the new user dashboard.

## File changed
**`src/pages/Dashboard.tsx`**

### Location
Insert between line 454 (end of video showcase) and line 456 (FeedbackBanner).

### Section structure
- Section header: "More tools" (`text-xl font-bold`) + subtitle "Specialized tools for angles, quality, and catalog creation." (`text-base text-muted-foreground`)
- 3 cards in a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` layout

### Card design
Each card uses a `border border-border/60 rounded-xl p-5` container — compact utility style, visually lighter than the hero cards above:

| Card | Icon | Title | Muted label | Description | Route |
|------|------|-------|-------------|-------------|-------|
| 1 | `RotateCw` | Picture Perspectives | More angles | Turn one product image into a complete set of alternate views. | `/app/generate/product-images` |
| 2 | `Sparkles` | Image Upscaling | Higher resolution | Upscale images to 2K or 4K while improving clarity and detail. | `/app/workflows` |
| 3 | `LayoutGrid` | Catalog Studio | Bulk creation | Create catalog visuals in bulk with consistent styling. | `/app/workflows` |

### Card layout (per card)
- Small icon in a `w-8 h-8 rounded-lg bg-muted/50` container
- Title: `text-sm font-semibold`
- Muted label: `text-[11px] text-muted-foreground/60` inline after title
- Description: `text-sm text-muted-foreground` — 1-2 lines max
- CTA: `<Button variant="outline" size="sm" className="rounded-full">Open</Button>` at bottom
- Hover: `hover:border-border hover:shadow-sm transition-all`

### Imports
Add `RotateCw`, `LayoutGrid` from lucide-react (Sparkles likely already imported).

