/**
 * Categories for the AI Product Photography SEO hub page.
 * Each entry powers a crawlable hub card linking to the
 * /ai-product-photography/{slug} category page.
 *
 * Preview images are hand-picked editorial/lifestyle shots from the live
 * product_image_scenes catalog so each card visually matches its category.
 * Shot counts reflect the real, aggregated number of scenes available across
 * all subcategories within each group.
 */

export interface ProductPhotoCategory {
  name: string;
  slug: string;
  url: string;
  description: string;
  subcategories: string[];
  /** Real number of scenes available across all subcategories in this group. */
  shotCount: number;
  /** Legacy single preview — kept for backwards compatibility. */
  previewImage: string;
  /** 3 on-subject preview ids used by the hub card collage. */
  previewImages: string[];
  alt: string;
}

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

export const aiProductPhotographyCategories: ProductPhotoCategory[] = [
  {
    name: 'Fashion',
    slug: 'fashion',
    url: '/ai-product-photography/fashion',
    description:
      'Create product page images, flatlays, lifestyle visuals, on-model style shots, and fashion campaign content for clothing brands.',
    subcategories: ['Clothing', 'Dresses', 'Hoodies', 'Jeans', 'Jackets', 'Activewear', 'Swimwear', 'Lingerie'],
    shotCount: 425,
    previewImage: PREVIEW('1776664924644-8pmju4'),
    previewImages: ['1776664933175-rjlbn6', '1776192312181-3v0u0t', '1776691912818-yiu2uq'],
    alt: 'AI fashion product photography example: editorial garment in a chair studio scene.',
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    url: '/ai-product-photography/footwear',
    description:
      'Create shoe product photos, sneaker launch visuals, boot scenes, high heel imagery, and ad-ready footwear content.',
    subcategories: ['Shoes', 'Sneakers', 'Boots', 'High Heels'],
    shotCount: 226,
    previewImage: PREVIEW('hard-shadow-shoes-sneakers-1776008136691'),
    previewImages: ['hard-shadow-shoes-sneakers-1776008136691', 'night-curb-flash-1776011807130', '1776239826550-uaopmt'],
    alt: 'AI footwear product photography example: sneaker hard shadow hero shot.',
  },
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    url: '/ai-product-photography/beauty-skincare',
    description:
      'Generate skincare product images, clean beauty visuals, spa-style lifestyle scenes, and campaign-ready cosmetic content.',
    subcategories: ['Skincare', 'Cosmetics', 'Makeup', 'Lipsticks', 'Serums', 'Creams'],
    shotCount: 98,
    previewImage: PREVIEW('1776239812719-8u80jx'),
    previewImages: ['1776239812719-8u80jx', '1776239813791-r7ih97', '1776239827591-4xy8ov'],
    alt: 'AI skincare product photography example: editorial formula smear with serum.',
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    url: '/ai-product-photography/fragrance',
    description:
      'Create luxury perfume visuals, fragrance bottle photography, product page images, and campaign-ready scent stories.',
    subcategories: ['Perfume Bottles', 'Fragrance Boxes', 'Gift Sets', 'Glass Bottles'],
    shotCount: 69,
    previewImage: PREVIEW('in-hand-lifestyle-fragrance-1776013280517'),
    previewImages: ['in-hand-lifestyle-fragrance-1776013280517', '1776842387930-h6xw7w', 'repeated-shadow-grid-fragrance-1776013389735'],
    alt: 'AI fragrance product photography example: in-hand lifestyle perfume bottle scene.',
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    url: '/ai-product-photography/jewelry',
    description:
      'Create elegant jewelry product photos, macro detail shots, model-style visuals, and luxury campaign imagery.',
    subcategories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
    shotCount: 144,
    previewImage: PREVIEW('1776243905045-8aw72b'),
    previewImages: ['1776243905045-8aw72b', '1776244136599-8gw62e', '1776243682026-h1itvm'],
    alt: 'AI jewelry product photography example: editorial neck portrait with necklace.',
  },
  {
    name: 'Bags & Accessories',
    slug: 'bags-accessories',
    url: '/ai-product-photography/bags-accessories',
    description:
      'Generate handbag visuals, accessory product photos, lifestyle scenes, and luxury campaign content for fashion brands.',
    subcategories: ['Bags', 'Handbags', 'Backpacks', 'Wallets', 'Belts', 'Scarves', 'Hats', 'Eyewear', 'Watches'],
    shotCount: 389,
    previewImage: PREVIEW('1776749544620-sn4eh1'),
    previewImages: ['1776749544620-sn4eh1', '1776239449949-ygljai', 'editorial-office-flash-eyewear-1776150153576'],
    alt: 'AI bag product photography example: reclined studio editorial handbag scene.',
  },
  {
    name: 'Home & Furniture',
    slug: 'home-furniture',
    url: '/ai-product-photography/home-furniture',
    description:
      'Place home decor and furniture products into realistic interiors, styled rooms, catalog visuals, and lifestyle scenes.',
    subcategories: ['Home Decor', 'Furniture', 'Vases', 'Candles', 'Lighting', 'Tables', 'Chairs', 'Sofas'],
    shotCount: 60,
    previewImage: PREVIEW('1776250523409-wvjm1w'),
    previewImages: ['1776250523409-wvjm1w', '1776669395926-r2grx3', '1776250518879-ichrf6'],
    alt: 'AI home decor product photography example: color hero decor campaign visual.',
  },
  {
    name: 'Food & Beverage',
    slug: 'food-beverage',
    url: '/ai-product-photography/food-beverage',
    description:
      'Create packaged food visuals, beverage product photos, snack scenes, bottle images, can visuals, and CPG campaign content.',
    subcategories: ['Food', 'Snacks', 'Beverages', 'Bottles', 'Cans', 'Jars', 'Packaged Food'],
    shotCount: 115,
    previewImage: PREVIEW('1776240325793-lb7xi4'),
    previewImages: ['1776240325793-lb7xi4', '1776246646068-vtqnyc', '1776758447403-iisf5e'],
    alt: 'AI food and beverage product photography example: editorial beverage campaign scene.',
  },
  {
    name: 'Supplements & Wellness',
    slug: 'supplements-wellness',
    url: '/ai-product-photography/supplements-wellness',
    description:
      'Create supplement product photos, wellness lifestyle scenes, fitness visuals, vitamin imagery, and clean product page content.',
    subcategories: ['Supplements', 'Vitamins', 'Protein', 'Wellness Products', 'Capsules', 'Powders'],
    shotCount: 51,
    previewImage: PREVIEW('1776247484304-xpwv5f'),
    previewImages: ['1776247484304-xpwv5f', '1776247486394-r95qn0', '1776247491181-ox42m3'],
    alt: 'AI supplement product photography example: editorial dose preparation wellness scene.',
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    url: '/ai-product-photography/electronics-gadgets',
    description:
      'Generate tech product photos, gadget visuals, device launch content, desk setups, and clean e-commerce imagery.',
    subcategories: ['Electronics', 'Gadgets', 'Tech Devices', 'Phone Cases', 'Headphones', 'Smart Devices'],
    shotCount: 33,
    previewImage: PREVIEW('1776250227186-ipm40h'),
    previewImages: ['1776250227186-ipm40h', '1776250232617-zoxalv', '1776250225810-gdcnka'],
    alt: 'AI electronics product photography example: color hero tech campaign visual.',
  },
];
