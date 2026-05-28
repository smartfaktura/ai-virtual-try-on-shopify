/**
 * Shared constants for Product Images flow.
 *
 * Kept in a dedicated module so React Fast Refresh works for the step
 * components — exporting non-component values from a component file forces
 * Vite to do a full page reload on every edit.
 */

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square 1:1' },
  { value: '4:5', label: 'Portrait 4:5' },
  { value: '3:4', label: 'Tall 3:4' },
  { value: '9:16', label: 'Story 9:16' },
  { value: '16:9', label: 'Wide 16:9' },
];

export const IMAGE_COUNT_OPTIONS = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  // ── Specific categories FIRST (matched before generic parents) ──
  'jewellery-necklaces': ['necklace', 'pendant', 'chain necklace', 'choker', 'lariat'],
  'jewellery-earrings': ['earring', 'stud', 'hoop', 'drop earring', 'huggie', 'ear cuff'],
  'jewellery-bracelets': ['bracelet', 'bangle', 'cuff bracelet', 'charm bracelet', 'tennis bracelet', 'wristband'],
  'jewellery-rings': ['ring', 'signet', 'band ring', 'cocktail ring', 'engagement ring', 'wedding band'],
  'watches': ['watch', 'timepiece', 'chronograph', 'wristwatch', 'smartwatch'],
  'eyewear': ['sunglasses', 'glasses', 'eyewear', 'optical', 'aviator', 'wayfarer', 'spectacles'],
  'backpacks': ['backpack', 'rucksack', 'daypack', 'school bag', 'laptop bag'],
  'wallets-cardholders': ['wallet', 'cardholder', 'card holder', 'card case', 'money clip', 'billfold'],
  'phone-cases': ['phone case', 'iphone case', 'airpods case', 'samsung case', 'silicone case', 'clear case', 'magsafe case', 'magsafe', 'pixel case', 'galaxy case'],
  'belts': ['belt', 'waist belt', 'leather belt', 'buckle belt', 'chain belt'],
  'scarves': ['scarf', 'shawl', 'wrap', 'bandana', 'neckerchief', 'stole'],
  'sneakers': ['sneaker', 'trainer', 'air max', 'nike dunk', 'jordan', 'running shoe', 'tennis shoe', 'skate shoe', 'new balance'],
  'boots': ['boot', 'ankle boot', 'chelsea boot', 'combat boot', 'hiking boot', 'cowboy boot', 'rain boot', 'lace-up boot'],
  'high-heels': ['high heel', 'stiletto', 'pump', 'platform heel', 'kitten heel', 'wedge heel', 'strappy heel', 'mule heel'],
  'wedding-dress': ['wedding dress', 'bridal gown', 'bridal dress', 'wedding gown', 'bride gown', 'bridalwear', 'bridesmaid dress'],
  'dresses': ['dress', 'gown', 'maxi dress', 'midi dress', 'mini dress', 'sundress', 'cocktail dress', 'evening dress', 'wrap dress'],
  'hoodies': ['hoodie', 'hooded sweatshirt', 'zip-up hoodie', 'pullover hoodie', 'oversized hoodie'],
  'jeans': ['jeans', 'denim', 'skinny jeans', 'wide-leg jeans', 'straight-leg jeans', 'mom jeans', 'boyfriend jeans', 'distressed jeans'],
  'jackets': ['jacket', 'blazer', 'bomber', 'puffer', 'windbreaker', 'denim jacket', 'leather jacket', 'parka', 'trench coat', 'overcoat'],
  'activewear': ['activewear', 'sportswear', 'yoga', 'gym wear', 'athletic', 'workout', 'running', 'legging', 'sports bra', 'alo yoga', 'lululemon', 'fitness'],
  'swimwear': ['swimwear', 'bikini', 'swimsuit', 'one-piece', 'swim trunks', 'board shorts', 'bathing suit', 'rash guard'],
  'lingerie': ['lingerie', 'bra', 'underwear', 'bodysuit', 'corset', 'negligee', 'camisole', 'teddy', 'intimates'],
  'kidswear': ['kids', 'children', 'baby', 'toddler', 'infant', 'kidswear', 'boys', 'girls', 'newborn', 'junior'],
  'makeup-lipsticks': ['lipstick', 'mascara', 'foundation', 'concealer', 'blush', 'eyeshadow', 'makeup', 'cosmetic', 'lip gloss', 'lip liner', 'bronzer', 'highlighter', 'primer', 'eyeliner', 'contour', 'setting powder', 'setting spray', 'rouge', 'cheek'],
  'beauty-skincare': ['serum', 'moisturizer', 'cleanser', 'toner', 'skincare', 'cream', 'sunscreen', 'essence', 'treatment', 'mask', 'shampoo', 'conditioner', 'body wash', 'face wash', 'lotion', 'exfoliant', 'retinol', 'hyaluronic'],
  // ── Generic parent categories (fallback) ──
  'fragrance': ['perfume', 'cologne', 'fragrance', 'eau de', 'scent', 'parfum'],
  'bags-accessories': ['bag', 'handbag', 'purse', 'clutch', 'tote', 'briefcase', 'satchel', 'crossbody', 'messenger', 'duffel', 'case', 'pouch'],
  caps: ['cap', 'baseball cap', 'snapback', 'trucker cap', 'visor', 'dad hat'],
  hats: ['hat', 'fedora', 'beret', 'panama hat', 'sun hat', 'wide brim hat', 'bucket hat'],
  beanies: ['beanie', 'knit cap', 'skull cap', 'winter hat', 'toque', 'watch cap'],
  'shoes': ['shoe', 'sandal', 'loafer', 'slipper', 'footwear', 'mule', 'clog', 'oxford', 'derby', 'flat'],
  'garments': ['shirt', 'pants', 'sweater', 'coat', 'skirt', 'blouse', 'top', 'shorts', 'clothing', 'apparel', 'garment', 'jersey', 'tank', 'polo', 'uniform', 'tracksuit', 'jogger', 'vest', 'cardigan', 'suit', 'romper', 'jumpsuit'],
  'furniture': ['sofa', 'couch', 'sectional', 'loveseat', 'armchair', 'recliner', 'dining chair', 'office chair', 'accent chair', 'lounge chair', 'rocking chair', 'folding chair', 'bar stool', 'counter stool', 'stool', 'bench', 'ottoman', 'pouf', 'bean bag', 'dining table', 'coffee table', 'side table', 'end table', 'console table', 'accent table', 'nightstand', 'bedside table', 'desk', 'standing desk', 'writing desk', 'vanity', 'bed frame', 'headboard', 'bunk bed', 'daybed', 'futon', 'mattress', 'crib', 'bookshelf', 'bookcase', 'floating shelf', 'wall shelf', 'shelving unit', 'cabinet', 'filing cabinet', 'display cabinet', 'hutch', 'sideboard', 'buffet', 'credenza', 'dresser', 'chest of drawers', 'wardrobe', 'armoire', 'closet organizer', 'tv stand', 'media console', 'entertainment center', 'shoe rack', 'coat rack', 'wine rack', 'pantry', 'kitchen island', 'bar cart', 'furniture'],
  'home-decor': ['candle', 'vase', 'pillow', 'blanket', 'lamp', 'decor', 'home', 'interior', 'rug', 'curtain', 'mirror', 'frame', 'planter', 'ceramic', 'tray', 'coaster', 'diffuser', 'figurine', 'ornament', 'sculpture', 'cushion', 'throw', 'tapestry', 'wall art', 'bookend'],
  'tech-devices': ['phone', 'laptop', 'headphone', 'earbuds', 'speaker', 'charger', 'tablet', 'keyboard', 'mouse', 'camera', 'tech', 'gadget', 'electronic', 'monitor', 'console', 'controller', 'drone', 'wearable'],
  'food': ['food', 'chocolate', 'snack', 'cereal', 'granola', 'sauce', 'honey', 'jam', 'candy', 'chips', 'cookie', 'protein bar', 'organic', 'artisan', 'olive oil'],
  'beverages': ['coffee', 'tea', 'juice', 'beverage', 'soda', 'wine', 'beer', 'water', 'kombucha', 'smoothie', 'energy drink', 'drink', 'lemonade', 'milk'],
  'supplements-wellness': ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'probiotic', 'omega', 'wellness', 'greens', 'superfood', 'gummy'],
  'other': [],
};
