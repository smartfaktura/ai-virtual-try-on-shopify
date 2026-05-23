/**
 * Per-(family, sub-family) wardrobe / product-focus guides.
 *
 * Why this exists: scenes like "Lingerie / cozy bedroom" used to render a
 * model in pajamas because nothing in the compiled prompt actually said the
 * hero garment was lingerie. These guides inject:
 *   1. A PRODUCT FOCUS section (top of the prompt) — what the model wears /
 *      how the product is staged.
 *   2. A safeguard line appended to NEGATIVE so common substitutions are
 *      forbidden ("no pajamas / no loungewear instead of the lingerie set").
 *   3. An optional UI banner shown above the outfit picker so the user knows
 *      the hero garment is enforced.
 */
import type { BrandSceneModule } from "../../constants";

export interface SubfamilyGuide {
  /** Short product noun shown in the UI banner (e.g. "lingerie set"). */
  productNoun: string;
  /** Full sentence injected into PRODUCT FOCUS. */
  wardrobe: string;
  /** Hard negatives appended to the NEGATIVE block. */
  safeguards: string[];
  /** If true, the outfit picker shows a "Hero garment enforced" banner. */
  mustWearProduct?: boolean;
}

type Key = `${BrandSceneModule}/${string}`;

export const SUBFAMILY_GUIDES: Partial<Record<Key, SubfamilyGuide>> = {
  // ── Fashion ────────────────────────────────────────────────────────────
  "fashion/lingerie": {
    productNoun: "lingerie set",
    wardrobe:
      "Model wears a well-fitted lingerie set (bralette + briefs, matching slip or bodysuit) as the hero garment — visible, on-body, photographed as the focal product.",
    safeguards: [
      "Do not render pajamas, oversized t-shirts, robes, loungewear or sweats in place of the lingerie hero piece.",
    ],
    mustWearProduct: true,
  },
  "fashion/swimwear": {
    productNoun: "swimwear",
    wardrobe:
      "Model wears the brand's swimwear (one-piece, bikini set or board shorts) as the hero garment — visible, on-body, photographed as the focal product.",
    safeguards: [
      "Do not render casual streetwear, lingerie or athletic activewear in place of the swimwear hero piece.",
    ],
    mustWearProduct: true,
  },
  "fashion/activewear": {
    productNoun: "activewear",
    wardrobe:
      "Model wears the brand's activewear set (leggings + sports top, joggers, or training one-piece) as the hero garment — visible, on-body, performance-fit.",
    safeguards: [
      "Do not substitute casual streetwear, denim or lingerie for the activewear hero piece.",
    ],
    mustWearProduct: true,
  },
  "fashion/dresses": {
    productNoun: "dress",
    wardrobe:
      "Model wears a single hero dress as the focal garment — full silhouette readable, fabric drape visible.",
    safeguards: ["Do not split the look into separates; the dress is the hero piece."],
    mustWearProduct: true,
  },
  "fashion/jackets": {
    productNoun: "jacket / outerwear",
    wardrobe:
      "Model wears the brand's jacket or outerwear piece as the hero garment — fully visible, layered over a neutral base, collar and silhouette readable.",
    safeguards: ["Do not hide the jacket under other layers or fold it out of frame."],
    mustWearProduct: true,
  },
  "fashion/hoodies": {
    productNoun: "hoodie",
    wardrobe:
      "Model wears the brand's hoodie as the hero garment — drawstring and hood visible, silhouette readable.",
    safeguards: ["Do not substitute a t-shirt, sweater or unrelated outerwear for the hoodie."],
    mustWearProduct: true,
  },
  "fashion/jeans": {
    productNoun: "jeans / denim",
    wardrobe:
      "Model wears the brand's jeans as the hero garment — full leg line visible, wash and cut readable, paired with a neutral top so the denim leads.",
    safeguards: ["Do not crop out the legs or hide the jeans under a long coat."],
    mustWearProduct: true,
  },
  "fashion/streetwear": {
    productNoun: "streetwear piece",
    wardrobe:
      "Model wears the brand's streetwear piece as the hero garment — fit and silhouette readable, styled with intent.",
    mustWearProduct: true,
    safeguards: [],
  },

  // ── Footwear ───────────────────────────────────────────────────────────
  "footwear/sneakers": {
    productNoun: "sneakers",
    wardrobe:
      "Model wears the brand's sneakers as the hero piece — both shoes visible, laces and silhouette readable, outfit complements but never competes.",
    safeguards: ["Do not crop the feet out of frame; do not substitute boots, heels or sandals."],
    mustWearProduct: true,
  },
  "footwear/boots": {
    productNoun: "boots",
    wardrobe:
      "Model wears the brand's boots as the hero piece — full upper visible, outfit cropped or styled so the boots lead the frame.",
    safeguards: ["Do not crop the feet out of frame; do not substitute sneakers or dress shoes."],
    mustWearProduct: true,
  },
  "footwear/high-heels": {
    productNoun: "heels",
    wardrobe:
      "Model wears the brand's heels as the hero piece — heel shape and silhouette fully visible, outfit styled so the shoes lead.",
    safeguards: ["Do not crop the feet out of frame; do not substitute flats, boots or sneakers."],
    mustWearProduct: true,
  },
  "footwear/shoes": {
    productNoun: "shoes",
    wardrobe:
      "Model wears the brand's dress shoes (loafers, oxfords or similar) as the hero piece — full upper visible, outfit styled to complement.",
    safeguards: ["Do not crop the feet out of frame; do not substitute sneakers or boots."],
    mustWearProduct: true,
  },

  // ── Bags & Accessories ─────────────────────────────────────────────────
  "bags-accessories/backpacks": {
    productNoun: "backpack",
    wardrobe:
      "Model wears or holds the brand's backpack as the hero accessory — straps, silhouette and front panel readable.",
    safeguards: ["Do not replace the backpack with a tote, duffel or sling."],
    mustWearProduct: true,
  },
  "bags-accessories/belts": {
    productNoun: "belt",
    wardrobe:
      "Model wears the brand's belt as the hero accessory — buckle and strap clearly framed at the waist.",
    safeguards: [],
    mustWearProduct: true,
  },
  "bags-accessories/scarves": {
    productNoun: "scarf",
    wardrobe:
      "Model wears the brand's scarf as the hero accessory — draped or tied so the print, weave and silhouette are readable.",
    safeguards: [],
    mustWearProduct: true,
  },

  // ── Eyewear / Hats / Watches / Jewelry — products are inherently the hero,
  // but we still pin the directive so models don't end up bare-faced/wristed.
  "hats-caps-beanies/caps": {
    productNoun: "cap",
    wardrobe: "Model wears the brand's cap as the hero piece — brim and front panel readable.",
    safeguards: [],
    mustWearProduct: true,
  },
  "hats-caps-beanies/hats": {
    productNoun: "hat",
    wardrobe: "Model wears the brand's hat as the hero piece — brim, crown and silhouette readable.",
    safeguards: [],
    mustWearProduct: true,
  },
  "hats-caps-beanies/beanies": {
    productNoun: "beanie",
    wardrobe: "Model wears the brand's beanie as the hero piece — fit and weave readable.",
    safeguards: [],
    mustWearProduct: true,
  },
};

export function resolveSubfamilyGuide(
  module: BrandSceneModule | string | undefined,
  subFamily: string | undefined,
): SubfamilyGuide | null {
  if (!module || !subFamily) return null;
  return SUBFAMILY_GUIDES[`${module}/${subFamily}` as Key] ?? null;
}
