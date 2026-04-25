/**
 * Categories for the AI Product Photography SEO hub page.
 * Each entry powers a crawlable hub card linking to the future
 * /ai-product-photography/{slug} category page.
 */

export interface ProductPhotoCategory {
  name: string;
  slug: string;
  url: string;
  description: string;
  subcategories: string[];
  previewImage: string;
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
    previewImage: PREVIEW('1776689318257-yahkye'),
    alt: 'AI product photography example for fashion and clothing brands.',
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    url: '/ai-product-photography/footwear',
    description:
      'Create shoe product photos, sneaker launch visuals, boot scenes, high heel imagery, and ad-ready footwear content.',
    subcategories: ['Shoes', 'Sneakers', 'Boots', 'High Heels'],
    previewImage: PREVIEW('1776770347820-s3qwmr'),
    alt: 'AI footwear product photography example showing a shoe in a lifestyle scene.',
  },
  {
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    url: '/ai-product-photography/beauty-skincare',
    description:
      'Generate skincare product images, clean beauty visuals, spa-style lifestyle scenes, and campaign-ready cosmetic content.',
    subcategories: ['Skincare', 'Cosmetics', 'Makeup', 'Lipsticks', 'Serums', 'Creams'],
    previewImage: PREVIEW('1776018015756-3xfquh'),
    alt: 'AI skincare product photography example showing a serum bottle in a clean beauty setup.',
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    url: '/ai-product-photography/fragrance',
    description:
      'Create luxury perfume visuals, fragrance bottle photography, product page images, and campaign-ready scent stories.',
    subcategories: ['Perfume Bottles', 'Fragrance Boxes', 'Gift Sets', 'Glass Bottles'],
    previewImage: PREVIEW('1776018020221-aehe8n'),
    alt: 'AI fragrance product photography example showing a perfume bottle in a luxury campaign scene.',
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    url: '/ai-product-photography/jewelry',
    description:
      'Create elegant jewelry product photos, macro detail shots, model-style visuals, and luxury campaign imagery.',
    subcategories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
    previewImage: PREVIEW('1776102204479-9rlc0n'),
    alt: 'AI jewelry product photography example showing a ring in a close-up editorial scene.',
  },
  {
    name: 'Bags & Accessories',
    slug: 'bags-accessories',
    url: '/ai-product-photography/bags-accessories',
    description:
      'Generate handbag visuals, accessory product photos, lifestyle scenes, and luxury campaign content for fashion brands.',
    subcategories: ['Bags', 'Handbags', 'Backpacks', 'Wallets', 'Belts', 'Scarves', 'Hats', 'Eyewear', 'Watches'],
    previewImage: PREVIEW('1776239449949-ygljai'),
    alt: 'AI bag and accessory product photography example showing a handbag in a luxury editorial scene.',
  },
  {
    name: 'Home & Furniture',
    slug: 'home-furniture',
    url: '/ai-product-photography/home-furniture',
    description:
      'Place home decor and furniture products into realistic interiors, styled rooms, catalog visuals, and lifestyle scenes.',
    subcategories: ['Home Decor', 'Furniture', 'Vases', 'Candles', 'Lighting', 'Tables', 'Chairs', 'Sofas'],
    previewImage: PREVIEW('1776688413055-z73arv'),
    alt: 'AI home and furniture product photography example showing decor in a styled interior scene.',
  },
  {
    name: 'Food & Beverage',
    slug: 'food-beverage',
    url: '/ai-product-photography/food-beverage',
    description:
      'Create packaged food visuals, beverage product photos, snack scenes, bottle images, can visuals, and CPG campaign content.',
    subcategories: ['Food', 'Snacks', 'Beverages', 'Bottles', 'Cans', 'Jars', 'Packaged Food'],
    previewImage: PREVIEW('1776018027926-ua03bd'),
    alt: 'AI food and beverage product photography example showing packaged products in a lifestyle scene.',
  },
  {
    name: 'Supplements & Wellness',
    slug: 'supplements-wellness',
    url: '/ai-product-photography/supplements-wellness',
    description:
      'Create supplement product photos, wellness lifestyle scenes, fitness visuals, vitamin imagery, and clean product page content.',
    subcategories: ['Supplements', 'Vitamins', 'Protein', 'Wellness Products', 'Capsules', 'Powders'],
    previewImage: PREVIEW('1776018039712-1hifzr'),
    alt: 'AI supplements and wellness product photography example showing a vitamin bottle in a clean wellness scene.',
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    url: '/ai-product-photography/electronics-gadgets',
    description:
      'Generate tech product photos, gadget visuals, device launch content, desk setups, and clean e-commerce imagery.',
    subcategories: ['Electronics', 'Gadgets', 'Tech Devices', 'Phone Cases', 'Headphones', 'Smart Devices'],
    previewImage: PREVIEW('1776102181320-jisnae'),
    alt: 'AI electronics product photography example showing a gadget in a clean desk setup.',
  },
];
