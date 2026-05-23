/**
 * Brand Scenes — Outfit-direction quiz constants.
 *
 * Generic, family-agnostic chips for the new Styling tab quiz.
 * Each slot supports a free-form "custom" string fallback.
 */

export const OUTFIT_VIBES = [
  { value: "quiet_luxury", label: "Quiet luxury", directive: "quiet-luxury aesthetic" },
  { value: "streetwear", label: "Streetwear", directive: "modern streetwear" },
  { value: "editorial", label: "Editorial", directive: "editorial fashion styling" },
  { value: "athleisure", label: "Athleisure", directive: "athleisure performance wear" },
  { value: "workwear", label: "Workwear", directive: "utility workwear" },
  { value: "beachwear", label: "Beachwear", directive: "relaxed beachwear" },
  { value: "minimal", label: "Minimal", directive: "minimal modern basics" },
  { value: "vintage", label: "Vintage", directive: "vintage-inspired styling" },
] as const;
export type OutfitVibe = (typeof OUTFIT_VIBES)[number]["value"];

export const OUTFIT_TOPS = [
  { value: "tshirt", label: "T-shirt", directive: "plain t-shirt" },
  { value: "knit", label: "Knit", directive: "fine knit sweater" },
  { value: "blazer", label: "Blazer", directive: "tailored blazer" },
  { value: "hoodie", label: "Hoodie", directive: "relaxed hoodie" },
  { value: "shirt", label: "Button shirt", directive: "button-down shirt" },
  { value: "tank", label: "Tank", directive: "fitted tank top" },
  { value: "none", label: "None", directive: "" },
] as const;
export type OutfitTop = (typeof OUTFIT_TOPS)[number]["value"];

export const OUTFIT_BOTTOMS = [
  { value: "jeans", label: "Jeans", directive: "well-cut denim jeans" },
  { value: "trousers", label: "Trousers", directive: "tailored trousers" },
  { value: "shorts", label: "Shorts", directive: "tailored shorts" },
  { value: "skirt", label: "Skirt", directive: "midi skirt" },
  { value: "joggers", label: "Joggers", directive: "tapered joggers" },
  { value: "none", label: "None", directive: "" },
] as const;
export type OutfitBottom = (typeof OUTFIT_BOTTOMS)[number]["value"];

export const OUTFIT_FOOTWEAR = [
  { value: "sneakers", label: "Sneakers", directive: "minimalist sneakers" },
  { value: "boots", label: "Boots", directive: "leather boots" },
  { value: "heels", label: "Heels", directive: "elegant heels" },
  { value: "loafers", label: "Loafers", directive: "leather loafers" },
  { value: "sandals", label: "Sandals", directive: "minimal sandals" },
  { value: "barefoot", label: "Barefoot", directive: "barefoot" },
] as const;
export type OutfitFootwear = (typeof OUTFIT_FOOTWEAR)[number]["value"];

export const OUTFIT_CUSTOM_MAX = 80;

export interface OutfitSlotValue {
  preset?: string;
  custom?: string;
}

export interface OutfitAnswers {
  vibe?: OutfitSlotValue;
  top?: OutfitSlotValue;
  bottom?: OutfitSlotValue;
  footwear?: OutfitSlotValue;
}

/** Resolve a slot to its rendered text (custom wins, then preset directive). */
export function resolveOutfitSlot<T extends { value: string; label: string; directive: string }>(
  options: ReadonlyArray<T>,
  slot?: OutfitSlotValue,
): string | null {
  if (!slot) return null;
  const custom = slot.custom?.trim();
  if (custom) return custom;
  const match = options.find((o) => o.value === slot.preset);
  if (match && match.directive) return match.directive;
  return null;
}

export function hasOutfitAnswer(o?: OutfitAnswers): boolean {
  if (!o) return false;
  return Boolean(
    (o.vibe?.preset || o.vibe?.custom?.trim()) ||
      (o.top?.preset || o.top?.custom?.trim()) ||
      (o.bottom?.preset || o.bottom?.custom?.trim()) ||
      (o.footwear?.preset || o.footwear?.custom?.trim()),
  );
}

export function hasOutfitVibe(o?: OutfitAnswers): boolean {
  return Boolean(o?.vibe?.preset || o?.vibe?.custom?.trim());
}
