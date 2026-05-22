/**
 * Phase 7g — Category × Sub-family aware setting pools.
 * Phase 7i — Tabletop / flat-lay scene type removed; tabletop-only sub-families
 * topped up with indoor_lifestyle / studio settings so the picker stays useful.
 *
 * Lookup order:
 *   1) `${module}/${sub_family}` for the chosen scene_type
 *   2) `${module}/*` for the chosen scene_type
 *   3) global `*` for the chosen scene_type
 *
 * Anything missing falls through; we never block a new sub-family.
 */

export const SCENE_TYPES = [
  { value: "studio", label: "Studio", vibe: "Controlled, seamless, lighting-led" },
  { value: "indoor_lifestyle", label: "Indoor lifestyle", vibe: "Interior with story — rooms, lobbies, cafés" },
  { value: "outdoor_location", label: "Outdoor location", vibe: "Built environments — streets, rooftops, pools" },
  { value: "outdoor_nature", label: "Outdoor nature", vibe: "Untamed — beach, forest, desert, mountain" },
  { value: "architectural", label: "Architectural", vibe: "Hero of place — galleries, ruins, brutalist forms" },
] as const;

export type SceneTypeId = (typeof SCENE_TYPES)[number]["value"];

type Pool = Partial<Record<SceneTypeId, string[]>>;

const GLOBAL: Required<Pick<Pool, SceneTypeId>> = {
  studio: [
    "Seamless paper sweep",
    "Cyclorama wall",
    "Painted plaster wall",
    "Hard split backdrop",
    "Soft gradient sweep",
    "Plinth on cyclorama",
  ],
  indoor_lifestyle: [
    "Modern loft",
    "Sunlit living room",
    "Café interior",
    "Hotel lobby",
    "Atelier studio",
    "Art gallery",
    "Industrial warehouse",
    "Bedroom morning",
  ],
  outdoor_location: [
    "City street",
    "Old town alley",
    "Rooftop terrace",
    "Parking garage",
    "Subway platform",
    "Industrial loft exterior",
  ],
  outdoor_nature: [
    "Forest trail",
    "Open field",
    "Mountain pass",
    "Coastal cliff",
    "Desert dune",
    "Riverbank",
  ],
  architectural: [
    "Brutalist concrete form",
    "Marble gallery",
    "Glass atrium",
    "Stone cloister",
    "Modern museum interior",
  ],
};

