// Shared canonical-category resolver used by analyze-product-image
// and analyze-product-category. Pure functions, no Deno-specific imports.

/** All valid category_collection IDs. Must match CATEGORY_LABELS in src/lib/productCategories.ts. */
export const VALID_CATEGORIES = new Set<string>([
  "fragrance", "beauty-skincare", "makeup-lipsticks", "bags-accessories", "backpacks",
  "wallets-cardholders", "belts", "scarves", "caps", "hats", "beanies", "shoes", "sneakers", "boots",
  "high-heels", "garments", "dresses", "wedding-dress", "skirts", "streetwear", "hoodies", "jeans",
  "trousers", "jackets", "activewear", "swimwear", "lingerie", "kidswear", "jewellery-necklaces",
  "jewellery-earrings", "jewellery-bracelets", "jewellery-rings", "watches", "eyewear",
  "home-decor", "furniture", "tech-devices", "phone-cases", "food", "beverages", "supplements-wellness",
]);

/** Title-based category fallback when AI returns "other" or invalid. Order matters. */
export const TITLE_CATEGORY_PATTERNS: [RegExp, string][] = [
  [/necklace|pendant|choker|lariat|chain necklace/i, "jewellery-necklaces"],
  [/earring|stud|hoop|drop earring|huggie|ear cuff/i, "jewellery-earrings"],
  [/bracelet|bangle|cuff bracelet|charm bracelet|tennis bracelet/i, "jewellery-bracelets"],
  [/\bring\b|signet|band ring|cocktail ring|engagement ring|wedding band/i, "jewellery-rings"],
  [/\bwatch\b|timepiece|chronograph|wristwatch/i, "watches"],
  [/sunglasses|glasses|eyewear|optical|aviator|spectacles/i, "eyewear"],
  [/backpack|rucksack|daypack/i, "backpacks"],
  [/wallet|cardholder|card holder|card case|money clip|billfold/i, "wallets-cardholders"],
  [/\bbelt\b|waist belt|leather belt|buckle belt/i, "belts"],
  [/scarf|shawl|bandana|neckerchief|stole/i, "scarves"],
  [/sneaker|trainer|air max|nike dunk|jordan|running shoe/i, "sneakers"],
  [/\bboot\b|\bboots\b|ankle boot|chelsea boot|combat boot|hiking boot|cowboy boot/i, "boots"],
  [/high heel|stiletto|pump|platform heel|kitten heel|wedge heel/i, "high-heels"],
  // activewear before dresses/garments
  [/activewear|sportswear|athleisure|athletic|gym wear|workout|\btraining\b|performance wear|compression (?:wear|short|legging|tight)|legging|sports bra|rash guard|\bjersey\b|tracksuit|track suit|\byoga\b|pilates|\brunning\b|jogger|marathon|\btennis\b|padel|pickleball|squash|badminton|\bgolf\b|cycling|cyclist|bike (?:short|jersey)|ski(?:ing)?\b|snowboard|base layer|crossfit/i, "activewear"],
  [/wedding dress|bridal gown|bridal dress|wedding gown|bridesmaid dress|bridalwear|\bbridal\b/i, "wedding-dress"],
  [/\btrouser|\btrousers\b|\bchino|\bchinos\b|\bslack|\bslacks\b|\bdress\s+pants?\b|\bcargo\s+pants?\b|\bjogger|\bsweatpants\b|\btrack\s+pants?\b/i, "trousers"],
  [/\bdress(?!\s+(pants?|shirts?|shorts?|shoes?|socks?|code))\b|\bdresses\b|gown|maxi dress|midi dress|sundress|cocktail dress/i, "dresses"],
  [/\bskirt\b|\bskirts\b|mini skirt|midi skirt|maxi skirt|pleated skirt/i, "skirts"],
  [/hoodie|hooded sweatshirt/i, "hoodies"],
  [/\bjeans\b|denim|skinny jeans|wide-leg jeans|mom jeans/i, "jeans"],
  [/jacket|blazer|bomber|puffer|windbreaker|parka|trench coat/i, "jackets"],
  [/swimwear|bikini|swimsuit|swim trunks|bathing suit/i, "swimwear"],
  [/lingerie|\bbra\b|underwear|corset|negligee|intimates/i, "lingerie"],
  [/\bkids\b|children|baby|toddler|infant|kidswear/i, "kidswear"],
  [/perfume|fragrance|eau de|cologne|parfum|body mist/i, "fragrance"],
  [/lipstick|mascara|foundation|concealer|blush|eyeshadow|eyeliner|lip gloss|bronzer|primer|highlighter|contour|rouge/i, "makeup-lipsticks"],
  [/serum|moisturizer|cream|cleanser|toner|sunscreen|lotion|face wash|body wash|shampoo|conditioner|exfoliant|retinol/i, "beauty-skincare"],
  [/\bbag\b|handbag|clutch|purse|tote|satchel/i, "bags-accessories"],
  [/beanie|knit cap|toque|skull cap|watch cap/i, "beanies"],
  [/\bcap\b|baseball cap|snapback|trucker cap|visor|dad hat/i, "caps"],
  [/\bhat\b|fedora|panama|bucket hat|wide brim|sun hat|cowboy hat|boater|beret|headband/i, "hats"],
  [/\bshoe\b|\bshoes\b|sandal|loafer|slipper|mule/i, "shoes"],
  [/\bshirt\b|pants|skirt|coat|sweater|blouse|cardigan|vest/i, "garments"],
  [/armchair|sofa|couch|sectional|recliner|dining chair|office chair|accent chair|lounge chair|coffee table|dining table|desk|bookshelf|dresser|wardrobe|bed frame|nightstand|ottoman|cabinet|sideboard|credenza|tv stand|bar stool|bench|futon|mattress|furniture/i, "furniture"],
  [/candle|vase|pillow|lamp|decor|cushion|throw|planter|frame/i, "home-decor"],
  [/phone case|iphone case|airpods case|samsung case|silicone case|clear case|magsafe case|magsafe/i, "phone-cases"],
  [/phone|laptop|tablet|headphone|speaker|camera|earbuds|charger|keyboard|mouse/i, "tech-devices"],
  [/protein|vitamin|supplement|probiotic|collagen|creatine|pre-?workout/i, "supplements-wellness"],
  [/coffee|tea|juice|soda|wine|beer|kombucha|smoothie|energy drink|lemonade|milk/i, "beverages"],
  [/chocolate|cereal|granola|honey|jam|sauce|snack|cookie|candy|chips|olive oil|food/i, "food"],
];

