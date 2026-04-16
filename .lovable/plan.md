

# Complete Redesign of /app/pricing

## Overview
Rebuild the entire AppPricing page as a premium, content-rich pricing experience that showcases the full platform capability, compares VOVV against traditional production workflows, and helps users understand what they're getting.

## Page Structure (top to bottom)

### 1. Hero Header
- Bold headline: "Your complete visual production studio"
- Subtitle explaining the platform replaces photographers, stylists, videographers
- Billing toggle (monthly/annual) with SAVE 20% badge using `bg-primary text-primary-foreground`

### 2. Plan Cards (keep existing logic)
- Same 4-column grid with Free/Starter/Growth/Pro
- Same checkout/upgrade/downgrade logic — no functional changes
- Clean up card styling slightly (consistent shadow treatment)

### 3. NEW — "One platform replaces your entire creative team" comparison section
A two-column comparison table: **Traditional Production** vs **VOVV.AI**
Rows:
| Role | Traditional Cost | VOVV.AI |
|---|---|---|
| Product Photographer | $500-2,000/day | Included |
| Photo Studio Rental | $200-800/day | Included |
| Styling & Props | $300-1,000/shoot | Included |
| Models & Talent | $500-3,000/day | AI Models included |
| Photo Retouching | $5-25/image | Automatic |
| Social Media Content | $1,000-5,000/mo | Included |
| Videography | $2,000-10,000/project | Included |
| **Total per shoot** | **$4,500-22,000+** | **From $0/mo** |

Clean table with alternating rows, primary highlight on VOVV column.

### 4. NEW — "Everything you get" full platform features grid
A 3-column (2 on mobile) grid of feature cards with icons:
- **1,000+ Scenes** — Editorial, lifestyle, studio, seasonal scenes
- **AI Models** — Virtual models with consistent identity across shots
- **Brand Models** — Train custom models on your brand aesthetic (Growth+)
- **Video Generation** — Product videos, ad sequences, short films
- **4K Upscaling** — Upscale any generation to print-ready resolution
- **Bulk Generation** — Generate hundreds of images in one batch
- **Multi-Angle Shots** — Front, back, side, detail perspectives
- **Freestyle Studio** — Create anything with custom prompts
- **Image Editing** — AI-powered retouching and background swap
- **Brand Profiles** — Save brand colors, tone, and style preferences
- **Product Library** — Organize unlimited products and assets
- **Export & Download** — ZIP bulk downloads, individual high-res files

### 5. Credit cost comparison (existing CompetitorComparison, keep as-is)
The horizontal bar chart comparing VOVV vs Traditional AI vs Photo Studios — already good.

### 6. How credits work (keep existing 3-card section, minor copy tweaks)

### 7. Value at a glance table (keep existing)

### 8. FAQ (expand with 2-3 more questions, keep collapsible format)
Add: "What can I create with VOVV?", "Do I need photography experience?"

### 9. Enterprise CTA (keep existing)

## Files to edit
- **`src/pages/AppPricing.tsx`** — complete rewrite of the page layout with new sections
- **`src/components/app/CompetitorComparison.tsx`** — no changes needed

## What stays the same
- All plan selection, checkout, and billing logic
- PlanChangeDialog integration
- Plan data from mockData
- CompetitorComparison component
- Billing toggle functionality

## What's removed
- "Detailed feature comparison" expandable accordion (replaced by full feature grid)
- "Included in every plan" pills (absorbed into the features grid)

## Technical notes
- All new sections are static/presentational — no new state or API calls
- Icons from lucide-react (Camera, Users, Palette, Film, ZoomIn, Layers, etc.)
- Responsive: 3-col on desktop, 2-col on tablet, 1-col on mobile for feature grid
- Comparison table scrolls horizontally on mobile if needed

