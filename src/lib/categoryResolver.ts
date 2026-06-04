/**
 * Client-side mirror of supabase/functions/_shared/category-mapper.ts.
 * Resolves free-form product text into a canonical category id from
 * src/lib/productCategories.ts. Used to render proper category labels
 * for legacy products that have no analysis_json.userCategory set.
 *
 * Keep patterns in lockstep with the server module.
 */

const TITLE_CATEGORY_PATTERNS: [RegExp, string][] = [
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
  [/activewear|sportswear|athleisure|athletic|gym wear|workout|\btraining\b|performance wear|compression (?:wear|short|legging|tight)|legging|sports bra|rash guard|\bjersey\b|tracksuit|track suit|\byoga\b|pilates|\brunning\b|jogger|marathon|\btennis\b|padel|pickleball|squash|badminton|\bgolf\b|cycling|cyclist|bike (?:short|jersey)|ski(?:ing)?\b|snowboard|base layer|crossfit/i, "activewear"],
  [/wedding dress|bridal gown|bridal dress|wedding gown|bridesmaid dress|bridalwear|\bbridal\b/i, "wedding-dress"],
  [/\btrouser|\btrousers\b|\bchino|\bchinos\b|\bslack|\bslacks\b|\bdress\s+pants?\b|\bcargo\s+pants?\b|\bjogger|\bsweatpants\b|\btrack\s+pants?\b|\bpants\b/i, "trousers"],
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
  [/phone case|iphone case|airpods case|samsung case|silicone case|clear case|magsafe case|magsafe/i, "phone-cases"],
  [/\bsocks?\b|crew sock|ankle sock|no[- ]?show sock|knee[- ]?high sock|tube sock|athletic sock|dress sock|wool sock|compression sock/i, "socks"],
  [/\bshoe\b|\bshoes\b|sandal|loafer|slipper|mule/i, "shoes"],
  [/\bshirt\b|coat|sweater|blouse|cardigan|vest/i, "garments"],
  [/armchair|sofa|couch|sectional|recliner|dining chair|office chair|accent chair|lounge chair|coffee table|dining table|desk|bookshelf|dresser|wardrobe|bed frame|nightstand|ottoman|cabinet|sideboard|credenza|tv stand|bar stool|bench|futon|mattress|furniture/i, "furniture"],
  [/candle|vase|pillow|lamp|decor|cushion|throw|planter|frame/i, "home-decor"],
  [/phone|laptop|tablet|headphone|speaker|camera|earbuds|charger|keyboard|mouse/i, "tech-devices"],
  [/protein|vitamin|supplement|probiotic|collagen|creatine|pre-?workout/i, "supplements-wellness"],
  [/coffee|tea|juice|soda|wine|beer|kombucha|smoothie|energy drink|lemonade|milk/i, "beverages"],
  [/chocolate|cereal|granola|honey|jam|sauce|snack|cookie|candy|chips|olive oil|food/i, "food"],
];

export function mapTextToCategory(text: string | null | undefined): string | null {
  if (!text) return null;
  const haystack = text.toLowerCase();
  for (const [pattern, category] of TITLE_CATEGORY_PATTERNS) {
    if (pattern.test(haystack)) return category;
  }
  return null;
}
