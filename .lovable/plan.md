

# ProductCategoryShowcase Placement: Pros & Cons Analysis

## Current Order (after Hero)
1. Hero
2. StudioTeamSection (social proof — team avatars)
3. HowItWorks (3-step explainer)
4. FreestyleShowcaseSection (feature demo)
5. **ProductCategoryShowcase** ← currently here
6. ModelShowcaseSection
7. EnvironmentShowcaseSection
8. CreativeDropsSection
9. Pricing → FAQ → CTA

---

## Option A: Move Right After Hero (position #2)

**Pros:**
- Immediately answers "does this work for MY product type?" — the #1 question visitors have after seeing the hero
- Auto-cycling category cards create visual motion that keeps attention after the static hero
- Reduces bounce — visitors in fashion/food/skincare see themselves represented instantly
- Strong "show don't tell" — real AI outputs before any text explanation

**Cons:**
- Pushes StudioTeamSection (social proof) down — visitors see product demos before knowing who's behind the tool
- The "How It Works" 3-step flow gets delayed, so visitors see outputs without understanding the process yet
- Two heavy image sections back-to-back (Hero + Categories) could feel repetitive on slow connections
- The current flow builds a narrative: team → process → features → proof. Moving categories up breaks this storytelling arc

---

## Option B: Keep Current Position (#5)

**Pros:**
- Maintains the logical narrative: credibility (team) → understanding (how it works) → capability (freestyle) → breadth (categories)
- By the time visitors reach categories, they already understand what the tool does — the categories reinforce rather than confuse
- Spacing between image-heavy sections prevents visual fatigue

**Cons:**
- Many visitors never scroll to position #5 — typical landing page drop-off is 40-60% by section 3
- The most universally relatable content ("your product type works here") is buried
- Visitors who don't identify with the Freestyle showcase may bounce before seeing their category

---

## Recommendation

**Move it to position #2** (right after Hero). The category showcase directly answers the visitor's core question and is more universally engaging than the team section. The new order would be:

1. Hero
2. **ProductCategoryShowcase** — "yes, this works for your products"
3. StudioTeamSection — credibility
4. HowItWorks — process
5. FreestyleShowcaseSection — deep feature demo
6. ModelShowcaseSection → EnvironmentShowcaseSection → rest

This is a 1-line reorder in `Landing.tsx`.