/** Patterns that strongly suggest the photo is a room/space, not a product. */
const SPACE_PATTERN =
  /\b(room|bedroom|kitchen|living\s*room|dining\s*room|bathroom|office|facade|fa[cç]ade|interior|exterior|space|studio\s*apartment|hallway|lobby|patio|terrace|balcony|garden|shed|garage|warehouse|storefront|building)\b/i;

export function isSpaceLike(text: string | null | undefined): boolean {
  if (!text) return false;
  return SPACE_PATTERN.test(text);
}

/** Validate / coerce a string into a known canonical category id, or null. */
export function coerceCategory(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const id = input.trim().toLowerCase();
  if (!id || id === "other") return null;
  if (VALID_CATEGORIES.has(id)) return id;
  // tolerate "hats-small" legacy alias
  if (id === "hats-small") return "hats";
  return null;
}

/** Run regex fallback over free text; returns canonical id or null. */
export function mapTitleToCategory(text: string | null | undefined): string | null {
  if (!text) return null;
  const haystack = text.toLowerCase();
  for (const [pattern, category] of TITLE_CATEGORY_PATTERNS) {
    if (pattern.test(haystack)) return category;
  }
  return null;
}

/**
 * Three-layer resolver:
 *   1. AI returned a valid enum id  → use it
 *   2. Regex map over title+productType → use match
 *   3. null (safe default)
 * Returns null when the text looks like a room/space.
 */
export function resolveCanonicalCategory(
  aiCategory: unknown,
  title?: string | null,
  productType?: string | null,
): string | null {
  const combined = `${title ?? ""} ${productType ?? ""}`.trim();
  if (isSpaceLike(combined)) return null;
  const fromAi = coerceCategory(aiCategory);
  if (fromAi) return fromAi;
  return mapTitleToCategory(combined);
}
