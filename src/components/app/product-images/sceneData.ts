import type { ProductImageScene, CategoryCollection } from './types';

export const GLOBAL_SCENES: ProductImageScene[] = [
  {
    id: 'clean-packshot',
    title: 'Clean Packshot',
    description: 'Clean ecommerce-ready product shot for product pages and marketplaces.',
    chips: ['White', 'Neutral', 'Marketplace'],
    triggerBlocks: ['background', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'soft-neutral-studio',
    title: 'Soft Neutral Studio',
    description: 'Premium studio-style product image with soft depth and controlled lighting.',
    chips: ['Studio', 'Soft light', 'Depth'],
    triggerBlocks: ['background'],
    isGlobal: true,
  },
  {
    id: 'marketplace-ready',
    title: 'Marketplace-Ready',
    description: 'Listing-style product image optimized for storefronts and marketplace use.',
    chips: ['Listing', 'Storefront', 'Optimized'],
    triggerBlocks: ['background'],
    isGlobal: true,
  },
  {
    id: 'editorial-product',
    title: 'Editorial Product Scene',
    description: 'Elevated product image for premium storefronts, launches, and campaigns.',
    chips: ['Backdrop', 'Pedestal', 'Color field'],
    triggerBlocks: ['visualDirection'],
    isGlobal: true,
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Scene',
    description: 'Product shown in a realistic commercial setting.',
    chips: ['Environment', 'Context', 'Styled'],
    triggerBlocks: ['visualDirection', 'sceneEnvironment', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'in-hand',
    title: 'In-Hand / Human Support',
    description: 'Product shown in hand or with human support for scale and context.',
    chips: ['Hand hold', 'Portrait + product', 'In action'],
    triggerBlocks: ['personDetails', 'actionDetails', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'detail-coverage',
    title: 'Detail & Coverage',
    description: 'Close-up details, materials, angles, and component-focused shots.',
    chips: ['Close-up', 'Material', 'Angles'],
    triggerBlocks: ['detailFocus', 'angleSelection'],
    isGlobal: true,
  },
  {
    id: 'packaging',
    title: 'Packaging',
    description: 'Show the product, packaging, or both in premium compositions.',
    chips: ['Box', 'Unboxing', 'Premium'],
    triggerBlocks: ['packagingDetails'],
    isGlobal: true,
  },
  {
    id: 'flat-lay',
    title: 'Flat Lay',
    description: 'Product arranged in a flat lay composition with complementary props and styling.',
    chips: ['Overhead', 'Styled', 'Arrangement'],
    triggerBlocks: ['sceneEnvironment'],
    isGlobal: true,
  },
  {
    id: 'group-collection',
    title: 'Group / Collection Shot',
    description: 'Multiple products or variants shown together in a cohesive composition.',
    chips: ['Set', 'Bundle', 'Collection'],
    triggerBlocks: ['background'],
    isGlobal: true,
  },
  {
    id: 'social-media',
    title: 'Social Media Ready',
    description: 'Optimized for Instagram, TikTok, and social feeds with bold framing.',
    chips: ['Feed', 'Story', 'Bold'],
    triggerBlocks: ['visualDirection'],
    isGlobal: true,
  },
  {
    id: 'seasonal-holiday',
    title: 'Seasonal / Holiday',
    description: 'Product in seasonal or holiday-themed setting.',
    chips: ['Season', 'Holiday', 'Themed'],
    triggerBlocks: ['sceneEnvironment', 'visualDirection'],
    isGlobal: true,
  },
  {
    id: 'shadow-light',
    title: 'Shadow & Light Play',
    description: 'Dramatic shadow and light composition for premium feel.',
    chips: ['Shadow', 'Light', 'Dramatic'],
    triggerBlocks: ['visualDirection'],
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
    title: 'Garments',
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
  {
    id: 'other-custom',
    title: 'Other / Custom',
    scenes: [
      { id: 'other-global', title: 'Use Global Scenes', description: 'Apply any global scene to your product.', triggerBlocks: [], isGlobal: false, categoryCollection: 'other-custom' },
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
