

## Update Team Data, Home Page Section, and /team Page

Three files to change, touching all 10 areas from the brief.

### 1. `src/data/teamData.ts` — Update roles, descriptions, add expertise tags

Add `expertiseTag` field to `TeamMember` interface. Update all 10 members with new roles and tags:

| Member | New Role | Tag |
|--------|----------|-----|
| Sophia Chen | E-commerce Photographer | Lighting |
| Amara Osei | Lifestyle Scene Photographer | Composition |
| Luna Park | Retouch & Image Refinement Specialist | Retouching |
| Kenji Tanaka | Campaign Art Director | Art Direction |
| Yuki Nakamura | Performance Ad Creative Director | Ad Creatives |
| Omar Farouk | Visual CRO Strategist | Conversion Design |
| Sienna Russo | Brand Identity Guardian | Brand Styling |
| Max Lindqvist | Platform Optimization Engineer | Platform Export |
| Zara Ahmed | Fashion & Apparel Stylist | Fashion Styling |
| Leo Martinez | Scene & Set Designer | Scene Generation |

### 2. `src/components/landing/StudioTeamSection.tsx` — Update header text

- Headline: "Your AI Creative Studio" with "10 Specialists. Zero Overhead." on second line
- Subheadline: updated copy from brief
- Cards: show `expertiseTag` badge on hover, keep existing carousel behavior

### 3. `src/pages/Team.tsx` — Full upgrade

**Hero section:**
- New headline: "Your AI Creative Studio" / "10 Specialists. Zero Overhead."
- Updated subheadline
- Credibility line: "Powered by advanced generative AI models trained for e-commerce visual production."

**Team grid cards (enhanced):**
- Each card: video/avatar, name, role, description, expertise tag badge
- Hover: card lifts (`hover:-translate-y-1`), shadow deepens, expertise tag fades in
- Staggered entrance: IntersectionObserver + 100ms delay per card

**New section: "How Your AI Studio Team Works"**
- 4-step horizontal strip with icons (Upload, Scan, Generate, Deliver)
- Placed between team grid and CTA

**CTA section (improved):**
- Trust line: "Perfect for Shopify brands, Amazon sellers, and modern e-commerce teams."
- Headline: "Your AI Studio Team Is Ready"
- Text: "Generate professional product visuals in seconds without photoshoots, studios, or editing."
- Button: "Start Creating Free"
- Sub-items: Free to try / No credit card required / Cancel anytime

**Mobile:** 2-col tablet, 1-col mobile, square-ish aspect ratios maintained.

