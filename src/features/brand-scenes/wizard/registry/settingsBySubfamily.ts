/**
 * Phase 7g — Category × Sub-family aware setting pools.
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
  { value: "tabletop", label: "Tabletop / flat-lay", vibe: "Top-down or hero plinth, no people" },
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
  tabletop: [
    "Linen-set table",
    "Studio plinth",
    "Marble slab",
    "Sand bed",
    "Glass surface",
    "Wood plank",
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
    indoor_lifestyle: ["Bedroom morning", "Velvet boudoir", "Sunlit linen room"],
    studio: ["Soft silk drape", "Painted plaster wall", "Cyclorama"],
  },
  "fashion/streetwear": {
    outdoor_location: ["Skate plaza", "Subway platform", "Graffiti alley", "Rooftop"],
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
    studio: ["Plinth on cyclorama", "Concrete slab studio", "Sand bed"],
    tabletop: ["Studio plinth", "Knolling flat-lay", "Stacked pair"],
  },
  "footwear/boots": {
    outdoor_nature: ["Forest trail", "Snowy alley", "Mountain pass", "Muddy field"],
    outdoor_location: ["Cobblestone alley", "Industrial loft exterior"],
    studio: ["Plinth on cyclorama", "Wood plank studio"],
  },
  "footwear/high-heels": {
    architectural: ["Marble gallery", "Stone cloister", "Modernist staircase"],
    indoor_lifestyle: ["Hotel lobby", "Velvet boudoir"],
    studio: ["Mirror floor studio", "Velvet drape"],
  },
  "footwear/shoes": {
    indoor_lifestyle: ["Hotel lobby", "Atelier", "Gallery"],
    outdoor_location: ["Cobblestone alley", "City street"],
    studio: ["Plinth on cyclorama", "Wood plank studio"],
    tabletop: ["Studio plinth", "Knolling flat-lay"],
  },

  // ---------------- Eyewear ----------------
  "eyewear/eyewear": {
    outdoor_location: ["Beach boardwalk", "Marina", "Rooftop pool", "Convertible interior"],
    outdoor_nature: ["Coastal cliff", "Salt flats", "Desert dune"],
    studio: ["Cyclorama", "Painted gradient", "Mirror studio"],
    tabletop: ["Marble slab", "Stone shelf", "Folded on linen"],
  },

  // ---------------- Beauty & Fragrance ----------------
  "beauty-fragrance/fragrance": {
    tabletop: ["Marble vanity", "Sunlit windowsill", "Wet glass slab", "Velvet drape", "Garden bench"],
    indoor_lifestyle: ["Vanity nook", "Sunlit bathroom", "Boudoir corner"],
    studio: ["Painted gradient", "Soft silk drape"],
  },
  "beauty-fragrance/beauty-skincare": {
    tabletop: ["Marble vanity", "Linen drape", "Glass shelf", "Stone slab", "Water droplet surface"],
    indoor_lifestyle: ["Sunlit bathroom", "Vanity nook", "Spa shelf"],
    studio: ["Soft gradient", "Cyclorama"],
  },
  "beauty-fragrance/makeup-lipsticks": {
    tabletop: ["Marble vanity", "Mirror tray", "Velvet drape", "Acrylic riser"],
    studio: ["High-key cyclorama", "Painted gradient"],
    indoor_lifestyle: ["Vanity nook", "Boudoir corner"],
  },

  // ---------------- Bags & Accessories ----------------
  "bags-accessories/backpacks": {
    outdoor_nature: ["Forest trail", "Mountain pass", "Rocky coastline"],
    outdoor_location: ["City street", "Subway platform", "Train station"],
    studio: ["Cyclorama plinth", "Sand bed"],
  },
  "bags-accessories/bags-accessories": {
    indoor_lifestyle: ["Hotel lobby", "Atelier", "Gallery"],
    outdoor_location: ["City street", "Rooftop terrace"],
    studio: ["Cyclorama plinth", "Velvet drape"],
    tabletop: ["Marble slab", "Linen drape"],
  },
  "bags-accessories/wallets-cardholders": {
    tabletop: ["Marble slab", "Linen drape", "Wood plank", "Leather mat"],
    studio: ["Plinth on cyclorama", "Velvet tray"],
  },
  "bags-accessories/belts": {
    tabletop: ["Coiled on marble", "Knolling flat-lay", "Wood plank"],
    studio: ["Plinth on cyclorama", "Hanging on hook"],
    indoor_lifestyle: ["Atelier"],
  },
  "bags-accessories/scarves": {
    tabletop: ["Draped on marble", "Folded on linen", "Knolling flat-lay"],
    studio: ["Floating drape", "Velvet plinth"],
    indoor_lifestyle: ["Boudoir corner", "Atelier"],
  },

  // ---------------- Hats, Caps & Beanies ----------------
  "hats-caps-beanies/caps": {
    outdoor_location: ["Skate plaza", "Rooftop", "Basketball court"],
    studio: ["Cyclorama plinth", "Stacked stack"],
    tabletop: ["Knolling flat-lay", "Wood plank"],
  },
  "hats-caps-beanies/hats": {
    outdoor_nature: ["Wildflower field", "Coastal cliff", "Desert dune"],
    indoor_lifestyle: ["Atelier", "Boudoir corner"],
    studio: ["Cyclorama plinth", "Velvet drape"],
    tabletop: ["Studio plinth", "Hat-box arrangement"],
  },
  "hats-caps-beanies/beanies": {
    outdoor_nature: ["Snowy alley", "Forest trail", "Mountain pass"],
    outdoor_location: ["City street", "Café exterior"],
    studio: ["Cyclorama plinth"],
    tabletop: ["Folded on linen", "Knolling flat-lay"],
  },

  // ---------------- Watches ----------------
  "watches/watches": {
    tabletop: ["Marble slab", "Linen drape", "Sand bed", "Stone shelf"],
    studio: ["Plinth on cyclorama", "Velvet tray"],
    outdoor_location: ["Marina", "Convertible interior", "Café counter", "Mountain lodge"],
    indoor_lifestyle: ["Atelier", "Library desk", "Hotel desk"],
  },

  // ---------------- Jewelry ----------------
  "jewelry/jewellery-rings": {
    tabletop: ["Marble slab", "Velvet tray", "Stone shelf", "Water surface", "Sand bed"],
    studio: ["Plinth macro", "Sand bed", "Gradient sweep"],
  },
  "jewelry/jewellery-necklaces": {
    tabletop: ["Velvet drape", "Marble slab", "Linen fold", "Stone shelf"],
    studio: ["Bust form on plinth", "Floating chain", "Gradient sweep"],
  },
  "jewelry/jewellery-earrings": {
    tabletop: ["Velvet tray", "Marble slab", "Acrylic riser"],
    studio: ["Macro plinth", "Floating earring", "Gradient sweep"],
  },
  "jewelry/jewellery-bracelets": {
    tabletop: ["Velvet tray", "Marble slab", "Wood plank"],
    studio: ["Wrist form on plinth", "Coiled on plinth"],
  },

  // ---------------- Home ----------------
  "home/home-decor": {
    indoor_lifestyle: ["Sunlit living room", "Loft corner", "Stylist's nook"],
    tabletop: ["Linen-set table", "Wood plank", "Marble slab"],
    studio: ["Painted plaster", "Cyclorama"],
  },
  "home/furniture": {
    indoor_lifestyle: ["Sunlit living room", "Loft corner", "Bedroom morning", "Minimalist apartment"],
    architectural: ["Marble gallery", "Concrete pavilion", "Glass atrium"],
    studio: ["Painted plaster", "Cyclorama sweep"],
  },

  // ---------------- Tech ----------------
  "tech/tech-devices": {
    tabletop: ["Wood desk", "Marble slab", "Lit surface", "Concrete slab"],
    indoor_lifestyle: ["Minimalist desk", "Café table", "Studio bench"],
    studio: ["Plinth on cyclorama", "Painted gradient"],
  },

  // ---------------- Food & Drink ----------------
  "food-drink/beverages": {
    tabletop: ["Marble slab", "Wet glass surface", "Wood plank", "Linen-set table"],
    indoor_lifestyle: ["Café counter", "Sunlit kitchen", "Bar interior"],
    outdoor_nature: ["Garden bench", "Picnic blanket"],
  },
  "food-drink/food": {
    tabletop: ["Linen-set table", "Wood board", "Marble slab", "Stone slab"],
    indoor_lifestyle: ["Sunlit kitchen", "Café table", "Family table"],
    outdoor_nature: ["Picnic blanket", "Garden bench"],
  },
  "food-drink/snacks-food": {
    tabletop: ["Wood board", "Linen drape", "Marble slab", "Paper backdrop"],
    indoor_lifestyle: ["Sunlit kitchen", "Café table"],
    studio: ["Painted gradient", "High-key cyclorama"],
  },

  // ---------------- Wellness ----------------
  "wellness/supplements-wellness": {
    tabletop: ["Linen drape", "Stone slab", "Marble vanity"],
    studio: ["Soft gradient", "Painted plaster"],
    indoor_lifestyle: ["Sunlit bathroom", "Vanity nook"],
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
    sceneType === "architectural" ||
    sceneType === "tabletop"
  );
}