const POOLS: Record<string, Pool> = {
  // ---------------- Fashion sub-families ----------------
  "fashion/swimwear": {
    outdoor_nature: ["Ocean shoreline", "Tropical lagoon", "Salt flats", "Cliff edge above sea", "Desert oasis"],
    outdoor_location: ["Hotel pool deck", "Modern villa pool", "Jungle pool", "Rooftop pool", "Yacht deck", "Beach club cabana"],
    indoor_lifestyle: ["Sunlit villa interior", "Spa lounge", "Bath house"],
    studio: ["Sand-bed studio", "Wet-floor studio", "Painted gradient"],
  },
  "fashion/jackets": {
    outdoor_location: ["City street", "Old town alley", "Industrial loft exterior", "Subway platform", "Parking garage", "Mountain pass"],
    outdoor_nature: ["Forest trail", "Snowy alley", "Foggy moor", "Windy field", "Rocky coastline"],
    indoor_lifestyle: ["Loft", "Atelier", "Diner", "Warehouse interior"],
    studio: ["Concrete wall studio", "Painted plaster wall", "Cyclorama"],
  },
  "fashion/dresses": {
    architectural: ["Marble gallery", "Glass atrium", "Stone cloister", "Ballroom"],
    indoor_lifestyle: ["Hotel lobby", "Rooftop terrace", "Greenhouse", "Gallery"],
    outdoor_nature: ["Wildflower field", "Coastal cliff", "Garden at dusk"],
    studio: ["Soft gradient sweep", "Velvet drape", "Cyclorama"],
  },
  "fashion/activewear": {
    outdoor_location: ["Skate plaza", "Track", "Rooftop court", "Bridge underpass"],
    outdoor_nature: ["Trail run", "Mountain switchback", "Coastal trail"],
    studio: ["High-key studio", "Rubber floor studio"],
  },
  "fashion/lingerie": {
    indoor_lifestyle: ["Bedroom morning", "Velvet boudoir", "Sunlit linen room", "Marble bath edge"],
    studio: ["Soft silk drape", "Painted plaster wall", "Cyclorama"],
  },
  "fashion/streetwear": {
    outdoor_location: ["Skate plaza", "Subway platform", "Graffiti alley", "Rooftop", "Bodega corner", "Train yard"],
    indoor_lifestyle: ["Warehouse interior", "Diner", "Underground club"],
    studio: ["Concrete wall", "Painted graffiti backdrop"],
  },
  "fashion/jeans": {
    outdoor_location: ["City street", "Diner exterior", "Rooftop", "Skate plaza", "Industrial loft exterior"],
    indoor_lifestyle: ["Diner", "Loft", "Atelier"],
    studio: ["Concrete wall", "Cyclorama", "Painted plaster wall"],
  },
  "fashion/hoodies": {
    outdoor_location: ["Skate plaza", "Subway platform", "Rooftop", "Parking garage"],
    indoor_lifestyle: ["Warehouse interior", "Bedroom morning", "Loft"],
    studio: ["Concrete wall", "Cyclorama"],
  },
  "fashion/garments": {
    studio: ["Soft gradient sweep", "Cyclorama", "Painted plaster wall", "Velvet drape"],
    indoor_lifestyle: ["Atelier studio", "Gallery"],
    architectural: ["Marble gallery", "Glass atrium"],
  },

  // ---------------- Footwear ----------------
  "footwear/sneakers": {
    outdoor_location: ["Skate plaza", "Subway platform", "Basketball court", "Rooftop", "Warehouse exterior"],
    studio: ["Plinth on cyclorama", "Concrete slab studio", "Sand bed", "Stacked pair on plinth"],
  },
  "footwear/boots": {
    outdoor_nature: ["Forest trail", "Snowy alley", "Mountain pass", "Muddy field"],
    outdoor_location: ["Cobblestone alley", "Industrial loft exterior", "Wet cobblestone night"],
    studio: ["Plinth on cyclorama", "Wood plank studio"],
  },
  "footwear/high-heels": {
    architectural: ["Marble gallery", "Stone cloister", "Modernist staircase"],
    indoor_lifestyle: ["Hotel lobby", "Velvet boudoir", "Backstage mirror", "Hotel suite carpet"],
    studio: ["Mirror floor studio", "Velvet drape"],
  },
  "footwear/shoes": {
    indoor_lifestyle: ["Hotel lobby", "Atelier", "Gallery"],
    outdoor_location: ["Cobblestone alley", "City street"],
    studio: ["Plinth on cyclorama", "Wood plank studio"],
  },

  // ---------------- Eyewear ----------------
  "eyewear/eyewear": {
    outdoor_location: ["Beach boardwalk", "Marina", "Rooftop pool", "Convertible interior", "Pool ladder reflection", "Tennis club"],
    outdoor_nature: ["Coastal cliff", "Salt flats", "Desert dune"],
    studio: ["Cyclorama", "Painted gradient", "Mirror studio"],
    indoor_lifestyle: ["Hotel lobby", "Café interior"],
  },

  // ---------------- Beauty & Fragrance ----------------
  "beauty-fragrance/fragrance": {
    indoor_lifestyle: ["Vanity nook", "Sunlit bathroom", "Boudoir corner", "Marble vanity shelf", "Sunlit windowsill"],
    studio: ["Painted gradient", "Soft silk drape", "Wet glass slab", "Velvet drape"],
    outdoor_nature: ["Garden bench"],
  },
  "beauty-fragrance/beauty-skincare": {
    indoor_lifestyle: ["Sunlit bathroom", "Vanity nook", "Spa shelf", "Marble vanity", "Glass shelf"],
    studio: ["Soft gradient", "Cyclorama", "Water droplet surface", "Stone slab"],
  },
  "beauty-fragrance/makeup-lipsticks": {
    indoor_lifestyle: ["Vanity nook", "Boudoir corner", "Marble vanity", "Mirror tray"],
    studio: ["High-key cyclorama", "Painted gradient", "Velvet drape", "Acrylic riser"],
  },

  // ---------------- Bags & Accessories ----------------
  "bags-accessories/backpacks": {
    outdoor_nature: ["Forest trail", "Mountain pass", "Rocky coastline"],
    outdoor_location: ["City street", "Subway platform", "Train station"],
    studio: ["Cyclorama plinth", "Sand bed"],
  },
  "bags-accessories/bags-accessories": {
    indoor_lifestyle: ["Hotel lobby", "Atelier", "Gallery", "Marble console"],
    outdoor_location: ["City street", "Rooftop terrace"],
    studio: ["Cyclorama plinth", "Velvet drape"],
  },
  "bags-accessories/wallets-cardholders": {
    indoor_lifestyle: ["Atelier", "Hotel desk", "Leather mat on console"],
    studio: ["Plinth on cyclorama", "Velvet tray", "Marble slab", "Wood plank"],
  },
  "bags-accessories/belts": {
    studio: ["Plinth on cyclorama", "Hanging on hook", "Coiled on marble"],
    indoor_lifestyle: ["Atelier", "Wood plank console"],
  },
  "bags-accessories/scarves": {
    studio: ["Floating drape", "Velvet plinth", "Draped on marble"],
    indoor_lifestyle: ["Boudoir corner", "Atelier", "Folded on linen chair"],
  },

  // ---------------- Hats, Caps & Beanies ----------------
  "hats-caps-beanies/caps": {
    outdoor_location: ["Skate plaza", "Rooftop", "Basketball court", "Skate park bowl", "Tennis baseline"],
    studio: ["Cyclorama plinth", "Stacked stack"],
  },
  "hats-caps-beanies/hats": {
    outdoor_nature: ["Wildflower field", "Coastal cliff", "Desert dune"],
    indoor_lifestyle: ["Atelier", "Boudoir corner", "Hat-box arrangement on console"],
    studio: ["Cyclorama plinth", "Velvet drape"],
  },
  "hats-caps-beanies/beanies": {
    outdoor_nature: ["Snowy alley", "Forest trail", "Mountain pass", "Ski lift", "Foggy harbor"],
    outdoor_location: ["City street", "Café exterior"],
    studio: ["Cyclorama plinth"],
  },

  // ---------------- Watches ----------------
  "watches/watches": {
    indoor_lifestyle: ["Atelier", "Library desk", "Hotel desk", "Notebook on desk"],
    studio: ["Plinth on cyclorama", "Velvet tray", "Marble slab", "Stone shelf"],
    outdoor_location: ["Marina", "Convertible interior", "Café counter", "Mountain lodge", "Driver POV steering wheel"],
  },

  // ---------------- Jewelry ----------------
  "jewelry/jewellery-rings": {
    studio: ["Plinth macro", "Sand bed", "Gradient sweep", "Marble slab", "Velvet tray", "Stone shelf", "Water surface"],
    indoor_lifestyle: ["Atelier", "Boudoir corner"],
  },
  "jewelry/jewellery-necklaces": {
    studio: ["Bust form on plinth", "Floating chain", "Gradient sweep", "Velvet drape", "Marble slab", "Linen fold"],
    indoor_lifestyle: ["Boudoir corner", "Atelier"],
  },
  "jewelry/jewellery-earrings": {
    studio: ["Macro plinth", "Floating earring", "Gradient sweep", "Velvet tray", "Acrylic riser"],
    indoor_lifestyle: ["Atelier", "Boudoir corner"],
  },
  "jewelry/jewellery-bracelets": {
    studio: ["Wrist form on plinth", "Coiled on plinth", "Velvet tray", "Marble slab"],
    indoor_lifestyle: ["Atelier"],
  },

  // ---------------- Home ----------------
  "home/home-decor": {
    indoor_lifestyle: ["Sunlit living room", "Loft corner", "Stylist's nook", "Linen-set console", "Wood-plank shelf"],
    studio: ["Painted plaster", "Cyclorama", "Marble slab"],
  },
  "home/furniture": {
    indoor_lifestyle: ["Sunlit living room", "Loft corner", "Bedroom morning", "Minimalist apartment"],
    architectural: ["Marble gallery", "Concrete pavilion", "Glass atrium"],
    studio: ["Painted plaster", "Cyclorama sweep"],
  },

  // ---------------- Tech ----------------
  "tech/tech-devices": {
    indoor_lifestyle: ["Minimalist desk", "Café table", "Studio bench", "Coffee shop side table", "Plane tray table"],
    studio: ["Plinth on cyclorama", "Painted gradient", "Lit acrylic surface", "Concrete slab"],
  },

  // ---------------- Food & Drink ----------------
  "food-drink/beverages": {
    indoor_lifestyle: ["Café counter", "Sunlit kitchen", "Bar interior", "Marble bar top", "Wood plank table"],
    outdoor_nature: ["Garden bench", "Picnic blanket"],
    studio: ["Wet glass surface", "Painted gradient"],
  },
  "food-drink/food": {
    indoor_lifestyle: ["Sunlit kitchen", "Café table", "Family table", "Linen-set table", "Wood board on counter"],
    outdoor_nature: ["Picnic blanket", "Garden bench"],
    studio: ["Marble slab", "Stone slab"],
  },
  "food-drink/snacks-food": {
    indoor_lifestyle: ["Sunlit kitchen", "Café table", "Wood board on counter"],
    studio: ["Painted gradient", "High-key cyclorama", "Marble slab", "Paper backdrop"],
  },

  // ---------------- Wellness ----------------
  "wellness/supplements-wellness": {
    indoor_lifestyle: ["Sunlit bathroom", "Vanity nook", "Linen drape on console", "Stone slab shelf"],
    studio: ["Soft gradient", "Painted plaster", "Marble vanity"],
  },
};

export function getSettingPool(
  module: string | undefined,
  subFamily: string | undefined,
  sceneType: SceneTypeId | undefined,
): string[] {
  if (!sceneType) return [];
  const specific = module && subFamily ? POOLS[`${module}/${subFamily}`]?.[sceneType] : undefined;
  const family = module ? POOLS[`${module}/*`]?.[sceneType] : undefined;
  return specific ?? family ?? GLOBAL[sceneType] ?? [];
}

/** True if this sub-family has at least one explicit (non-global) pool entry. */
export function hasExplicitPool(module: string | undefined, subFamily: string | undefined): boolean {
  if (!module || !subFamily) return false;
  return !!POOLS[`${module}/${subFamily}`];
}

export function isOutdoor(sceneType: SceneTypeId | undefined): boolean {
  return sceneType === "outdoor_location" || sceneType === "outdoor_nature";
}

export function isIndoor(sceneType: SceneTypeId | undefined): boolean {
  return (
    sceneType === "studio" ||
    sceneType === "indoor_lifestyle" ||
    sceneType === "architectural"
  );
}
