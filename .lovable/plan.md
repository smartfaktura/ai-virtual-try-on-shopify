

# New Section: "Your Model Team" -- Showcasing Pro Models + Poses

## The Problem

The landing page talks about an "AI Photography Team" but never **shows** the models. We have 34 diverse model portraits and 24 professional poses with real images sitting in the codebase, completely invisible to landing page visitors. This is the strongest visual proof the platform has, and it's hidden.

## The Solution

Add a new dedicated section called **"ModelShowcaseSection"** that creates an interactive visual story: **"You pick the product. We deliver professional photoshoots with real models."**

This section will be inserted between the **BeforeAfterGallery** and **CreativeDropsSection** in the page flow, so the narrative becomes:

1. Meet your team (StudioTeamSection)
2. See workflows (FeatureGrid)
3. How it works (HowItWorks)
4. See visual contexts (BeforeAfterGallery)
5. **See the models and poses** (NEW -- ModelShowcaseSection)
6. Automate it (CreativeDropsSection)

---

## Section Design: "Professional Models. Every Look."

### Layout

**Left column (copy + interactive product selector):**
- Section heading: "Professional Models. Every Look."
- Subheading: "Choose a product from your catalog. Your AI team photographs it on professional models across studio, lifestyle, editorial, and streetwear settings."
- A small horizontal strip of 3 clickable product thumbnails (leggings, hoodie, sports bra) acting as a mini product picker. Clicking one changes which product is "active" and updates a label showing "Currently shooting: [Product Name]"
- Below that, a CTA button: "Try Virtual Try-On Free"

**Right column (visual showcase):**
- A large hero card showing one "featured combination" -- a model portrait overlapping with a pose image and the product thumbnail in the corner, simulating a completed photoshoot
- Below the hero card, a scrolling horizontal strip of 8-10 model portrait thumbnails (curated selection showing diversity: different genders, body types, ethnicities). Each has the model's name and body type as a small label
- Below the model strip, a second horizontal strip of 6 pose thumbnails grouped by category (1 studio, 2 lifestyle, 1 editorial, 1 streetwear, 1 more), each labeled with the pose name

### Interactivity

- Clicking a product thumbnail updates the "Currently shooting" label and the product inset on the hero card
- Clicking a model thumbnail updates the model shown in the hero card
- Clicking a pose thumbnail updates the pose shown in the hero card
- This creates a lightweight "build your photoshoot" experience right on the landing page -- visitors can see the range of models and poses without signing up

### Key Stats Bar

Between the heading and the visual, add a horizontal stats row:
- "34 Models" with a Users icon
- "24 Poses" with a Camera icon  
- "4 Styles" with a Palette icon (Studio, Lifestyle, Editorial, Streetwear)
- "All Body Types" with a Heart icon

---

## What This Communicates

- **Diversity**: Visitors instantly see models of different ethnicities, body types, ages
- **Professionalism**: Real portrait photography, not stock illustration
- **Range**: Studio + lifestyle + editorial + streetwear = complete visual coverage
- **Ease**: "Pick a product, pick a model, pick a pose" -- that simple
- **Scale**: 34 models x 24 poses = hundreds of unique photoshoot combinations

---

## File Changes

### New file: `src/components/landing/ModelShowcaseSection.tsx`

A new React component that:
- Imports 8-10 curated model images from `@/assets/models/`
- Imports 6 curated pose images from `@/assets/poses/`
- Imports 3 product images from `@/assets/products/`
- Uses `useState` for the selected product, model, and pose
- Renders the two-column layout described above
- Uses existing Tailwind classes and shadcn/ui components (Button, Badge, ScrollArea)
- Fully responsive (stacks vertically on mobile)

### Modified file: `src/pages/Landing.tsx`

- Import the new `ModelShowcaseSection`
- Insert it between `BeforeAfterGallery` and `CreativeDropsSection`

### No other files change

- No database changes
- No new dependencies
- All images already exist in the project

---

## Curated Model Selection (8 for the strip)

To show maximum diversity in the strip without overwhelming:

| Model | Gender | Body Type | Ethnicity |
|-------|--------|-----------|-----------|
| Yuki | Female | Slim | East Asian |
| Amara | Female | Athletic | Black African |
| Isabella | Female | Plus-size | Latina |
| Charlotte | Female | Average | European |
| Marcus | Male | Athletic | Black African |
| Omar | Male | Slim | Middle Eastern |
| Sienna | Female | Average | Irish |
| Kenji | Male | Athletic | Japanese |

## Curated Pose Selection (6 for the strip)

| Pose | Category |
|------|----------|
| Studio Front | Studio |
| Urban Walking | Lifestyle |
| Coffee Shop Casual | Lifestyle |
| Editorial Dramatic | Editorial |
| Street Lean | Streetwear |
| Night Neon | Streetwear |

## Curated Product Selection (3 for the picker)

| Product | Image |
|---------|-------|
| Airlift Legging | leggings-black-1.jpg |
| Accolade Hoodie | hoodie-gray-1.jpg |
| Intrigue Sports Bra | sports-bra-black-1.jpg |

---

## Updated Landing.tsx Section Order

1. LandingNav
2. HeroSection
3. SocialProofBar
4. StudioTeamSection
5. FeatureGrid
6. HowItWorks
7. BeforeAfterGallery
8. **ModelShowcaseSection (NEW)**
9. CreativeDropsSection
10. IntegrationSection
11. LandingPricing
12. LandingFAQ
13. FinalCTA
14. LandingFooter

---

## Technical Notes

- All 34 model and 24 pose images already exist as static imports in `mockData.ts`; we will directly import the specific assets we need in the new component for a clean, self-contained file
- The interactive state (selected product/model/pose) is pure `useState` -- no backend calls
- ScrollArea from shadcn/ui handles the horizontal scrolling strips
- Mobile layout: stats bar wraps to 2x2, model/pose strips scroll horizontally, product picker stays inline
- The hero card uses overlapping `absolute` positioned images (model portrait as main, pose as background context, product as small inset) to simulate a "photoshoot result"

