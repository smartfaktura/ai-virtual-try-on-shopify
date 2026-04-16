

# Improve /app/pricing Page

## Changes

### 1. Redesign CompetitorComparison component
- Remove all emojis (💡)
- Change "per image" to "per credit" on all comparison items
- Replace the Card wrapper with a cleaner section layout — no card border, just a clean header + horizontal bar chart or modern stat blocks
- Modern redesign: use a horizontal bar/progress visual showing cost comparison rather than plain boxes
- Remove the blue-tinted "Start free" callout or restyle it without emoji as a subtle muted note
- Add context: "Based on average cost across platforms for AI-generated product visuals"

### 2. Add more content sections to AppPricing page
- **"What are credits?"** explainer section — brief 3-column grid: 1 credit explanation, what you can do with credits (images, videos, upscales), how credits refresh monthly
- **"What's included in every plan"** — horizontal feature strip showing universal features (1,000+ scenes, all AI models, 2K/4K upscale, video generation, no watermarks on paid plans)
- **FAQ section** — 4-5 common questions inline: "Do unused credits roll over?", "Can I change plans?", "What happens when I run out?", "How do credit top-ups work?"

### 3. Fix CompetitorComparison data
- Change prices to "per credit" not "per image"
- Update VOVV price to reflect actual per-credit cost range ($0.04–$0.08 depending on plan)
- Add a note that VOVV pricing varies by plan

### 4. Modern comparison visual
Replace the 3-box grid with a horizontal bar comparison:
- VOVV.AI: short bar (cheapest) with primary color
- Traditional AI Tools: medium bar with muted color  
- Photo Studios: long bar with muted color
- Each bar shows the price label at the end
- Clean, minimal, no card wrapper

## Files
- `src/components/app/CompetitorComparison.tsx` — full redesign
- `src/pages/AppPricing.tsx` — add new sections, remove emoji references

