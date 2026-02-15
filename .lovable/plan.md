

## Reimagine: Selfie / UGC Set Workflow

### What Real UGC Creators Actually Do

UGC (User-Generated Content) creators produce authentic-looking promotional content that brands use on social media, ads, and product pages. Here's what actually happens in practice:

**Content Formats They Shoot:**
1. **"Look what I got!" unboxing** -- excited face, product in hand, messy packaging around
2. **Before/After or comparison** -- split-moment showing transformation (skincare, makeup, hair)
3. **GRWM (Get Ready With Me)** -- mid-routine, applying or wearing the product
4. **"POV: you just discovered..."** -- trending TikTok/Reels format, conspiratorial/excited expression
5. **Haul / showing off** -- holding product up to camera, "you NEED this" energy
6. **Outdoor lifestyle** -- walking, sitting at cafe, in the car, at the gym -- product naturally integrated
7. **Testimonial face** -- genuine "this actually works" expression, product visible
8. **Hands-only close-up** -- just hands demonstrating/applying the product, face out of frame
9. **Reaction shot** -- surprised/amazed face looking at the product or its result

**Expressions They Use:**
- Excited / surprised (unboxing, first try)
- Relaxed / casual (everyday use)  
- Focused / demonstrating (tutorials, application)
- Confident / satisfied (testimonials, results)
- Playful / conspiratorial ("let me tell you a secret")

**How Products Are Integrated (depends on category):**
- **Skincare/Beauty**: applying to face, holding up bottle, showing texture on hand
- **Clothing/Fashion**: wearing it, holding it up on hanger, outfit check
- **Accessories (bags, jewelry)**: wearing/holding naturally, styling with outfit
- **Food/Drink**: sipping, holding, eating, showing packaging
- **Tech/Gadgets**: using, showing screen, demonstrating features
- **Home goods**: using in context, decorating, organizing

### Current Problems with the Workflow

1. **Generic "holding" instruction** -- Every variation says "product held up near face" regardless of whether it's a lipstick (should be applying it) or a bag (should be wearing it)
2. **"Mirror Selfie" variation overlaps** with the dedicated Mirror Selfie Set workflow
3. **No expression/mood control** -- creator vibe is baked into each variation, user can't customize
4. **Missing key UGC scenes**: gym, bedroom outfit check, walking/street, kitchen/cooking, desk/workspace
5. **No product-category-aware interactions** -- a ring should be shown on a finger, not "held up"
6. **Only 8 variations** -- real creators shoot 15-20+ setups per product
7. **No "hands only" option** -- many top-performing UGC ads are just hands + product, no face

### Proposed Changes

#### 1. Expand to 16 Scene Variations (organized by category)

**Everyday Moments:**
- Golden Hour Selfie (keep)
- Coffee Shop / Brunch (keep, improved)
- Car Selfie (keep)
- Walking Street Style (NEW)
- Gym / Workout (NEW)

**At Home:**
- Morning Routine / GRWM (keep, improved)
- Bedroom Outfit Check (NEW)
- Couch / Netflix Chill (NEW)
- Kitchen Counter (NEW)

**Content Creator Angles:**
- Unboxing Excitement (keep, improved)
- Haul / "You Need This" (NEW)
- Before/After Moment (NEW)
- POV Discovery (NEW -- trending TikTok format)
- Testimonial / Review Face (NEW)

**Close-up / Detail:**
- In-Use Close-up (keep, improved)
- Hands-Only Product Demo (NEW -- no face required)

Remove "Mirror Selfie" (dedicated workflow exists) and "Shelfie/Collection" (too niche, rarely used in UGC).

#### 2. Product-Category-Aware Interactions

Instead of always saying "product held up near face", dynamically adjust HOW the product is shown based on `product.productType`:

