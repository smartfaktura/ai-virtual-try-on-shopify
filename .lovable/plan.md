

## Generate 10 Hyperrealistic Discover Feed Images

Create a new edge function `generate-discover-images` that generates 10 diverse, hyperrealistic fashion/product images using `google/gemini-3-pro-image-preview` and inserts them directly into the `discover_presets` table.

### The 10 Images (varied products, men & women)

| # | Title | Category | Product | Model Gender | Scene/Setting |
|---|-------|----------|---------|-------------|---------------|
| 1 | Midnight Leather Jacket Editorial | editorial | Leather jacket | Male | Moody urban alley, rain-slicked streets |
| 2 | Summer Linen Dress Collection | lifestyle | Linen midi dress | Female | Sun-drenched Mediterranean terrace |
| 3 | Precision Timepiece Campaign | commercial | Luxury watch | Male | Marble desk, warm directional light |
| 4 | Athleisure in Motion | lifestyle | Sports bra & leggings set | Female | Modern gym with floor-to-ceiling windows |
| 5 | Tailored Wool Overcoat | editorial | Wool overcoat | Male | Foggy London bridge at dawn |
| 6 | Silk Evening Gown | editorial | Silk gown | Female | Grand marble staircase, chandelier |
| 7 | Premium Sneaker Drop | streetwear | High-top sneakers | Male | Concrete skatepark, golden hour |
| 8 | Cashmere Knitwear Story | lifestyle | Cashmere sweater | Female | Cozy cabin interior, fireplace glow |
| 9 | Structured Handbag Campaign | commercial | Leather handbag | Female | Clean studio, soft shadow play |
| 10 | Denim Workwear Heritage | commercial | Selvedge denim jeans | Male | Industrial workshop, warm tungsten |

### Technical approach

1. **New edge function**: `supabase/functions/generate-discover-images/index.ts`
   - Admin-only (checks `user_roles`)
   - Loops through 10 prompts, calls `google/gemini-3-pro-image-preview` for each
   - Extracts base64 image, uploads to `freestyle-images` bucket (public)
   - Inserts row into `discover_presets` with title, prompt, image_url, category, tags
   - Processes in batches of 2 to avoid rate limits (with delay between batches)
   - Returns progress/results

2. **Config**: Add function to `supabase/config.toml` with `verify_jwt = false`

3. **No UI changes needed** — images appear in the existing Discover feed automatically via realtime subscription

### Prompts
Each prompt will be a detailed, polished 3-4 sentence photography direction specifying: subject description, model appearance, lighting, camera settings, mood, and composition. All prompts include "hyperrealistic, shot on Phase One IQ4 150MP, 85mm f/1.4" for consistent photographic quality.

