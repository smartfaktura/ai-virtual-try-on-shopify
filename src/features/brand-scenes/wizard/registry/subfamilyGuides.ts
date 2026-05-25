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
      "Model wears a well-fitted brand lingerie set as the hero garment — matching bralette + briefs, or a slip / bodysuit / corset — fully visible, on-body, fabric and lace texture readable. Pose framed so the lingerie leads the image; supporting layers (silk robe, sheer kimono) may drape but never cover the hero piece. Render skin tone naturally with realistic pores and shadow; avoid AI-glossy or over-airbrushed skin.",
    safeguards: [
      "Do not render pajamas, oversized t-shirts, bathrobes, towels, loungewear, sweats, hoodies or bath wraps in place of the lingerie.",
      "Do not pixelate, blur, censor or pixel-mosaic the lingerie; render true-to-fabric.",
      "Do not change the hero garment into swimwear or activewear.",
      "Avoid clichéd wet-look skin or oily over-glossy rendering unless explicitly requested.",
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

  // ── Jewelry — on-body placement is critical so the piece isn't floating.
  "jewelry/jewellery-rings": {
    productNoun: "ring",
    wardrobe:
      "The brand's ring is worn on the model's ring finger (left hand by default), fully on the finger, band and any stone or setting clearly readable; finger relaxed and lit so the metal renders true to material.",
    safeguards: [
      "Do not float, hover or detach the ring from the finger.",
      "Do not show the ring held in the other hand instead of worn.",
      "Do not crop out the wearing hand or hide it behind other objects.",
      "Do not show bare fingers where the ring should be.",
    ],
    mustWearProduct: true,
  },
  "jewelry/jewellery-necklaces": {
    productNoun: "necklace",
    wardrobe:
      "The brand's necklace is worn at the base of the neck, clasp behind, pendant centered on the décolletage; neckline kept clean so the chain and pendant read.",
    safeguards: [
      "Do not show the necklace draped over a hand, table or surface instead of worn.",
      "Do not hide the pendant with hair, collar or shadow.",
      "Do not omit the chain or leave the neck bare.",
    ],
    mustWearProduct: true,
  },
  "jewelry/jewellery-earrings": {
    productNoun: "earrings",
    wardrobe:
      "The brand's earrings are worn on the earlobes as a matched pair; hair styled or tucked so at least one ear is sharply visible — three-quarter or profile angle preferred so the earring reads cleanly.",
    safeguards: [
      "Do not leave the ears bare.",
      "Do not show only one earring unless a deliberate profile shot.",
      "Do not blur or hide the worn ear with hair or accessories.",
    ],
    mustWearProduct: true,
  },
  "jewelry/jewellery-bracelets": {
    productNoun: "bracelet",
    wardrobe:
      "The brand's bracelet is wrapped around the model's wrist with the clasp aligned; wrist posed so the full circumference of the bracelet reads.",
    safeguards: [
      "Do not float the bracelet beside the wrist.",
      "Do not crop the wrist out of frame.",
      "Do not show empty wrists where the bracelet should be worn.",
    ],
    mustWearProduct: true,
  },

  // ── Watches — family-level fallback (no required sub_family).
  "watches/*": {
    productNoun: "watch",
    wardrobe:
      "The brand's watch is worn on the model's wrist with the dial facing the camera; strap, case and lugs fully readable.",
    safeguards: [
      "Do not show empty wrists.",
      "Do not hide the dial behind cuffs or shadows.",
      "Do not invent a different watch or alter the dial layout.",
    ],
    mustWearProduct: true,
  },
};

export function resolveSubfamilyGuide(
  module: BrandSceneModule | string | undefined,
  subFamily: string | undefined,
): SubfamilyGuide | null {
  if (!module) return null;
  if (subFamily) {
    const exact = SUBFAMILY_GUIDES[`${module}/${subFamily}` as Key];
    if (exact) return exact;
  }
  // Family-level fallback (e.g. watches/*).
  return SUBFAMILY_GUIDES[`${module}/*` as Key] ?? null;
}
