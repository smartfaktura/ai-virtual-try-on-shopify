

# Refine Home Page Hero Section

## File to modify

### `src/components/home/HomeHero.tsx`

**Remove:**
- The `useTypewriter` hook, `WORDS` constant, and all rotating/animated text logic
- The blinking cursor span

**Replace headline with fixed two-line copy:**
- Line 1: "One product photo." — dark foreground color
- Line 2: "AI creates the rest." — slightly muted slate-blue (`text-[#4a5578]`) for refined contrast

**Add subheadline** below headline with `max-w-xl`:
- "Turn a single product image into product page visuals, social content, and campaign-ready creative in minutes."
- `text-muted-foreground text-lg`

**Spacing adjustments:**
- Reduce top padding: `pt-24 lg:pt-28` (from `lg:pt-32`)
- `mb-5` on h1, `mb-6` on subheadline

**Marquee card labels** — update to ecommerce-relevant terms:
- Row 1: Product page, Social content, Creator style, Editorial, Campaign, Lifestyle
- Row 2: Lookbook, Ad creative, Flat lay, Video, Product page, Social content

No other files changed. Nav stays as-is.