```text
- skincare/beauty -> "applying to skin" or "showing texture on back of hand"
- clothing/apparel -> "wearing the item" or "holding it up on hanger"
- bags/accessories -> "wearing it naturally" or "styled with outfit"
- jewelry -> "wearing on hand/wrist/neck" or "showing close-up on skin"
- food/drink -> "sipping/tasting" or "holding package"
- tech/electronics -> "using/demonstrating" or "showing screen"
- default -> "holding product naturally"
```

This will be injected into the prompt template dynamically based on `product.productType`.

#### 3. Add Expression/Mood Selector to Wizard

Add a new setting in the wizard's settings step -- a simple chip selector for the creator's mood/expression:

- **Excited** -- "genuine excitement, wide smile, bright eyes, OMG-I-love-this energy"
- **Chill / Casual** -- "relaxed, soft smile, natural everyday vibe"  
- **Confident** -- "self-assured, subtle smile, I-know-what-I'm-about energy"
- **Surprised** -- "genuine surprise, raised eyebrows, wow reaction"
- **Focused** -- "demonstrating, tutorial mode, concentrated but friendly"

Default: "Excited" (most common UGC vibe). This gets injected into every variation's prompt.

#### 4. Update Prompt Template for Authenticity

Rewrite the base prompt template to be more specific about what makes UGC content look real:

- Emphasize imperfect framing (slightly off-center, not perfectly composed)
- Add "social media native" lighting descriptions per scene
- Include "one hand occupied holding phone" constraint (phone = camera)
- Add product-type-aware interaction instructions
- Include expression/mood directive from user selection
- Add "caption-ready" framing (leave space for text overlays like real creators do)

#### 5. Update System Instructions

Make the system instructions more specific about UGC aesthetics:
- "You are a Gen-Z content creator shooting product content for TikTok/Instagram Reels"
- Emphasize that every photo should look like it could have a text overlay or caption
- Natural lighting only, never studio
- Authentic imperfections: slightly messy background, casual styling, real-life setting

### Technical Implementation

#### Files to Change

1. **Database** -- Update workflow `3b54d43a-a03a-49a6-a64e-bf2dd999abc8`:
   - Replace `variation_strategy.variations` with 16 new scenes
   - Update `prompt_template` with product-category-aware interaction logic
   - Update `system_instructions` for better UGC authenticity
   - Update `negative_prompt_additions`
   - Change `default_image_count` from 8 to 16

2. **`src/pages/Generate.tsx`** -- Add mood/expression selector:
   - New state: `ugcMood` with type `'excited' | 'chill' | 'confident' | 'surprised' | 'focused'`
   - Render mood chips in the settings step (before the variation grid) when workflow is Selfie/UGC
   - Pass `ugc_mood` in the generation payload

3. **`supabase/functions/generate-workflow/index.ts`** -- Handle new fields:
   - Accept `ugc_mood` parameter
   - Add mood-to-expression description mapping
   - Inject product-type interaction logic into the prompt
   - Inject expression directive into each variation

#### Updated Prompt Template (database)

```text
Create an authentic UGC (user-generated content) selfie photograph shot FROM the smartphone 
front-facing camera. The camera IS the phone -- the viewer sees exactly what the iPhone front 
camera captures. The subject is looking DIRECTLY into the camera lens.

PRODUCT INTERACTION:
The subject must be naturally {PRODUCT_INTERACTION} with the EXACT product from [PRODUCT IMAGE].
The product must be clearly visible and recognizable in the frame.

EXPRESSION & ENERGY:
{MOOD_DESCRIPTION}

[MODEL IMAGE] is the reference for the person. The generated person MUST have the EXACT same 
face, skin tone, hair color, hair texture, hair length, facial structure, eye color, and 
distinguishing features as [MODEL IMAGE]. Identity preservation is non-negotiable.

CAMERA: iPhone front camera, standard photo mode (NOT Portrait Mode). Deep depth of field. 
26mm equivalent. Slight wide-angle smartphone distortion.

COLOR SCIENCE: Apple iPhone computational photography. True-to-life colors. Smart HDR.

TEXTURE: Ultra-sharp. Natural skin with pores visible. No retouching. 48MP sensor quality.

UGC AUTHENTICITY: This must look like a real person's social media post. Slightly imperfect 
framing is GOOD. Natural ambient lighting only. The setting should look lived-in and real, 
not staged. Leave slight space at top/bottom for potential text overlay or caption area.
```

