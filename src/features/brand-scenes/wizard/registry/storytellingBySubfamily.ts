/**
 * Phase 7i — Per-sub-family storytelling moments.
 *
 * Returns moments tailored to the chosen sub-family. Falls back to a short
 * generic list when no map entry exists.
 */

const GENERIC: string[] = [
  "Arriving",
  "Mid-action",
  "Resting",
  "Quiet pause",
];

const MOMENTS: Record<string, string[]> = {
  // Fashion
  "fashion/swimwear": [
    "Stepping out of water",
    "Lounging poolside",
    "Toweling off",
    "Walking the shoreline",
    "Sun-soaking on deck",
  ],
  "fashion/lingerie": [
    "Slipping on a robe",
    "Sitting on the bed edge",
    "Standing by the window",
    "Lying on linen sheets",
  ],
  "fashion/jackets": [
    "Zipping up",
    "Collar pop",
    "Walking into the cold",
    "Hands in pockets",
    "Looking back over shoulder",
  ],
  "fashion/dresses": [
    "Twirl",
    "Adjusting strap",
    "Mid-step entrance",
    "Sitting elegantly",
    "Standing in a doorway",
  ],
  "fashion/activewear": [
    "Warm-up stretch",
    "Mid-rep",
    "Cooldown breath",
    "Post-sweat pause",
    "Lacing up",
  ],
  "fashion/streetwear": [
    "Cypher pose",
    "Mid-stride pass",
    "Leaning against wall",
    "Crew exchange",
  ],
  "fashion/jeans": [
    "Walking past camera",
    "Sitting on a stoop",
    "Adjusting waistband",
    "Hands in back pockets",
  ],
  "fashion/hoodies": [
    "Pulling hood up",
    "Hands in front pocket",
    "Sitting on stairs",
    "Mid-stride at night",
  ],
  "fashion/garments": [
    "Standing portrait",
    "Mid-stride",
    "Sitting elegantly",
    "Adjusting cuff",
  ],

  // Footwear
  "footwear/sneakers": [
    "Lacing up",
    "Mid-stride",
    "Kicked off beside",
    "Stepping onto curb",
    "Pivoting on heel",
  ],
  "footwear/shoes": [
    "Stepping out of door",
    "Slipping on",
    "Walking corridor",
    "Standing at attention",
  ],
  "footwear/boots": [
    "Stepping through mud",
    "Standing on rocks",
    "Cuffing the shaft",
    "Walking in snow",
  ],
  "footwear/high-heels": [
    "Standing on tiptoe",
    "Mid-step entrance",
    "Kicked off carpet",
    "Crossing legs seated",
  ],

  // Bags & Accessories
  "bags-accessories/bags-accessories": [
    "Pulling from shoulder",
    "Setting down",
    "Reaching inside",
    "Carrying through the street",
  ],
  "bags-accessories/backpacks": [
    "Slinging on shoulder",
    "Setting down on ground",
    "Unzipping main pocket",
    "Walking trail with pack",
  ],
  "bags-accessories/wallets-cardholders": [
    "Opening to reveal cards",
    "Slipping into pocket",
    "Set on counter",
    "Pulling out card",
  ],
  "bags-accessories/belts": [
    "Threading buckle",
    "Cinching at waist",
    "Coiled on surface",
    "Looping through trousers",
    "Adjusting at hip",
  ],
  "bags-accessories/scarves": [
    "Tying around neck",
    "Wind-caught drape",
    "Folded on chair",
    "Head-wrap moment",
  ],

  // Hats / Caps / Beanies
  "hats-caps-beanies/caps": [
    "Tilting brim",
    "Backwards cap",
    "Adjusting at mirror",
    "Hands behind head",
  ],
  "hats-caps-beanies/hats": [
    "Holding brim against wind",
    "Tipping the hat",
    "Sat at tea",
    "Walking field",
  ],
  "hats-caps-beanies/beanies": [
    "Pulling over ears",
    "Adjusting on the move",
    "Hands warming pockets",
    "Snowy breath",
  ],

  // Watches
  "watches/watches": [
    "Clasping the strap",
    "Checking the time",
    "Adjusting cuff over watch",
    "Resting on desk",
  ],

  // Eyewear
  "eyewear/eyewear": [
    "Putting on",
    "Pushing up into hair",
    "Lowering for a glance",
    "Folded in hand",
  ],

  // Jewelry
  "jewelry/jewellery-rings": [
    "Slipping onto finger",
    "Hand-on-chin pose",
    "Adjusting stack",
    "Held to light",
  ],
  "jewelry/jewellery-necklaces": [
    "Clasping at nape",
    "Resting on collarbone",
    "Layering chains",
    "Touching pendant",
  ],
  "jewelry/jewellery-earrings": [
    "Hooking through ear",
    "Tucking hair behind ear",
    "Profile reveal",
  ],
  "jewelry/jewellery-bracelets": [
    "Clasping on wrist",
    "Stacking",
    "Wrist turn to camera",
  ],

  // Beauty & Fragrance
  "beauty-fragrance/fragrance": [
    "Spraying",
    "Smelling wrist",
    "Tipping bottle",
    "Cap off, mid-reach",
  ],
  "beauty-fragrance/beauty-skincare": [
    "Applying to face",
    "Dollop on hand",
    "Open jar dip",
    "Patting in",
  ],
  "beauty-fragrance/makeup-lipsticks": [
    "Applying to lips",
    "Swatch on hand",
    "Open bullet reveal",
    "Mirror moment",
  ],

  // Home
  "home/home-decor": [
    "Setting in place",
    "Wiping clean",
    "Adjusting on shelf",
    "In situ at rest",
  ],
  "home/furniture": [
    "Sitting down",
    "Lounging into it",
    "Setting a cup down",
    "Empty room at rest",
  ],

  // Tech
  "tech/tech-devices": [
    "Powering on",
    "Tapping screen",
    "Setting on desk",
    "Holding in hand",
  ],

  // Food & Drink
  "food-drink/beverages": [
    "Pouring",
    "First sip",
    "Cheers / clinking",
    "Condensation moment",
  ],
  "food-drink/food": [
    "Plating",
    "Sharing",
    "First bite",
    "Setting on table",
  ],
  "food-drink/snacks-food": [
    "Opening pack",
    "Reaching in",
    "Pouring out",
    "Stacking on board",
  ],

  // Wellness
  "wellness/supplements-wellness": [
    "Opening cap",
    "Pouring into palm",
    "Set on vanity",
    "Morning ritual",
  ],
};

export function getStorytellingMoments(
  module: string | undefined,
  subFamily: string | undefined,
): string[] {
  if (!module || !subFamily) return GENERIC;
  return MOMENTS[`${module}/${subFamily}`] ?? GENERIC;
}

export function hasExplicitMoments(
  module: string | undefined,
  subFamily: string | undefined,
): boolean {
  if (!module || !subFamily) return false;
  return !!MOMENTS[`${module}/${subFamily}`];
}
