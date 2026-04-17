
## Goal
Rewrite the 10 workflow card descriptions on `/app/workflows` so each fits in **2 lines max** at current card width while delivering maximum value (what it does + key differentiator).

## Approach
Update the `description` column in the `workflows` table via migration. This is the single source of truth — UI reads from DB. No code changes.

Each rewrite follows: **[Outcome verb] + [specific benefit] + [why it matters]** in ~12-16 words.

## Proposed copy

| # | Workflow | Current (too long) | Proposed (≤2 lines, ~14 words) |
|---|---|---|---|
| 1 | **Product Visuals** | Create brand-ready product visuals across 1000+ studio and editorial scenes with full control over styling, lighting, and composition. | Brand-ready product shots across 1000+ studio and editorial scenes — fully art-directed. |
| 2 | **Virtual Try-On Set** | Virtual try-on images with diverse models wearing your products. Includes a range of poses and backgrounds. | Put your clothing on diverse AI models in any pose or setting. |
| 3 | **Product Listing Set** | E-commerce ready product images with clean backgrounds and consistent styling. Perfect for storefronts and marketplaces. | Clean, consistent product shots ready for any storefront or marketplace. |
| 4 | **Selfie / UGC Set** | High-quality content like top creators -- your product plus model, generating super professional results in seconds. | Authentic creator-style content pairing your product with a real-feeling model. |
| 5 | **Flat Lay Set** | Overhead styled arrangements with curated props and clean compositions. Perfect for Instagram grids and editorial layouts. | Styled overhead arrangements with curated props — built for Instagram and editorial. |
| 6 | **Mirror Selfie Set** | Generate authentic mirror selfie content featuring your product worn or held by a selected model. Realistic smartphone-in-hand compositions across diverse room and mirror environments. | Authentic mirror selfies of your product, worn or held in real-feeling rooms. |
| 7 | **Interior / Exterior Staging** | Transform empty rooms into professionally staged interiors, or enhance building exteriors with curb appeal — all while preserving the original architecture. | Stage empty rooms or boost curb appeal — original architecture stays intact. |
| 8 | **Picture Perspectives** | Generate angle and detail variations of an existing product image — close-up, back, sides, and wide shots for a complete visual set. | Turn one product photo into close-ups, back, side, and wide-angle shots. |
| 9 | **Image Upscaling** | Enhance any image to 2K or 4K resolution with AI-powered upscaling. Sharpens details, recovers textures, and enhances faces for professional-quality output. | Sharpen any image to 2K or 4K — recovers textures, faces, and fine detail. |
| 10 | **Catalog Studio** | Generate catalog-ready visuals in bulk for any product. | Bulk-generate catalog-ready visuals for any product, in one run. |

## Acceptance
- All 10 descriptions ≤ 2 lines on the current `/app/workflows` card width
- Each leads with the outcome and includes one differentiator
- No code changes — single DB migration updating `workflows.description`
- `line-clamp-3` + native tooltip stay in place as a safety net
