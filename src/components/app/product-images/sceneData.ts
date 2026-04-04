import type { ProductImageScene, CategoryCollection, ProductCategory } from './types';

export const GLOBAL_SCENES: ProductImageScene[] = [
  {
    id: 'clean-packshot',
    title: 'Clean Studio Shot',
    description: 'Pure white background cut-out for listings and catalogs.',
    triggerBlocks: ['background', 'productSize'],
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
    id: 'editorial-surface',
    title: 'Editorial on Surface',
    description: 'Product on a premium styled surface with editorial mood.',
    triggerBlocks: ['visualDirection', 'sceneEnvironment'],
    isGlobal: true,
  },
  {
    id: 'product-pedestal',
    title: 'Product on Pedestal',
    description: 'Elevated on a block, plinth, or sculptural display base.',
    triggerBlocks: ['background', 'visualDirection'],
    isGlobal: true,
  },
  {
    id: 'tabletop-lifestyle',
    title: 'Tabletop Lifestyle',
    description: 'Product styled on a table in a natural setting.',
    triggerBlocks: ['sceneEnvironment', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'in-hand-studio',
    title: 'In-Hand Studio',
    description: 'Hand holding product in clean studio setting.',
    triggerBlocks: ['personDetails', 'actionDetails', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'in-hand-lifestyle',
    title: 'In-Hand Lifestyle',
    description: 'Product held naturally in a real-world context.',
    triggerBlocks: ['personDetails', 'actionDetails', 'sceneEnvironment', 'productSize'],
    isGlobal: true,
  },
  {
    id: 'closeup-detail',
    title: 'Close-Up Detail',
    description: 'Tight crop highlighting product details and finish.',
    triggerBlocks: ['detailFocus'],
    isGlobal: true,
  },
  {
    id: 'more-angles',
    title: 'More Angles',
    description: 'Additional angle views: front, side, back, top-down.',
    triggerBlocks: ['angleSelection'],
    isGlobal: true,
  },
  {
    id: 'product-packaging',
    title: 'Product + Packaging',
    description: 'Product styled together with its box or packaging.',
    triggerBlocks: ['packagingDetails'],
    isGlobal: true,
  },
  {
    id: 'packaging-detail',
    title: 'Packaging Detail',
    description: 'Close-up of packaging design, label, or construction.',
    triggerBlocks: ['packagingDetails', 'detailFocus'],
    isGlobal: true,
  },
];

export const CATEGORY_COLLECTIONS: CategoryCollection[] = [
  {
    id: 'fragrance',
    title: 'Fragrance',
    scenes: [
      { id: 'fragrance_hero_surface', title: 'Hero Bottle on Stone', description: 'Clean hero packshot on a refined surface like stone, plaster, marble, or brushed wood.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_cap_nozzle_detail', title: 'Cap & Atomizer Detail', description: 'Close-up of cap, spray nozzle, glass edge, label finish, or reflective hardware.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_shelf_placement', title: 'Shelf Styling Scene', description: 'Bottle placed on a shelf, console, or ledge in a calm interior setting.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_in_hand', title: 'Fragrance in Hand', description: 'Elegant hand-held composition showing scale and premium feel.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_product_packaging', title: 'Bottle & Box Composition', description: 'Bottle styled with outer packaging for launch visuals or gifting.', triggerBlocks: ['packagingDetails'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_vanity_editorial', title: 'Vanity Ritual Scene', description: 'Fragrance in a dressing-table or vanity setting with mirrors and soft reflections.', triggerBlocks: ['sceneEnvironment', 'visualDirection'], isGlobal: false, categoryCollection: 'fragrance' },
      { id: 'fragrance_editorial_still_life', title: 'Atmospheric Still Life', description: 'Brand-led composition with shadows, sculptural props, and campaign-style mood.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'fragrance' },
    ],
  },
  {
    id: 'beauty-skincare',
    title: 'Beauty & Skincare',
    scenes: [
      { id: 'beauty_shelf_placement', title: 'Shelf Placement', description: 'Product on a shelf in a bathroom, spa, or minimal interior.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_vanity_placement', title: 'Vanity Counter Scene', description: 'Product on a sink, vanity counter, or bathroom tray.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_texture_formula', title: 'Formula Texture Close-Up', description: 'Cream, serum, gel, or lotion in a detailed texture shot.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_in_hand', title: 'Beauty in Hand', description: 'Product held with neat styling and beauty-oriented framing.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_editorial_surface', title: 'Editorial Surface Composition', description: 'Product on a premium surface with soft lighting and clean campaign composition.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_application_skin', title: 'Application on Skin', description: 'Product shown in real use on skin, cheek, hand, or body.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'beauty-skincare' },
      { id: 'beauty_routine_grouping', title: 'Routine Set Composition', description: 'Multiple beauty products arranged in a daily routine format.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'beauty-skincare' },
    ],
  },
  {
    id: 'makeup-lipsticks',
    title: 'Makeup & Lipsticks',
    scenes: [
      { id: 'makeup_near_lips_closeup', title: 'Product Near Lips', description: 'Tight beauty crop where the product sits close to lips or face.', triggerBlocks: ['personDetails', 'detailFocus'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_portrait_with_product', title: 'Portrait with Product', description: 'Portrait-led shot where the model presents the cosmetic item.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_in_hand', title: 'Makeup in Hand', description: 'Refined hand-held shot for lipsticks, mascaras, compacts, liners.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_flatlay', title: 'Cosmetic Flat Lay', description: 'Top-down arrangement in a clean or editorial layout.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_detail', title: 'Precision Detail Shot', description: 'Macro showing bullet shape, pigment surface, brush tip, or packaging finish.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_swatch_composition', title: 'Swatch & Product Scene', description: 'Product paired with pigment swatches, smears, or color payoff visuals.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
      { id: 'makeup_vanity_editorial', title: 'Vanity Beauty Scene', description: 'Makeup in a premium dressing-table or getting-ready environment.', triggerBlocks: ['sceneEnvironment', 'visualDirection'], isGlobal: false, categoryCollection: 'makeup-lipsticks' },
    ],
  },
  {
    id: 'bags-accessories',
    title: 'Bags & Structured Accessories',
    scenes: [
      { id: 'bag_hero_surface', title: 'Bag Hero on Surface', description: 'Bag on stone, wood, linen, or premium surface with clean composition.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_pedestal_hero', title: 'Bag on Pedestal', description: 'Bag elevated on a block, pedestal, or sculptural display base.', triggerBlocks: ['background', 'visualDirection'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_carry_hold', title: 'Carry Shot', description: 'Bag being carried naturally in hand or at the side.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_portrait_editorial', title: 'Portrait with Bag', description: 'Model-centered shot where the bag is clearly visible and aspirational.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_detail_macro', title: 'Hardware & Material Detail', description: 'Close-up of leather grain, stitching, clasp, zipper, or metal finish.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_seated_lifestyle', title: 'Seated Lifestyle with Bag', description: 'Bag in an interior scene beside or with a seated model.', triggerBlocks: ['personDetails', 'sceneEnvironment'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_furniture_placement', title: 'Bag on Furniture', description: 'Bag placed on a chair, bench, console, or side table.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'bags-accessories' },
      { id: 'bag_walking_editorial', title: 'Walking Editorial', description: 'Bag styled in motion with walking composition.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'bags-accessories' },
    ],
  },
  {
    id: 'hats-small',
    title: 'Hats & Small Accessories',
    scenes: [
      { id: 'accessory_clean_hero', title: 'Clean Accessory Hero', description: 'Simple isolated accessory shot with minimal styling.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'accessory_styled_surface', title: 'Styled Surface Scene', description: 'Accessory on a styled surface with subtle props or textures.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'accessory_material_detail', title: 'Material Detail', description: 'Macro showing stitches, weave, edge finishing, leather, or metal.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'accessory_hold_context', title: 'Held in Context', description: 'Accessory held in hand or partially styled in a real-life scene.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'accessory_fashion_editorial', title: 'Fashion Editorial', description: 'Accessory integrated into a fashion composition.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'hats-small' },
      { id: 'accessory_on_body_crop', title: 'On-Body Crop', description: 'Accessory worn or shown on body in a tight crop.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'hats-small' },
    ],
  },
  {
    id: 'shoes',
    title: 'Shoes',
    scenes: [
      { id: 'shoes_side_profile_hero', title: 'Side Profile Hero', description: 'Strong side profile emphasizing silhouette and structure.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_pair_display', title: 'Pair Composition', description: 'Both shoes arranged together in a balanced composition.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_sole_detail', title: 'Sole Detail', description: 'Bottom view or angled close-up of outsole and tread.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_material_lace_detail', title: 'Material & Lace Detail', description: 'Close-up of leather, suede, stitching, lace structure.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_lifestyle_scene', title: 'Lifestyle Footwear Scene', description: 'Shoes in a real environment, worn or placed naturally.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_on_foot_editorial', title: 'On-Foot Editorial', description: 'Cropped editorial shot worn by a model.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'shoes' },
      { id: 'shoes_pedestal_hero', title: 'Pedestal Shoe Hero', description: 'Single shoe elevated on a block or display base.', triggerBlocks: ['background', 'visualDirection'], isGlobal: false, categoryCollection: 'shoes' },
    ],
  },
  {
    id: 'garments',
    title: 'Clothing & Apparel',
    scenes: [
      { id: 'apparel_folded_display', title: 'Folded Display', description: 'Garment folded neatly for surface-based product storytelling.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_hanging_display', title: 'Hanging Display', description: 'Garment on hanger, rack, or hook in a clean fashion setting.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_styled_flatlay', title: 'Styled Flat Lay', description: 'Top-down arrangement with optional accessories.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_fabric_stitch_detail', title: 'Fabric & Stitch Detail', description: 'Macro showing material texture, seams, buttons, or label.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_editorial_garment', title: 'Editorial Garment Shot', description: 'Garment in a styled premium fashion composition.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_on_model_editorial', title: 'On-Model Look', description: 'Full or half-body model shot focused on fit and silhouette.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'garments' },
      { id: 'apparel_motion_scene', title: 'Movement Shot', description: 'Garment shown in motion for drape, softness, or fluidity.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'garments' },
    ],
  },
  {
    id: 'home-decor',
    title: 'Home Decor / Furniture',
    scenes: [
      { id: 'home_interior_placement', title: 'Interior Placement', description: 'Product placed naturally inside a styled interior space.', triggerBlocks: ['sceneEnvironment', 'productSize'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home_surface_styling', title: 'Shelf or Surface Styling', description: 'Object on shelf, coffee table, sideboard, or nightstand.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home_material_detail', title: 'Material Detail', description: 'Macro showing finish, grain, texture, fabric, or craftsmanship.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home_wide_room_crop', title: 'Wide Room Crop', description: 'Wider shot showing product in room context.', triggerBlocks: ['sceneEnvironment', 'productSize'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home_editorial_scene', title: 'Decor Editorial Scene', description: 'Campaign-style styled image with premium atmosphere.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'home-decor' },
      { id: 'home_cluster_composition', title: 'Object Cluster Composition', description: 'Decor grouped with complementary objects in a styling setup.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'home-decor' },
    ],
  },
  {
    id: 'tech-devices',
    title: 'Tech / Devices',
    scenes: [
      { id: 'tech_clean_packshot', title: 'Clean Device Packshot', description: 'Minimal device-only shot with controlled reflections.', triggerBlocks: ['background'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech_desk_placement', title: 'Desk Placement', description: 'Device on a desk, workstation, or creative setup.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech_use_interaction', title: 'Use Interaction Shot', description: 'Hand or person interacting with the device.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech_interface_detail', title: 'Interface / Component Detail', description: 'Tight close-up of ports, buttons, lens, or UI.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech_editorial_scene', title: 'Tech Editorial Scene', description: 'High-end campaign composition with futuristic polish.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'tech-devices' },
      { id: 'tech_environment_context', title: 'Device in Environment', description: 'Product in the place it belongs: office, home, or studio.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'tech-devices' },
    ],
  },
  {
    id: 'food-beverage',
    title: 'Food & Beverage',
    scenes: [
      { id: 'food_tabletop_placement', title: 'Tabletop Product Placement', description: 'Product styled on a table, counter, or serving surface.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_ingredient_flatlay', title: 'Ingredient Flat Lay', description: 'Top-down composition with ingredients or garnishes.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_packaging_detail', title: 'Packaging Detail', description: 'Close-up of label, material, seal, or printed finish.', triggerBlocks: ['detailFocus', 'packagingDetails'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_in_hand', title: 'In-Hand Food or Drink', description: 'Product shown being held or served for scale.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_product_packaging', title: 'Product & Packaging Scene', description: 'Food/beverage with its container, box, or bottle.', triggerBlocks: ['packagingDetails'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_pour_serve_action', title: 'Pour / Serve Action', description: 'Visual of pouring, scooping, or opening the product.', triggerBlocks: ['personDetails', 'actionDetails'], isGlobal: false, categoryCollection: 'food-beverage' },
      { id: 'food_lifestyle_context', title: 'Consumption Context', description: 'Product in a believable eating or drinking environment.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'food-beverage' },
    ],
  },
  {
    id: 'supplements-wellness',
    title: 'Supplements & Wellness',
    scenes: [
      { id: 'wellness_shelf_placement', title: 'Wellness Shelf Placement', description: 'Product on shelf or cabinet in a wellness-oriented environment.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_tabletop', title: 'Tabletop Product Shot', description: 'Bottle, pouch, or jar styled on a clean tabletop.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_label_detail', title: 'Label & Packaging Detail', description: 'Macro emphasizing ingredients panel, label clarity, or packaging.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_in_hand', title: 'In-Hand Supplement Shot', description: 'Bottle or sachet held naturally in a health composition.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_product_packaging', title: 'Product & Packaging Composition', description: 'Primary product with carton, refill, or sachets.', triggerBlocks: ['packagingDetails'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_daily_routine', title: 'Daily Routine Scene', description: 'Product in a realistic morning or wellness ritual context.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'supplements-wellness' },
      { id: 'wellness_dose_detail', title: 'Dose / Scoop Detail', description: 'Close-up of scoop, capsule, powder, tablet, or serving format.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'supplements-wellness' },
    ],
  },
  {
    id: 'other',
    title: 'Other / Custom',
    scenes: [
      { id: 'global_hero_surface', title: 'Hero on Surface', description: 'Product hero shot on a styled surface.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'other' },
      { id: 'global_in_hand', title: 'Product in Hand', description: 'Product held for scale and context.', triggerBlocks: ['personDetails'], isGlobal: false, categoryCollection: 'other' },
      { id: 'global_detail_macro', title: 'Detail Close-Up', description: 'Macro or detail shot of key product features.', triggerBlocks: ['detailFocus'], isGlobal: false, categoryCollection: 'other' },
      { id: 'global_shelf_placement', title: 'Shelf Placement', description: 'Product on a shelf or display surface.', triggerBlocks: ['sceneEnvironment'], isGlobal: false, categoryCollection: 'other' },
      { id: 'global_editorial_scene', title: 'Editorial Composition', description: 'Campaign-style editorial shot.', triggerBlocks: ['visualDirection'], isGlobal: false, categoryCollection: 'other' },
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

/** Get category collection ID that a scene belongs to */
export function getSceneCategoryId(sceneId: string): string | null {
  for (const col of CATEGORY_COLLECTIONS) {
    if (col.scenes.some(s => s.id === sceneId)) return col.id;
  }
  return null;
}