#### Product Interaction Mapping (edge function)

```typescript
const PRODUCT_INTERACTIONS: Record<string, string> = {
  'skincare': 'applying to their skin or showing the product texture on the back of their hand',
  'beauty': 'applying the product or holding it up near their face showing the shade/color',
  'makeup': 'applying the product or holding it up near their face showing the shade/color',
  'clothing': 'wearing the item naturally as part of their outfit',
  'apparel': 'wearing the item naturally as part of their outfit',
  'shoes': 'showing the shoes on their feet or holding them up excitedly',
  'bags': 'wearing the bag naturally on their shoulder or holding it',
  'jewelry': 'wearing the jewelry piece (on finger, wrist, neck, or ear) and showing it off',
  'rings': 'wearing the ring on their finger and holding their hand up to show it',
  'watches': 'wearing the watch on their wrist and casually showing it',
  'food': 'holding the food/drink package or tasting/sipping the product',
  'drink': 'sipping or holding the drink toward the camera',
  'tech': 'using or demonstrating the device naturally',
  'fragrance': 'holding the bottle near their neck/wrist as if just applied',
  'haircare': 'running fingers through their hair or holding the product near their hair',
};
// Default: 'holding the product naturally near their face or chest'
```

#### Mood Descriptions (edge function)

```typescript
const UGC_MOODS: Record<string, string> = {
  'excited': 'Genuine excitement and enthusiasm. Wide natural smile, bright eyes, "OMG I love this" energy. The kind of face you make when showing your best friend something amazing.',
  'chill': 'Relaxed and casual. Soft natural smile, effortless cool vibe. Everyday comfort energy, as if casually mentioning a product they use daily.',
  'confident': 'Self-assured and knowing. Subtle confident smile, direct eye contact with the camera. "I know what works for me" energy.',
  'surprised': 'Genuine surprise and wonder. Slightly raised eyebrows, open expression, "wait this actually works?!" reaction face.',
  'focused': 'Demonstrating and explaining. Friendly but concentrated expression, tutorial-mode energy. Looking at the product or showing how to use it.',
};
```

#### 16 New Scene Variations

Each variation gets product-category-aware instructions and mood injection. Here are the key new ones:

- **Walking Street Style**: Casual walking pose, city street background, product integrated into outfit/held naturally
- **Gym / Workout**: Activewear, gym background, post-workout glow, product shown as part of routine  
- **Bedroom Outfit Check**: Standing in front of mirror or in bedroom, full/half outfit visible, showing how product fits into look
- **Couch / Netflix Chill**: Relaxed on couch, cozy setting, product in lap or being used casually
- **Kitchen Counter**: Morning kitchen vibes, natural light from window, product on counter or being used
- **Haul / "You Need This"**: Product held up close to camera, excited "showing my haul" energy, bed/desk background with other purchases
- **Before/After Moment**: Showing the result/transformation, product visible, "look at the difference" expression
- **POV Discovery**: Ultra close-up, conspiratorial expression, "let me tell you about this" energy, trending TikTok style
- **Testimonial / Review Face**: Earnest expression, product held at chest level, genuine recommendation vibe
- **Hands-Only Product Demo**: Just hands in frame, product being applied/demonstrated, no face needed (skip model requirement)

### Sequence

1. Add `ugc_mood` state and mood chip selector UI in `Generate.tsx`
2. Pass `ugc_mood` in the generation payload
3. Update edge function to handle `ugc_mood` and product-type interactions
4. Update database with 16 new variations, improved prompt template, and system instructions
5. Deploy edge function

