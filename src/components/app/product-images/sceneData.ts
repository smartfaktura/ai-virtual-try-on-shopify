import type { ProductImageScene, CategoryCollection } from './types';

export const GLOBAL_SCENES: ProductImageScene[] = [
  {
    id: 'clean-packshot',
    title: 'White Background',
    description: 'Clean cut-out on pure white for listings.',
    triggerBlocks: ['background', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'soft-neutral-studio',
    title: 'Studio Soft Light',
    description: 'Soft depth and controlled studio lighting.',
    triggerBlocks: ['background'],
    isGlobal: true,
  },
  {
    id: 'marketplace-ready',
    title: 'Marketplace Listing',
    description: 'Optimized for Amazon, Etsy, Shopify storefronts.',
    triggerBlocks: ['background'],
    isGlobal: true,
  },
  {
    id: 'editorial-product',
    title: 'Editorial Hero',
    description: 'Elevated hero shot for campaigns and launches.',
    triggerBlocks: ['visualDirection'],
    isGlobal: true,
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Context',
    description: 'Product in a real-world styled environment.',
    triggerBlocks: ['visualDirection', 'sceneEnvironment', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'in-hand',
    title: 'Held in Hand',
    description: 'Product held in hand showing scale and use.',
    triggerBlocks: ['personDetails', 'actionDetails', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'on-body-wearing',
    title: 'On Body / Wearing',
    description: 'Product worn or held on the body for scale and context.',
    triggerBlocks: ['personDetails', 'actionDetails'],
    isGlobal: true,
  },
  {
    id: 'detail-coverage',
    title: 'Front Angle',
    description: 'Clean front-facing product angle.',
    triggerBlocks: ['detailFocus'],
    isGlobal: true,
  },
  {
    id: 'product-closeup',
    title: 'Product Close-Up',
    description: 'Tight crop highlighting product details and finish.',
    triggerBlocks: ['detailFocus'],
    isGlobal: true,
  },
  {
    id: 'material-closeup',
    title: 'Material Close-Up',
    description: 'Show fabric, leather, metal, or material quality up close.',
    triggerBlocks: ['detailFocus'],
    isGlobal: true,
  },
  {
    id: 'packaging',
    title: 'With Packaging',
    description: 'Product with its box or packaging.',
    triggerBlocks: ['packagingDetails'],
    isGlobal: true,
  },
  {
    id: 'flat-lay',
    title: 'Flat Lay Arrangement',
    description: 'Overhead styled arrangement with props.',
    triggerBlocks: ['sceneEnvironment'],
    isGlobal: true,
  },
  {
    id: 'shadow-light',
    title: 'Dramatic Lighting',
    description: 'Bold shadow and light for premium feel.',
    triggerBlocks: ['visualDirection'],
    isGlobal: true,
  },
  {
    id: 'back-angle',
    title: 'Back View',
    description: 'Rear angle of the product.',
    triggerBlocks: ['angleSelection'],
    isGlobal: true,
  },
  {
    id: 'side-profile',
    title: 'Side View',
    description: 'Side angle showing depth and silhouette.',
    triggerBlocks: ['angleSelection'],
    isGlobal: true,
  },
  {
    id: 'top-down',
    title: 'Top-Down View',
    description: 'Direct overhead for catalogs and listings.',
    triggerBlocks: ['angleSelection'],
    isGlobal: true,
  },
  {
    id: 'macro-texture',
    title: 'Macro Detail',
    description: 'Extreme close-up of textures and micro-details.',
    triggerBlocks: ['detailFocus'],
    isGlobal: true,
  },
  {
    id: 'wide-environment',
    title: 'Wide Environment',
    description: 'Pulled-back shot with broader context.',
    triggerBlocks: ['sceneEnvironment', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'ghost-mannequin',
    title: 'Ghost / Invisible',
    description: 'Floating product effect, no mannequin visible.',
    triggerBlocks: ['background'],
    isGlobal: true,
  },
];

export const CATEGORY_COLLECTIONS: CategoryCollection[] = [
  {
    id: 'beauty-skincare',
    title: 'Beauty & Skincare',
    scenes: [
      { id: 'beauty-shelf', title: 'Shelf Placement', description: 'Product on a styled shelf or bathroom setting.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty-vanity', title: 'Bathroom / Vanity', description: 'Vanity placement with bathroom context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty-texture', title: 'Texture / Formula Focus', description: 'Close-up showing texture, formula, or ingredients.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty-inhand', title: 'In-Hand Skincare', description: 'Hand holding or applying the product.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty-editorial', title: 'Clean Beauty Editorial', description: 'Premium editorial shot for beauty brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'beauty-skincare' },
    ],
  },
  {
    id: 'makeup-lipsticks',
    title: 'Makeup & Lipsticks',
    scenes: [
      { id: 'makeup-lips', title: 'Product Near Lips', description: 'Product shown close to lips for makeup context.', triggerBlocks: ['personDetails', 'detailFocus'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup-portrait', title: 'Portrait with Product', description: 'Model portrait holding or wearing makeup product.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup-hand', title: 'Lipstick in Hand', description: 'Hand holding lipstick or makeup product.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup-tabletop', title: 'Makeup Tabletop', description: 'Makeup products arranged on a styled surface.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup-detail', title: 'Cosmetic Detail Shot', description: 'Close-up of cosmetic product details.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
    ],
  },
  {
    id: 'fragrance',
    title: 'Fragrance',
    scenes: [
      { id: 'frag-detail', title: 'Bottle + Cap Detail', description: 'Close-up of fragrance bottle and cap details.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'frag-packaging', title: 'Product with Packaging', description: 'Fragrance bottle with its packaging.', triggerBlocks: ['packagingDetails'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'frag-shelf', title: 'Premium Shelf Scene', description: 'Fragrance on a luxury shelf or display.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'frag-inhand', title: 'In-Hand Fragrance', description: 'Hand holding fragrance bottle elegantly.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'frag-editorial', title: 'Fragrance Editorial', description: 'Editorial composition for fragrance brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'fragrance' },
    ],
  },
  {
    id: 'bags-accessories',
    title: 'Bags & Structured Accessories',
    scenes: [
      { id: 'bags-surface', title: 'Styled Surface Shot', description: 'Bag on a styled surface with context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bags-carry', title: 'Carry / Hold Context', description: 'Model carrying or holding the bag.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bags-detail', title: 'Bag Detail Shot', description: 'Close-up of hardware, stitching, or material.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bags-interior', title: 'Open / Interior View', description: 'Open bag showing interior compartments.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bags-editorial', title: 'Premium Accessory Editorial', description: 'Elevated editorial shot for accessory brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'bags-accessories' },
    ],
  },
  {
    id: 'hats-small',
    title: 'Hats & Small Accessories',
    scenes: [
      { id: 'hats-surface', title: 'Surface Display', description: 'Accessory displayed on a clean surface.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'hats-styled', title: 'Styled Accessory Shot', description: 'Accessory styled with complementary props.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'hats-material', title: 'Material / Stitch Detail', description: 'Close-up of materials and craftsmanship.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'hats-closeup', title: 'Product Close-Up', description: 'Detailed close-up shot of the accessory.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'hats-editorial', title: 'Fashion Accessory Editorial', description: 'Editorial composition for fashion accessories.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'hats-small' },
    ],
  },
  {
    id: 'shoes',
    title: 'Shoes',
    scenes: [
      { id: 'shoes-pair', title: 'Pair Display', description: 'Both shoes displayed together.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes-side', title: 'Side Profile', description: 'Side view showing shoe silhouette.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes-sole', title: 'Sole Detail', description: 'Bottom view showing sole pattern.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes-lifestyle', title: 'Lifestyle Footwear', description: 'Shoes in a lifestyle context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes-editorial', title: 'Shoe Editorial Shot', description: 'Editorial composition for footwear brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'shoes' },
    ],
  },
  {
    id: 'garments',
    title: 'Clothing & Apparel',
    scenes: [
      { id: 'garment-folded', title: 'Folded Display', description: 'Garment neatly folded for product shot.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'garment-hanging', title: 'Hanging Display', description: 'Garment on hanger showing full silhouette.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'garment-fabric', title: 'Fabric Detail', description: 'Close-up of fabric texture and quality.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'garment-flatlay', title: 'Garment Flat Lay', description: 'Flat lay arrangement with styling elements.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'garment-editorial', title: 'Editorial Garment Shot', description: 'Premium editorial for garment brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'garments' },
    ],
  },
  {
    id: 'home-decor',
    title: 'Home Decor / Furniture',
    scenes: [
      { id: 'home-interior', title: 'Interior Placement', description: 'Product placed in a room interior.', triggerBlocks: ['sceneEnvironment', 'productSize'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home-surface', title: 'Styled Surface', description: 'Product on a styled surface with decor context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home-material', title: 'Material Detail', description: 'Close-up of material, finish, or craftsmanship.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home-wide', title: 'Wide Room Crop', description: 'Wide composition showing product in room context.', triggerBlocks: ['sceneEnvironment', 'productSize'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home-editorial', title: 'Decor Editorial', description: 'Editorial composition for home brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'home-decor' },
    ],
  },
  {
    id: 'tech-devices',
    title: 'Tech / Devices',
    scenes: [
      { id: 'tech-desk', title: 'Desk Setup', description: 'Product in a clean desk or workspace setup.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech-use', title: 'Use Interaction Shot', description: 'Hands interacting with the device.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech-detail', title: 'Detail Close-Up', description: 'Close-up of ports, buttons, or features.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech-packshot', title: 'Clean Tech Packshot', description: 'Clean product shot optimized for tech products.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech-editorial', title: 'Tech Editorial', description: 'Editorial composition for tech brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'tech-devices' },
    ],
  },
  {
    id: 'food-beverage',
    title: 'Food & Beverage',
    scenes: [
      { id: 'food-table', title: 'Table Setting', description: 'Product in a styled table or dining context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food-ingredients', title: 'Ingredients Spread', description: 'Product with raw ingredients spread around it.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food-pour', title: 'Pour / Serve Action', description: 'Product being poured, served, or prepared.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food-closeup', title: 'Food Detail Shot', description: 'Close-up showing texture, freshness, or quality.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food-editorial', title: 'Food Editorial', description: 'Premium editorial for food/beverage brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'food-beverage' },
    ],
  },
  {
    id: 'supplements-wellness',
    title: 'Supplements & Wellness',
    scenes: [
      { id: 'supp-kitchen', title: 'Kitchen Counter', description: 'Supplement on a clean kitchen counter.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'supp-inhand', title: 'In-Hand Supplement', description: 'Hand holding supplement bottle or capsule.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'supp-routine', title: 'Morning Routine', description: 'Product as part of a wellness routine.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'supp-detail', title: 'Label / Ingredients', description: 'Close-up of label and ingredient details.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'supp-editorial', title: 'Wellness Editorial', description: 'Editorial composition for wellness brand.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'supplements-wellness' },
    ],
  },
];

export const ALL_SCENES: ProductImageScene[] = [
  ...GLOBAL_SCENES,
  ...CATEGORY_COLLECTIONS.flatMap(c => c.scenes),
];

export function getSceneById(id: string): ProductImageScene | undefined {
  return ALL_SCENES.find(s => s.id === id);
}
