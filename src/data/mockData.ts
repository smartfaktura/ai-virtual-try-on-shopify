import type { 
  Template, 
  Product, 
  GenerationJob, 
  DashboardMetrics,
  Shop,
  BrandDefaults,
  PricingPlan,
  CreditPack
} from '@/types';

import { getLandingAssetUrl } from '@/lib/landingAssets';

export const mockShop: Shop = {
  shopId: 'shop_123',
  shopDomain: 'mystore.myshopify.com',
  plan: 'pro',
  creditsBalance: 847,
  brandDefaults: {
    tone: 'clean',
    backgroundStyle: 'studio',
    colors: ['#008060', '#FFFFFF', '#212B36'],
    negatives: ['text overlays', 'busy backgrounds', 'watermarks'],
    consistencyEnabled: true,
  },
};

export const mockMetrics: DashboardMetrics = {
  imagesGenerated30d: 234,
  creditsRemaining: 847,
  avgGenerationTime: 12.4,
  publishRate: 78,
  errorRate: 2.3,
};

export const mockTemplates: Template[] = [
  // Clothing
  {
    templateId: 'tpl_001',
    category: 'clothing',
    name: 'Premium Studio Apparel',
    description: 'High-end fashion photography with soft studio lighting and clean backgrounds',
    promptBlueprint: {
      sceneDescription: 'Professional fashion photography studio setup',
      lighting: 'Soft diffused studio lighting with subtle rim light',
      cameraStyle: 'Medium shot, 85mm lens look, shallow depth of field',
      backgroundRules: 'Clean white or light gray seamless backdrop',
      constraints: {
        do: ['Emphasize fabric texture', 'Show garment structure', 'Professional styling'],
        dont: ['No mannequins', 'No visible hangers', 'No wrinkles'],
      },
    },
    defaults: {
      aspectRatio: '4:5',
      count: 4,
      quality: 'high',
      negativePrompt: 'text, watermark, logo, mannequin, hanger, wrinkles, low quality',
    },
    enabled: true,
    tags: ['Premium', 'Studio', 'Fashion'],
    recommended: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_002',
    category: 'clothing',
    name: 'Lifestyle Streetwear',
    description: 'Urban lifestyle shots with natural outdoor lighting',
    promptBlueprint: {
      sceneDescription: 'Urban street setting with architectural elements',
      lighting: 'Golden hour natural light with soft shadows',
      cameraStyle: 'Full body or 3/4 shot, 35mm street photography style',
      backgroundRules: 'Urban environment, concrete, brick, or modern architecture',
      constraints: {
        do: ['Show movement', 'Urban context', 'Authentic vibe'],
        dont: ['No studio look', 'No stiff poses', 'No busy distracting backgrounds'],
      },
    },
    defaults: {
      aspectRatio: '4:5',
      count: 4,
      quality: 'standard',
      negativePrompt: 'studio, white background, stiff, formal, text, watermark',
    },
    enabled: true,
    tags: ['Lifestyle', 'Urban', 'Streetwear'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_003',
    category: 'clothing',
    name: 'Minimal Flat Lay',
    description: 'Clean overhead flat lay compositions for e-commerce',
    promptBlueprint: {
      sceneDescription: 'Overhead flat lay product photography',
      lighting: 'Even soft lighting, no harsh shadows',
      cameraStyle: 'Top-down view, product-focused composition',
      backgroundRules: 'Solid color surface, minimal props',
      constraints: {
        do: ['Symmetrical layout', 'Show full product', 'Clean composition'],
        dont: ['No clutter', 'No busy patterns', 'No perspective distortion'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'standard',
      negativePrompt: 'cluttered, busy, perspective, tilted, text, watermark',
    },
    enabled: true,
    tags: ['Minimal', 'Flat Lay', 'E-commerce'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Cosmetics
  {
    templateId: 'tpl_004',
    category: 'cosmetics',
    name: 'Luxury Skincare Studio',
    description: 'Premium beauty photography with elegant lighting and reflections',
    promptBlueprint: {
      sceneDescription: 'Luxury cosmetics product photography',
      lighting: 'Dramatic beauty lighting with highlights and reflections',
      cameraStyle: 'Close-up macro details, sharp focus on product',
      backgroundRules: 'Gradient or marble surface, luxury feel',
      constraints: {
        do: ['Show texture', 'Elegant composition', 'Premium feel'],
        dont: ['No harsh shadows', 'No cluttered scene', 'No cheap look'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'cheap, plastic look, harsh shadows, cluttered, text, watermark',
    },
    enabled: true,
    tags: ['Luxury', 'Skincare', 'Beauty'],
    recommended: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_005',
    category: 'cosmetics',
    name: 'Glossy Product + Water Drops',
    description: 'Fresh and hydrating look with water droplets and dewy effects',
    promptBlueprint: {
      sceneDescription: 'Fresh beauty product with water and moisture elements',
      lighting: 'Bright clean lighting with specular highlights',
      cameraStyle: 'Hero shot with water splash or droplets',
      backgroundRules: 'Light blue or white with water elements',
      constraints: {
        do: ['Fresh feeling', 'Water droplets', 'Clean and hydrating'],
        dont: ['No dry look', 'No matte finish', 'No warm tones'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'dry, matte, warm tones, dusty, text, watermark',
    },
    enabled: true,
    tags: ['Fresh', 'Water', 'Hydrating'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_006',
    category: 'cosmetics',
    name: 'Soft Pastel Clean Beauty',
    description: 'Gentle pastel tones for clean beauty and wellness brands',
    promptBlueprint: {
      sceneDescription: 'Soft pastel beauty product photography',
      lighting: 'Soft diffused lighting, no harsh shadows',
      cameraStyle: 'Clean composition, breathing room around product',
      backgroundRules: 'Pastel gradient or solid soft color',
      constraints: {
        do: ['Gentle tones', 'Minimal composition', 'Natural feel'],
        dont: ['No bold colors', 'No harsh contrast', 'No busy backgrounds'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'standard',
      negativePrompt: 'bold colors, harsh, busy, cluttered, text, watermark',
    },
    enabled: true,
    tags: ['Pastel', 'Clean Beauty', 'Soft'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Food
  {
    templateId: 'tpl_007',
    category: 'food',
    name: 'Bright Commercial Food Shot',
    description: 'Appetizing commercial food photography with vibrant colors',
    promptBlueprint: {
      sceneDescription: 'Commercial food photography setup',
      lighting: 'Bright key light with fill, appetizing highlights',
      cameraStyle: '45-degree angle, hero food shot',
      backgroundRules: 'Clean surface with minimal styled props',
      constraints: {
        do: ['Appetizing colors', 'Fresh ingredients visible', 'Commercial quality'],
        dont: ['No dark moody', 'No artificial look', 'No messy styling'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'dark, moody, artificial, messy, unappetizing, text, watermark',
    },
    enabled: true,
    tags: ['Commercial', 'Bright', 'Appetizing'],
    recommended: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_008',
    category: 'food',
    name: 'Rustic Table Lifestyle',
    description: 'Warm rustic setting with natural textures and props',
    promptBlueprint: {
      sceneDescription: 'Rustic farmhouse table setting',
      lighting: 'Warm natural window light',
      cameraStyle: 'Overhead or 45-degree, styled scene',
      backgroundRules: 'Wooden table, linen, ceramic props',
      constraints: {
        do: ['Warm tones', 'Natural textures', 'Lifestyle context'],
        dont: ['No studio white', 'No plastic props', 'No cold lighting'],
      },
    },
    defaults: {
      aspectRatio: '4:5',
      count: 4,
      quality: 'standard',
      negativePrompt: 'studio, white background, plastic, cold, clinical, text, watermark',
    },
    enabled: true,
    tags: ['Rustic', 'Lifestyle', 'Warm'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_009',
    category: 'food',
    name: 'Minimal Packaging Focus',
    description: 'Clean product-focused shots emphasizing packaging design',
    promptBlueprint: {
      sceneDescription: 'Minimal food packaging photography',
      lighting: 'Clean even lighting, soft shadows',
      cameraStyle: 'Front-facing or slight angle, package as hero',
      backgroundRules: 'Solid color complementing packaging',
      constraints: {
        do: ['Show packaging clearly', 'Clean composition', 'Brand-focused'],
        dont: ['No open food', 'No messy scene', 'No distracting props'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'standard',
      negativePrompt: 'open food, messy, cluttered, busy background, text, watermark',
    },
    enabled: true,
    tags: ['Minimal', 'Packaging', 'Clean'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Home/Interior
  {
    templateId: 'tpl_010',
    category: 'home',
    name: 'Japandi Minimal Shelf Scene',
    description: 'Zen-inspired minimal interior styling with natural materials',
    promptBlueprint: {
      sceneDescription: 'Japandi style interior shelf vignette',
      lighting: 'Soft natural daylight, subtle shadows',
      cameraStyle: 'Straight-on or slight angle, balanced composition',
      backgroundRules: 'Light wood shelf, white or cream wall',
      constraints: {
        do: ['Minimal styling', 'Natural materials', 'Balanced negative space'],
        dont: ['No clutter', 'No bright colors', 'No busy patterns'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'cluttered, colorful, busy, maximalist, text, watermark',
    },
    enabled: true,
    tags: ['Japandi', 'Minimal', 'Interior'],
    recommended: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_011',
    category: 'home',
    name: 'Warm Lamp + Shadows',
    description: 'Cozy evening ambiance with warm lighting and dramatic shadows',
    promptBlueprint: {
      sceneDescription: 'Cozy interior with warm lamp lighting',
      lighting: 'Warm tungsten lamp light, dramatic shadows',
      cameraStyle: 'Lifestyle angle, room context',
      backgroundRules: 'Cozy interior setting, textured surfaces',
      constraints: {
        do: ['Warm atmosphere', 'Inviting mood', 'Natural shadows'],
        dont: ['No harsh flash', 'No cold tones', 'No clinical look'],
      },
    },
    defaults: {
      aspectRatio: '4:5',
      count: 4,
      quality: 'standard',
      negativePrompt: 'cold, harsh, clinical, bright flash, daylight, text, watermark',
    },
    enabled: true,
    tags: ['Warm', 'Cozy', 'Lifestyle'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_012',
    category: 'home',
    name: 'Concrete Studio Modern',
    description: 'Contemporary industrial aesthetic with concrete and metal',
    promptBlueprint: {
      sceneDescription: 'Modern industrial product photography',
      lighting: 'Directional studio light, defined shadows',
      cameraStyle: 'Architectural angles, strong composition',
      backgroundRules: 'Concrete surface or gray textured backdrop',
      constraints: {
        do: ['Industrial feel', 'Strong geometry', 'Contemporary'],
        dont: ['No soft look', 'No traditional styling', 'No warm wood'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'soft, traditional, rustic, warm, wooden, text, watermark',
    },
    enabled: true,
    tags: ['Industrial', 'Modern', 'Concrete'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Supplements
  {
    templateId: 'tpl_013',
    category: 'supplements',
    name: 'Clinical Clean White Studio',
    description: 'Medical-grade clean aesthetic for health products',
    promptBlueprint: {
      sceneDescription: 'Clinical supplement product photography',
      lighting: 'Bright even lighting, minimal shadows',
      cameraStyle: 'Straight product shot, sharp focus',
      backgroundRules: 'Pure white background, no props',
      constraints: {
        do: ['Clean clinical feel', 'Professional', 'Trust-building'],
        dont: ['No lifestyle elements', 'No warm tones', 'No busy styling'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'lifestyle, warm, busy, cluttered, unprofessional, text, watermark',
    },
    enabled: true,
    tags: ['Clinical', 'Clean', 'Professional'],
    recommended: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_014',
    category: 'supplements',
    name: 'Athletic Lifestyle Countertop',
    description: 'Active lifestyle context for sports nutrition',
    promptBlueprint: {
      sceneDescription: 'Athletic lifestyle supplement scene',
      lighting: 'Bright natural or gym lighting',
      cameraStyle: 'Lifestyle angle with context',
      backgroundRules: 'Kitchen counter or gym environment',
      constraints: {
        do: ['Active context', 'Healthy lifestyle', 'Energetic feel'],
        dont: ['No clinical', 'No dark moody', 'No sedentary context'],
      },
    },
    defaults: {
      aspectRatio: '4:5',
      count: 4,
      quality: 'standard',
      negativePrompt: 'clinical, dark, moody, sedentary, lazy, text, watermark',
    },
    enabled: true,
    tags: ['Athletic', 'Lifestyle', 'Active'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_015',
    category: 'supplements',
    name: 'Luxury Matte Black Studio',
    description: 'Premium dark aesthetic for high-end supplements',
    promptBlueprint: {
      sceneDescription: 'Luxury dark supplement photography',
      lighting: 'Dramatic side lighting, controlled highlights',
      cameraStyle: 'Hero shot with reflections',
      backgroundRules: 'Matte black or dark gray surface',
      constraints: {
        do: ['Premium feel', 'Dramatic lighting', 'Luxury positioning'],
        dont: ['No cheap look', 'No flat lighting', 'No bright backgrounds'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'cheap, flat, bright background, clinical white, text, watermark',
    },
    enabled: true,
    tags: ['Luxury', 'Dark', 'Premium'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },

  // Universal
  {
    templateId: 'tpl_016',
    category: 'universal',
    name: 'Ultra Clean Studio',
    description: 'Versatile white studio setup for any product type',
    promptBlueprint: {
      sceneDescription: 'Clean white studio product photography',
      lighting: 'Soft even lighting from multiple angles',
      cameraStyle: 'Front-facing product hero shot',
      backgroundRules: 'Pure white seamless background',
      constraints: {
        do: ['Clean composition', 'Show product clearly', 'E-commerce ready'],
        dont: ['No shadows', 'No props', 'No context'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'standard',
      negativePrompt: 'shadows, props, lifestyle, context, busy, text, watermark',
    },
    enabled: true,
    tags: ['Clean', 'Studio', 'Versatile'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    templateId: 'tpl_017',
    category: 'universal',
    name: 'Gradient Premium Background',
    description: 'Elegant gradient backgrounds for premium product positioning',
    promptBlueprint: {
      sceneDescription: 'Premium product on gradient background',
      lighting: 'Soft studio lighting with subtle rim light',
      cameraStyle: 'Slight angle, floating or reflected surface',
      backgroundRules: 'Smooth gradient from light to dark',
      constraints: {
        do: ['Premium feel', 'Smooth transitions', 'Product focus'],
        dont: ['No harsh edges', 'No flat colors', 'No distracting elements'],
      },
    },
    defaults: {
      aspectRatio: '1:1',
      count: 4,
      quality: 'high',
      negativePrompt: 'harsh, flat, distracting, busy, cheap, text, watermark',
    },
    enabled: true,
    tags: ['Gradient', 'Premium', 'Elegant'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

// Product images via storage URLs
const leggingsBlack1 = getLandingAssetUrl('products/leggings-black-1.jpg');
const leggingsPink1 = getLandingAssetUrl('products/leggings-pink-1.jpg');
const hoodieGray1 = getLandingAssetUrl('products/hoodie-gray-1.jpg');
const sportsBraBlack1 = getLandingAssetUrl('products/sports-bra-black-1.jpg');
const joggersBeige1 = getLandingAssetUrl('products/joggers-beige-1.jpg');
const tankWhite1 = getLandingAssetUrl('products/tank-white-1.jpg');
const motoLeggings1 = getLandingAssetUrl('products/moto-leggings-1.jpg');
const croppedLongsleeve1 = getLandingAssetUrl('products/cropped-longsleeve-1.jpg');
const fauxFurJacket1 = getLandingAssetUrl('products/faux-fur-jacket-1.jpg');

// Cosmetics
const serumVitaminC = getLandingAssetUrl('products/serum-vitamin-c.jpg');
const creamHyaluronic = getLandingAssetUrl('products/cream-hyaluronic.jpg');
const lipstickMatte = getLandingAssetUrl('products/lipstick-matte.jpg');
const retinolTreatment = getLandingAssetUrl('products/retinol-treatment.jpg');
const powderSetting = getLandingAssetUrl('products/powder-setting.jpg');

// Food
const granolaOrganic = getLandingAssetUrl('products/granola-organic.jpg');
const juiceGreen = getLandingAssetUrl('products/juice-green.jpg');
const chocolateArtisan = getLandingAssetUrl('products/chocolate-artisan.jpg');
const coffeeBeans = getLandingAssetUrl('products/coffee-beans.jpg');
const honeyOrganic = getLandingAssetUrl('products/honey-organic.jpg');

// Home
const carafeCeramic = getLandingAssetUrl('products/carafe-ceramic.jpg');
const candleSoy = getLandingAssetUrl('products/candle-soy.jpg');
const pillowLinen = getLandingAssetUrl('products/pillow-linen.jpg');
const planterConcrete = getLandingAssetUrl('products/planter-concrete.jpg');
const lampBrass = getLandingAssetUrl('products/lamp-brass.jpg');

// Supplements
const vitaminsGummy = getLandingAssetUrl('products/vitamins-gummy.jpg');
const collagenPowder = getLandingAssetUrl('products/collagen-powder.jpg');
const magnesiumCapsules = getLandingAssetUrl('products/magnesium-capsules.jpg');
const greensSuperfood = getLandingAssetUrl('products/greens-superfood.jpg');
const omegaFishOil = getLandingAssetUrl('products/omega-fish-oil.jpg');

export const mockProducts: Product[] = [
  // Alo Yoga Style Athletic Fashion Products
  {
    id: 'prod_fashion_001',
    title: 'Airlift High-Waist Legging',
    vendor: 'Alo Yoga',
    productType: 'Leggings',
    tags: ['yoga', 'leggings', 'high-waist', 'athleisure', 'performance'],
    description: 'Sculpting high-waist leggings in signature Airlift fabric. Features a smoothing, lifting waistband, and buttery-soft stretch for studio to street style.',
    images: [
      { id: 'img_f001', url: leggingsBlack1 },
      { id: 'img_f002', url: leggingsPink1 },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_fashion_002',
    title: 'Alo Accolade Hoodie',
    vendor: 'Alo Yoga',
    productType: 'Hoodies',
    tags: ['hoodie', 'oversized', 'cozy', 'athleisure', 'streetwear'],
    description: 'Oversized cropped hoodie in super-soft fleece. Features a relaxed fit, kangaroo pocket, and brushed interior for ultimate comfort. Perfect post-workout or lounging.',
    images: [
      { id: 'img_f003', url: hoodieGray1 },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_fashion_003',
    title: 'Airlift Intrigue Bra',
    vendor: 'Alo Yoga',
    productType: 'Sports Bras',
    tags: ['sports bra', 'yoga', 'medium support', 'strappy', 'performance'],
    description: 'Strappy back sports bra with medium support. Crafted in signature Airlift fabric with moisture-wicking properties. Elegant enough for brunch, supportive enough for hot yoga.',
    images: [
      { id: 'img_f005', url: sportsBraBlack1 },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_fashion_004',
    title: 'Micro Waffle Sundown Jogger',
    vendor: 'Alo Yoga',
    productType: 'Joggers',
    tags: ['joggers', 'waffle knit', 'lounge', 'cozy', 'athleisure'],
    description: 'Ultra-soft micro waffle joggers with a relaxed, tapered silhouette. High-rise waistband and ribbed cuffs. The perfect blend of comfort and elevated casual style.',
    images: [
      { id: 'img_f006', url: joggersBeige1 },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_fashion_005',
    title: 'Alo Yoga Cover Tank',
    vendor: 'Alo Yoga',
    productType: 'Tanks',
    tags: ['tank top', 'yoga', 'lightweight', 'breathable', 'layering'],
    description: 'Lightweight, flowy tank in soft, semi-sheer fabric. Drapes beautifully with a relaxed fit perfect for layering over your favorite bra. Studio essential.',
    images: [
      { id: 'img_f008', url: tankWhite1 },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },
  {
    id: 'prod_fashion_006',
    title: 'High-Waist Moto Legging',
    vendor: 'Alo Yoga',
    productType: 'Leggings',
    tags: ['moto', 'leggings', 'high-waist', 'streetwear', 'performance'],
    description: 'Iconic moto-inspired leggings with quilted knee panels and mesh details. High-waist fit with sleek silhouette. Runway meets studio in this cult favorite.',
    images: [
      { id: 'img_f010', url: motoLeggings1 },
    ],
    status: 'active',
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 'prod_fashion_007',
    title: 'Yoga Ribbed Cropped Long Sleeve',
    vendor: 'Alo Yoga',
    productType: 'Long Sleeves',
    tags: ['cropped', 'ribbed', 'long sleeve', 'fitted', 'layering'],
    description: 'Form-fitting ribbed long sleeve with cropped length. Thumbhole cuffs and seamless construction for a second-skin feel. Perfect for warm-ups and cool downs.',
    images: [
      { id: 'img_f011', url: croppedLongsleeve1 },
    ],
    status: 'active',
    createdAt: '2024-01-04T09:00:00Z',
    updatedAt: '2024-01-08T11:20:00Z',
  },
  {
    id: 'prod_fashion_008',
    title: 'Faux Fur Cropped Jacket',
    vendor: 'Alo Yoga',
    productType: 'Jackets',
    tags: ['jacket', 'faux fur', 'cropped', 'cozy', 'streetwear'],
    description: 'Luxe faux fur cropped jacket in neutral bone. Features a relaxed fit with snap front closure. Statement piece for post-studio street style.',
    images: [
      { id: 'img_f013', url: fauxFurJacket1 },
    ],
    status: 'active',
    createdAt: '2024-01-02T08:00:00Z',
    updatedAt: '2024-01-06T15:45:00Z',
  },
  
  // ============ COSMETICS PRODUCTS ============
  {
    id: 'prod_cosmetics_001',
    title: 'Vitamin C Brightening Serum',
    vendor: 'Glow Labs',
    productType: 'Serums',
    tags: ['serum', 'vitamin c', 'brightening', 'skincare', 'anti-aging'],
    description: 'Potent 15% Vitamin C serum with ferulic acid for brighter, more even-toned skin. Lightweight texture absorbs quickly without residue.',
    images: [
      { id: 'img_c001', url: serumVitaminC },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_cosmetics_002',
    title: 'Hydrating Hyaluronic Acid Cream',
    vendor: 'Glow Labs',
    productType: 'Moisturizers',
    tags: ['moisturizer', 'hyaluronic acid', 'hydrating', 'skincare', 'daily'],
    description: 'Intensive hydrating cream with multi-weight hyaluronic acid complex. Plumps and smooths skin for 72 hours of moisture.',
    images: [
      { id: 'img_c002', url: creamHyaluronic },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_cosmetics_003',
    title: 'Velvet Matte Liquid Lipstick',
    vendor: 'Glow Labs',
    productType: 'Lip Products',
    tags: ['lipstick', 'matte', 'long-wearing', 'makeup', 'lips'],
    description: 'Ultra-pigmented liquid lipstick with velvet matte finish. Comfortable wear for up to 12 hours without transfer or drying.',
    images: [
      { id: 'img_c003', url: lipstickMatte },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_cosmetics_004',
    title: 'Retinol Night Treatment',
    vendor: 'Glow Labs',
    productType: 'Treatments',
    tags: ['retinol', 'night cream', 'anti-aging', 'treatment', 'skincare'],
    description: 'Advanced 0.5% retinol night treatment for fine lines and uneven texture. Encapsulated formula minimizes irritation while maximizing results.',
    images: [
      { id: 'img_c004', url: retinolTreatment },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_cosmetics_005',
    title: 'Airbrush Setting Powder',
    vendor: 'Glow Labs',
    productType: 'Face Powder',
    tags: ['powder', 'setting', 'makeup', 'finishing', 'matte'],
    description: 'Silky-smooth setting powder that blurs imperfections and sets makeup for all-day wear. Translucent formula suits all skin tones.',
    images: [
      { id: 'img_c005', url: powderSetting },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },

  // ============ FOOD & BEVERAGE PRODUCTS ============
  {
    id: 'prod_food_001',
    title: 'Organic Honey Almond Granola',
    vendor: 'Nature\'s Harvest',
    productType: 'Cereals',
    tags: ['granola', 'organic', 'breakfast', 'healthy', 'snack'],
    description: 'Crunchy clusters of whole grain oats with raw honey, sliced almonds, and dried cranberries. No artificial ingredients or preservatives.',
    images: [
      { id: 'img_f101', url: granolaOrganic },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_food_002',
    title: 'Cold-Pressed Green Detox Juice',
    vendor: 'Nature\'s Harvest',
    productType: 'Beverages',
    tags: ['juice', 'green', 'detox', 'cold-pressed', 'healthy'],
    description: 'Refreshing blend of kale, spinach, cucumber, celery, apple, and lemon. Cold-pressed to preserve nutrients and enzymes.',
    images: [
      { id: 'img_f102', url: juiceGreen },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_food_003',
    title: 'Artisan Dark Chocolate Bar 72%',
    vendor: 'Nature\'s Harvest',
    productType: 'Confectionery',
    tags: ['chocolate', 'dark', 'artisan', 'organic', 'treat'],
    description: 'Single-origin Ecuadorian cacao crafted into rich 72% dark chocolate. Smooth finish with notes of dried cherry and roasted coffee.',
    images: [
      { id: 'img_f103', url: chocolateArtisan },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_food_004',
    title: 'Single Origin Coffee Beans',
    vendor: 'Nature\'s Harvest',
    productType: 'Coffee',
    tags: ['coffee', 'beans', 'single-origin', 'premium', 'roasted'],
    description: 'Ethiopian Yirgacheffe whole beans with bright, fruity notes and floral aromatics. Medium roast, perfect for pour-over or espresso.',
    images: [
      { id: 'img_f104', url: coffeeBeans },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_food_005',
    title: 'Raw Organic Wildflower Honey',
    vendor: 'Nature\'s Harvest',
    productType: 'Spreads',
    tags: ['honey', 'organic', 'raw', 'natural', 'sweetener'],
    description: 'Pure, unfiltered honey harvested from sustainable apiaries. Rich floral taste with natural enzymes intact.',
    images: [
      { id: 'img_f105', url: honeyOrganic },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },

  // ============ HOME & INTERIOR PRODUCTS ============
  {
    id: 'prod_home_001',
    title: 'Ceramic Pour-Over Coffee Carafe',
    vendor: 'Modern Living',
    productType: 'Kitchen',
    tags: ['carafe', 'ceramic', 'pour-over', 'coffee', 'kitchen'],
    description: 'Minimalist ceramic carafe with integrated dripper. Heat-retaining design keeps coffee warm. Holds 600ml.',
    images: [
      { id: 'img_h001', url: carafeCeramic },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_home_002',
    title: 'Soy Wax Scented Candle',
    vendor: 'Modern Living',
    productType: 'Candles',
    tags: ['candle', 'soy wax', 'scented', 'home fragrance', 'decor'],
    description: 'Hand-poured soy wax candle with cotton wick. Notes of sandalwood, cedar, and vanilla. 50-hour burn time.',
    images: [
      { id: 'img_h002', url: candleSoy },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_home_003',
    title: 'Belgian Linen Throw Pillow',
    vendor: 'Modern Living',
    productType: 'Textiles',
    tags: ['pillow', 'linen', 'throw pillow', 'decor', 'living room'],
    description: 'Luxuriously soft Belgian linen pillow cover with hidden zipper. Oatmeal color suits any decor. 20x20 inches.',
    images: [
      { id: 'img_h003', url: pillowLinen },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_home_004',
    title: 'Geometric Concrete Planter',
    vendor: 'Modern Living',
    productType: 'Planters',
    tags: ['planter', 'concrete', 'geometric', 'modern', 'indoor'],
    description: 'Hand-cast concrete planter with geometric facets. Drainage hole included. Perfect for succulents and small plants.',
    images: [
      { id: 'img_h004', url: planterConcrete },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_home_005',
    title: 'Brushed Brass Table Lamp',
    vendor: 'Modern Living',
    productType: 'Lighting',
    tags: ['lamp', 'brass', 'table lamp', 'lighting', 'modern'],
    description: 'Mid-century inspired table lamp with mushroom dome shade. Brushed brass finish with touch dimmer. 14" height.',
    images: [
      { id: 'img_h005', url: lampBrass },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },

  // ============ SUPPLEMENTS PRODUCTS ============
  {
    id: 'prod_supp_001',
    title: 'Daily Multivitamin Gummies',
    vendor: 'VitalWell',
    productType: 'Vitamins',
    tags: ['vitamin', 'gummy', 'multivitamin', 'daily', 'wellness'],
    description: 'Complete daily nutrition in delicious citrus gummies. 23 essential vitamins and minerals. No artificial colors or flavors.',
    images: [
      { id: 'img_s001', url: vitaminsGummy },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_supp_002',
    title: 'Collagen Peptides Powder',
    vendor: 'VitalWell',
    productType: 'Collagen',
    tags: ['collagen', 'peptides', 'powder', 'beauty', 'supplement'],
    description: 'Grass-fed bovine collagen peptides for skin, hair, and joint support. Unflavored, dissolves easily in hot or cold beverages.',
    images: [
      { id: 'img_s002', url: collagenPowder },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_supp_003',
    title: 'Magnesium Sleep Capsules',
    vendor: 'VitalWell',
    productType: 'Sleep Support',
    tags: ['magnesium', 'sleep', 'capsules', 'relaxation', 'wellness'],
    description: 'Calming magnesium glycinate formula for restful sleep. Enhanced with L-theanine and chamomile. Non-habit forming.',
    images: [
      { id: 'img_s003', url: magnesiumCapsules },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_supp_004',
    title: 'Greens Superfood Blend',
    vendor: 'VitalWell',
    productType: 'Greens',
    tags: ['greens', 'superfood', 'powder', 'energy', 'nutrition'],
    description: '75+ vitamins, minerals, and whole-food sourced nutrients in one daily scoop. Supports energy, immunity, and gut health.',
    images: [
      { id: 'img_s004', url: greensSuperfood },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_supp_005',
    title: 'Omega-3 Fish Oil Softgels',
    vendor: 'VitalWell',
    productType: 'Omega-3',
    tags: ['omega-3', 'fish oil', 'softgels', 'heart health', 'supplement'],
    description: 'Triple-strength omega-3 from wild-caught fish. Supports heart, brain, and joint health. Molecularly distilled for purity.',
    images: [
      { id: 'img_s005', url: omegaFishOil },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },
];

export const mockJobs: GenerationJob[] = [
  {
    jobId: 'job_001',
    shopId: 'shop_123',
    productId: 'prod_fashion_001',
    productSnapshot: {
      productId: 'prod_fashion_001',
      title: 'Airlift High-Waist Legging',
      vendor: 'Alo Yoga',
      productType: 'Leggings',
      tags: ['yoga', 'leggings', 'high-waist', 'athleisure'],
      description: 'Sculpting high-waist leggings in signature Airlift fabric...',
      images: mockProducts[0].images,
    },
    templateId: 'tpl_001',
    templateSnapshot: mockTemplates[0],
    promptFinal: 'Professional athleisure photography. Airlift High-Waist Legging by Alo Yoga. Soft diffused studio lighting with subtle rim light. Full body shot showcasing fabric stretch and fit. Clean white seamless backdrop.',
    status: 'completed',
    requestedCount: 4,
    creditsUsed: 4,
    ratio: '4:5',
    quality: 'high',
    results: [
      {
        assetId: 'asset_001',
        jobId: 'job_001',
        imageUrl: leggingsBlack1,
        publishedToShopify: true,
        shopifyImageId: 'shopify_img_001',
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_002',
        jobId: 'job_001',
        imageUrl: leggingsPink1,
        publishedToShopify: false,
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_003',
        jobId: 'job_001',
        imageUrl: motoLeggings1,
        publishedToShopify: false,
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_004',
        jobId: 'job_001',
        imageUrl: sportsBraBlack1,
        publishedToShopify: false,
        createdAt: '2024-01-15T14:35:00Z',
      },
    ],
    createdAt: '2024-01-15T14:30:00Z',
    completedAt: '2024-01-15T14:35:00Z',
  },
  {
    jobId: 'job_002',
    shopId: 'shop_123',
    productId: 'prod_fashion_002',
    productSnapshot: {
      productId: 'prod_fashion_002',
      title: 'Alo Accolade Hoodie',
      vendor: 'Alo Yoga',
      productType: 'Hoodies',
      tags: ['hoodie', 'oversized', 'cozy', 'athleisure'],
      description: 'Oversized cropped hoodie in super-soft fleece...',
      images: mockProducts[1].images,
    },
    templateId: 'tpl_002',
    templateSnapshot: mockTemplates[1],
    promptFinal: 'Lifestyle streetwear photography. Alo Accolade Hoodie by Alo Yoga. Golden hour natural light with soft shadows. Urban street setting with modern architecture.',
    status: 'completed',
    requestedCount: 4,
    creditsUsed: 4,
    ratio: '4:5',
    quality: 'high',
    results: [
      {
        assetId: 'asset_005',
        jobId: 'job_002',
        imageUrl: hoodieGray1,
        publishedToShopify: true,
        shopifyImageId: 'shopify_img_002',
        createdAt: '2024-01-14T10:20:00Z',
      },
      {
        assetId: 'asset_006',
        jobId: 'job_002',
        imageUrl: croppedLongsleeve1,
        publishedToShopify: false,
        createdAt: '2024-01-14T10:20:00Z',
      },
    ],
    createdAt: '2024-01-14T10:15:00Z',
    completedAt: '2024-01-14T10:20:00Z',
  },
  {
    jobId: 'job_003',
    shopId: 'shop_123',
    productId: 'prod_fashion_003',
    productSnapshot: {
      productId: 'prod_fashion_003',
      title: 'Airlift Intrigue Bra',
      vendor: 'Alo Yoga',
      productType: 'Sports Bras',
      tags: ['sports bra', 'yoga', 'medium support'],
      description: 'Strappy back sports bra with medium support...',
      images: mockProducts[2].images,
    },
    templateId: 'tpl_001',
    templateSnapshot: mockTemplates[0],
    promptFinal: 'Studio athleisure photography. Airlift Intrigue Bra by Alo Yoga. Clean studio lighting highlighting strappy back design.',
    status: 'generating',
    requestedCount: 4,
    creditsUsed: 4,
    ratio: '4:5',
    quality: 'high',
    results: [],
    createdAt: '2024-01-15T16:00:00Z',
  },
  {
    jobId: 'job_004',
    shopId: 'shop_123',
    productId: 'prod_fashion_004',
    productSnapshot: {
      productId: 'prod_fashion_004',
      title: 'Micro Waffle Sundown Jogger',
      vendor: 'Alo Yoga',
      productType: 'Joggers',
      tags: ['joggers', 'waffle knit', 'lounge'],
      description: 'Ultra-soft micro waffle joggers with relaxed silhouette...',
      images: mockProducts[3].images,
    },
    templateId: 'tpl_002',
    templateSnapshot: mockTemplates[1],
    promptFinal: 'Lifestyle photography. Micro Waffle Sundown Jogger by Alo Yoga. Cozy home environment with natural light.',
    status: 'failed',
    requestedCount: 4,
    creditsUsed: 0,
    ratio: '4:5',
    quality: 'standard',
    results: [],
    errorMessage: 'Image generation timed out. Please try again.',
    createdAt: '2024-01-13T09:00:00Z',
  },
];

export const categoryLabels: Record<string, string> = {
  clothing: 'Clothing',
  cosmetics: 'Cosmetics',
  food: 'Food',
  home: 'Home & Interior',
  supplements: 'Supplements',
  universal: 'Universal',
};

// Virtual Try-On Mock Data
import type { ModelProfile, TryOnPose } from '@/types';

// Model preview images via storage
const modelFemaleSlimAsian = getLandingAssetUrl('models/model-female-slim-asian.jpg');
const modelFemaleAthleticBlack = getLandingAssetUrl('models/model-female-athletic-black.jpg');
const modelFemalePlussizeLatina = getLandingAssetUrl('models/model-female-plussize-latina.jpg');
const modelFemaleAverageEuropean = getLandingAssetUrl('models/model-female-average-european.jpg');
const modelMaleSlimMiddleeast = getLandingAssetUrl('models/model-male-slim-middleeast.jpg');
const modelMaleAthleticBlack = getLandingAssetUrl('models/model-male-athletic-black.jpg');
const modelMaleAverageAsian = getLandingAssetUrl('models/model-male-average-asian.jpg');
const modelMalePlussizeEuropean = getLandingAssetUrl('models/model-male-plussize-european.jpg');
const modelFemaleMatureEuropean = getLandingAssetUrl('models/model-female-mature-european.jpg');
const modelFemaleAthleticIndian = getLandingAssetUrl('models/model-female-athletic-indian.jpg');
const modelFemaleSlimNordic = getLandingAssetUrl('models/model-female-slim-nordic.jpg');
const modelFemaleAverageMiddleeast = getLandingAssetUrl('models/model-female-average-middleeast.jpg');
const modelFemalePlussizeAfrican = getLandingAssetUrl('models/model-female-plussize-african.jpg');
const modelFemalePetiteKorean = getLandingAssetUrl('models/model-female-petite-korean.jpg');
const modelMaleAthleticEuropean = getLandingAssetUrl('models/model-male-athletic-european.jpg');
const modelMaleAthleticLatino = getLandingAssetUrl('models/model-male-athletic-latino.jpg');
const modelMaleAthleticJapanese = getLandingAssetUrl('models/model-male-athletic-japanese.jpg');
const modelMaleSlimNordic = getLandingAssetUrl('models/model-male-slim-nordic.jpg');
const modelMaleAverageLatino = getLandingAssetUrl('models/model-male-average-latino.jpg');
const modelMalePlussizeAfrican = getLandingAssetUrl('models/model-male-plussize-african.jpg');
const modelMaleSlimIndian = getLandingAssetUrl('models/model-male-slim-indian.jpg');
const modelMaleAverageChinese = getLandingAssetUrl('models/model-male-average-chinese.jpg');
const modelMaleAthleticMixed = getLandingAssetUrl('models/model-male-athletic-mixed.jpg');
const modelMalePlussizeLatino = getLandingAssetUrl('models/model-male-plussize-latino.jpg');
const modelFemaleAthleticEuropean = getLandingAssetUrl('models/model-female-athletic-european.jpg');
const modelFemaleAthleticLatina = getLandingAssetUrl('models/model-female-athletic-latina.jpg');
const modelFemaleAverageAfrican = getLandingAssetUrl('models/model-female-average-african.jpg');
const modelFemalePlussizeJapanese = getLandingAssetUrl('models/model-female-plussize-japanese.jpg');
const modelFemaleAverageNordic = getLandingAssetUrl('models/model-female-average-nordic.jpg');
const modelFemaleSlimChinese = getLandingAssetUrl('models/model-female-slim-chinese.jpg');
const modelFemaleAthleticMixed = getLandingAssetUrl('models/model-female-athletic-mixed.jpg');
const modelFemalePlussizeMiddleeast = getLandingAssetUrl('models/model-female-plussize-middleeast.jpg');
const modelFemaleAverageIrish = getLandingAssetUrl('models/model-female-average-irish.jpg');
const modelMaleAthleticScottish = getLandingAssetUrl('models/model-male-athletic-scottish.jpg');

// Diverse mixed models (035-049, excluding removed models)
const model035Olivia = getLandingAssetUrl('models/model-035-olivia.jpg');
const model036Marcus = getLandingAssetUrl('models/model-036-marcus.jpg');
const model039Sofia = getLandingAssetUrl('models/model-039-sofia.jpg');
const model040Ethan = getLandingAssetUrl('models/model-040-ethan.jpg');
const model041Sienna = getLandingAssetUrl('models/model-041-sienna.jpg');
const model044Priya = getLandingAssetUrl('models/model-044-priya.jpg');
const model045Clara = getLandingAssetUrl('models/model-045-clara.jpg');
const model046Daphne = getLandingAssetUrl('models/model-046-daphne.jpg');
const model047Leo = getLandingAssetUrl('models/model-047-leo.jpg');
const model048Elise = getLandingAssetUrl('models/model-048-elise.jpg');
const model049Kai = getLandingAssetUrl('models/model-049-kai.jpg');

// Pose preview images via storage
const poseStudioFront = getLandingAssetUrl('poses/pose-studio-front.jpg');
const poseLifestyleWalking = getLandingAssetUrl('poses/pose-lifestyle-walking.jpg');
const poseEditorialDramatic = getLandingAssetUrl('poses/pose-editorial-dramatic.jpg');
const poseStreetwearUrban = getLandingAssetUrl('poses/pose-streetwear-urban.jpg');
const poseLifestyleSeated = getLandingAssetUrl('poses/pose-lifestyle-seated.jpg');
const poseStudioProfile = getLandingAssetUrl('poses/pose-studio-profile.jpg');
const poseStudioMovement = getLandingAssetUrl('poses/pose-studio-movement.jpg');
const poseLifestyleGarden = getLandingAssetUrl('poses/pose-lifestyle-garden.jpg');
const poseEditorialMinimal = getLandingAssetUrl('poses/pose-editorial-minimal.jpg');
const poseStreetwearStairs = getLandingAssetUrl('poses/pose-streetwear-stairs.jpg');
const poseStudioBack = getLandingAssetUrl('poses/pose-studio-back.jpg');
const poseStudioCloseup = getLandingAssetUrl('poses/pose-studio-closeup.jpg');
const poseStudioArms = getLandingAssetUrl('poses/pose-studio-arms.jpg');
const poseLifestyleCoffee = getLandingAssetUrl('poses/pose-lifestyle-coffee.jpg');
const poseLifestyleBeach = getLandingAssetUrl('poses/pose-lifestyle-beach.jpg');
const poseLifestylePark = getLandingAssetUrl('poses/pose-lifestyle-park.jpg');
const poseLifestyleRooftop = getLandingAssetUrl('poses/pose-lifestyle-rooftop.jpg');
const poseEditorialWindow = getLandingAssetUrl('poses/pose-editorial-window.jpg');
const poseEditorialMoody = getLandingAssetUrl('poses/pose-editorial-moody.jpg');
const poseEditorialArtistic = getLandingAssetUrl('poses/pose-editorial-artistic.jpg');
const poseEditorialMotion = getLandingAssetUrl('poses/pose-editorial-motion.jpg');
const poseStreetwearBasketball = getLandingAssetUrl('poses/pose-streetwear-basketball.jpg');
const poseStreetwearUnderpass = getLandingAssetUrl('poses/pose-streetwear-underpass.jpg');
const poseStreetwearNeon = getLandingAssetUrl('poses/pose-streetwear-neon.jpg');

// Male pose previews
const poseStudioFrontMale = getLandingAssetUrl('poses/pose-studio-front-male.jpg');
const poseStudioProfileMale = getLandingAssetUrl('poses/pose-studio-profile-male.jpg');
const poseStudioMovementMale = getLandingAssetUrl('poses/pose-studio-movement-male.jpg');
const poseLifestyleWalkingMale = getLandingAssetUrl('poses/pose-lifestyle-walking-male.jpg');
const poseLifestyleSeatedMale = getLandingAssetUrl('poses/pose-lifestyle-seated-male.jpg');
const poseLifestyleGardenMale = getLandingAssetUrl('poses/pose-lifestyle-garden-male.jpg');
const poseEditorialDramaticMale = getLandingAssetUrl('poses/pose-editorial-dramatic-male.jpg');
const poseEditorialMinimalMale = getLandingAssetUrl('poses/pose-editorial-minimal-male.jpg');
const poseStreetwearUrbanMale = getLandingAssetUrl('poses/pose-streetwear-urban-male.jpg');
const poseStreetwearStairsMale = getLandingAssetUrl('poses/pose-streetwear-stairs-male.jpg');
const poseStudioBackMale = getLandingAssetUrl('poses/pose-studio-back-male.jpg');
const poseStudioCloseupMale = getLandingAssetUrl('poses/pose-studio-closeup-male.jpg');
const poseStudioArmsMale = getLandingAssetUrl('poses/pose-studio-arms-male.jpg');
const poseLifestyleCoffeeMale = getLandingAssetUrl('poses/pose-lifestyle-coffee-male.jpg');
const poseLifestyleBeachMale = getLandingAssetUrl('poses/pose-lifestyle-beach-male.jpg');
const poseLifestyleParkMale = getLandingAssetUrl('poses/pose-lifestyle-park-male.jpg');
const poseLifestyleRooftopMale = getLandingAssetUrl('poses/pose-lifestyle-rooftop-male.jpg');
const poseEditorialWindowMale = getLandingAssetUrl('poses/pose-editorial-window-male.jpg');
const poseEditorialMoodyMale = getLandingAssetUrl('poses/pose-editorial-moody-male.jpg');
const poseEditorialArtisticMale = getLandingAssetUrl('poses/pose-editorial-artistic-male.jpg');
const poseEditorialMotionMale = getLandingAssetUrl('poses/pose-editorial-motion-male.jpg');
const poseStreetwearBasketballMale = getLandingAssetUrl('poses/pose-streetwear-basketball-male.jpg');
const poseStreetwearUnderpassMale = getLandingAssetUrl('poses/pose-streetwear-underpass-male.jpg');
const poseStreetwearNeonMale = getLandingAssetUrl('poses/pose-streetwear-neon-male.jpg');
const poseLifestyleGymMale = getLandingAssetUrl('poses/pose-lifestyle-gym-male.jpg');
const poseStreetwearShoppingMale = getLandingAssetUrl('poses/pose-streetwear-shopping-male.jpg');
const poseLifestyleResortMale = getLandingAssetUrl('poses/pose-lifestyle-resort-male.jpg');
const poseEditorialGalleryMale = getLandingAssetUrl('poses/pose-editorial-gallery-male.jpg');
const poseLifestyleAutumnMale = getLandingAssetUrl('poses/pose-lifestyle-autumn-male.jpg');
const poseEditorialWarehouseMale = getLandingAssetUrl('poses/pose-editorial-warehouse-male.jpg');

// Scene environment images
const templateClothingStudio = getLandingAssetUrl('templates/clothing-studio.jpg');
const templateUniversalGradient = getLandingAssetUrl('templates/universal-gradient.jpg');
const templateUniversalClean = getLandingAssetUrl('templates/universal-clean.jpg');
const showcaseSkincareSerumMarble = getLandingAssetUrl('showcase/skincare-serum-marble.jpg');
const showcaseFoodPastaRustic = getLandingAssetUrl('showcase/food-pasta-rustic.jpg');
const showcaseHomeConcrete = getLandingAssetUrl('templates/home-concrete.jpg');
const templateClothingFlatlay = getLandingAssetUrl('templates/clothing-flatlay.jpg');
const templateCosmeticsPastel = getLandingAssetUrl('templates/cosmetics-pastel.jpg');
const showcaseFoodCoffeeArtisan = getLandingAssetUrl('showcase/food-coffee-artisan.jpg');
const showcaseFoodHoneyFarmhouse = getLandingAssetUrl('showcase/food-honey-farmhouse.jpg');
const showcaseFoodBreadBakery = getLandingAssetUrl('showcase/food-bread-bakery.jpg');
const showcaseHomeVasesJapandi = getLandingAssetUrl('showcase/home-vases-japandi.jpg');
const showcaseHomeCandleEvening = getLandingAssetUrl('showcase/home-candle-evening.jpg');
const showcaseHomeBedroomMorning = getLandingAssetUrl('showcase/home-bedroom-morning.jpg');
const showcaseSkincareOilBathroom = getLandingAssetUrl('showcase/skincare-oil-bathroom.jpg');
const showcaseSkincareCreamBotanical = getLandingAssetUrl('showcase/skincare-cream-botanical.jpg');
const showcaseFashionDressGarden = getLandingAssetUrl('showcase/fashion-dress-garden.jpg');
const showcaseFashionDressBotanical = getLandingAssetUrl('showcase/fashion-dress-botanical.jpg');

export const mockModels: ModelProfile[] = [
  { modelId: 'model_001', name: 'Yuki', gender: 'female', bodyType: 'slim', ethnicity: 'East Asian', ageRange: 'young-adult', previewUrl: modelFemaleSlimAsian },
  { modelId: 'model_002', name: 'Amara', gender: 'female', bodyType: 'athletic', ethnicity: 'Black African', ageRange: 'adult', previewUrl: modelFemaleAthleticBlack },
  { modelId: 'model_003', name: 'Isabella', gender: 'female', bodyType: 'plus-size', ethnicity: 'Latina', ageRange: 'young-adult', previewUrl: modelFemalePlussizeLatina },
  { modelId: 'model_004', name: 'Charlotte', gender: 'female', bodyType: 'average', ethnicity: 'European', ageRange: 'adult', previewUrl: modelFemaleAverageEuropean },
  { modelId: 'model_009', name: 'Victoria', gender: 'female', bodyType: 'slim', ethnicity: 'European', ageRange: 'mature', previewUrl: modelFemaleMatureEuropean },
  { modelId: 'model_010', name: 'Priya', gender: 'female', bodyType: 'athletic', ethnicity: 'South Asian', ageRange: 'young-adult', previewUrl: modelFemaleAthleticIndian },
  { modelId: 'model_011', name: 'Ingrid', gender: 'female', bodyType: 'slim', ethnicity: 'Nordic', ageRange: 'young-adult', previewUrl: modelFemaleSlimNordic },
  { modelId: 'model_012', name: 'Layla', gender: 'female', bodyType: 'average', ethnicity: 'Middle Eastern', ageRange: 'adult', previewUrl: modelFemaleAverageMiddleeast },
  { modelId: 'model_013', name: 'Nia', gender: 'female', bodyType: 'plus-size', ethnicity: 'Black African', ageRange: 'young-adult', previewUrl: modelFemalePlussizeAfrican },
  { modelId: 'model_014', name: 'Soo-Min', gender: 'female', bodyType: 'slim', ethnicity: 'Korean', ageRange: 'young-adult', previewUrl: modelFemalePetiteKorean },
  { modelId: 'model_005', name: 'Omar', gender: 'male', bodyType: 'slim', ethnicity: 'Middle Eastern', ageRange: 'young-adult', previewUrl: modelMaleSlimMiddleeast },
  { modelId: 'model_006', name: 'Marcus', gender: 'male', bodyType: 'athletic', ethnicity: 'Black African', ageRange: 'adult', previewUrl: modelMaleAthleticBlack },
  { modelId: 'model_007', name: 'Jin', gender: 'male', bodyType: 'average', ethnicity: 'East Asian', ageRange: 'young-adult', previewUrl: modelMaleAverageAsian },
  { modelId: 'model_008', name: 'Henrik', gender: 'male', bodyType: 'plus-size', ethnicity: 'European', ageRange: 'mature', previewUrl: modelMalePlussizeEuropean },
  { modelId: 'model_015', name: 'Liam', gender: 'male', bodyType: 'athletic', ethnicity: 'European', ageRange: 'adult', previewUrl: modelMaleAthleticEuropean },
  { modelId: 'model_016', name: 'Rafael', gender: 'male', bodyType: 'athletic', ethnicity: 'Latino', ageRange: 'young-adult', previewUrl: modelMaleAthleticLatino },
  { modelId: 'model_017', name: 'Kenji', gender: 'male', bodyType: 'athletic', ethnicity: 'Japanese', ageRange: 'adult', previewUrl: modelMaleAthleticJapanese },
  { modelId: 'model_018', name: 'Anders', gender: 'male', bodyType: 'slim', ethnicity: 'Nordic', ageRange: 'young-adult', previewUrl: modelMaleSlimNordic },
  { modelId: 'model_019', name: 'Diego', gender: 'male', bodyType: 'average', ethnicity: 'Latino', ageRange: 'adult', previewUrl: modelMaleAverageLatino },
  { modelId: 'model_020', name: 'Jamal', gender: 'male', bodyType: 'plus-size', ethnicity: 'Black African', ageRange: 'adult', previewUrl: modelMalePlussizeAfrican },
  { modelId: 'model_021', name: 'Ravi', gender: 'male', bodyType: 'slim', ethnicity: 'South Asian', ageRange: 'adult', previewUrl: modelMaleSlimIndian },
  { modelId: 'model_022', name: 'Chen Wei', gender: 'male', bodyType: 'average', ethnicity: 'Chinese', ageRange: 'mature', previewUrl: modelMaleAverageChinese },
  { modelId: 'model_023', name: 'Tyler', gender: 'male', bodyType: 'athletic', ethnicity: 'Mixed', ageRange: 'young-adult', previewUrl: modelMaleAthleticMixed },
  { modelId: 'model_024', name: 'Mateo', gender: 'male', bodyType: 'plus-size', ethnicity: 'Latino', ageRange: 'adult', previewUrl: modelMalePlussizeLatino },
  { modelId: 'model_025', name: 'Sofia', gender: 'female', bodyType: 'athletic', ethnicity: 'European', ageRange: 'adult', previewUrl: modelFemaleAthleticEuropean },
  { modelId: 'model_026', name: 'Elena', gender: 'female', bodyType: 'athletic', ethnicity: 'Latina', ageRange: 'young-adult', previewUrl: modelFemaleAthleticLatina },
  { modelId: 'model_027', name: 'Maya', gender: 'female', bodyType: 'average', ethnicity: 'Black African', ageRange: 'adult', previewUrl: modelFemaleAverageAfrican },
  { modelId: 'model_028', name: 'Akiko', gender: 'female', bodyType: 'plus-size', ethnicity: 'Japanese', ageRange: 'adult', previewUrl: modelFemalePlussizeJapanese },
  { modelId: 'model_029', name: 'Freya', gender: 'female', bodyType: 'average', ethnicity: 'Nordic', ageRange: 'young-adult', previewUrl: modelFemaleAverageNordic },
  { modelId: 'model_030', name: 'Mei', gender: 'female', bodyType: 'slim', ethnicity: 'Chinese', ageRange: 'mature', previewUrl: modelFemaleSlimChinese },
  { modelId: 'model_031', name: 'Zara', gender: 'female', bodyType: 'athletic', ethnicity: 'Mixed', ageRange: 'young-adult', previewUrl: modelFemaleAthleticMixed },
  { modelId: 'model_032', name: 'Fatima', gender: 'female', bodyType: 'plus-size', ethnicity: 'Middle Eastern', ageRange: 'adult', previewUrl: modelFemalePlussizeMiddleeast },
  { modelId: 'model_033', name: 'Sienna', gender: 'female', bodyType: 'average', ethnicity: 'Irish', ageRange: 'young-adult', previewUrl: modelFemaleAverageIrish },
  { modelId: 'model_034', name: 'Rowan', gender: 'male', bodyType: 'athletic', ethnicity: 'Scottish', ageRange: 'adult', previewUrl: modelMaleAthleticScottish },
  { modelId: 'model_035', name: 'Olivia', gender: 'female', bodyType: 'slim', ethnicity: 'American', ageRange: 'young-adult', previewUrl: model035Olivia },
  { modelId: 'model_036', name: 'Marcus', gender: 'male', bodyType: 'athletic', ethnicity: 'African American', ageRange: 'adult', previewUrl: model036Marcus },
  { modelId: 'model_039', name: 'Sofia', gender: 'female', bodyType: 'athletic', ethnicity: 'Spanish', ageRange: 'adult', previewUrl: model039Sofia },
  { modelId: 'model_040', name: 'Ethan', gender: 'male', bodyType: 'athletic', ethnicity: 'American', ageRange: 'young-adult', previewUrl: model040Ethan },
  { modelId: 'model_041', name: 'Sienna', gender: 'female', bodyType: 'average', ethnicity: 'Italian', ageRange: 'mature', previewUrl: model041Sienna },
  { modelId: 'model_044', name: 'Priya', gender: 'female', bodyType: 'athletic', ethnicity: 'Indian', ageRange: 'adult', previewUrl: model044Priya },
  { modelId: 'model_045', name: 'Clara', gender: 'female', bodyType: 'average', ethnicity: 'German', ageRange: 'young-adult', previewUrl: model045Clara },
  { modelId: 'model_046', name: 'Daphne', gender: 'female', bodyType: 'slim', ethnicity: 'Greek', ageRange: 'adult', previewUrl: model046Daphne },
  { modelId: 'model_047', name: 'Leo', gender: 'male', bodyType: 'athletic', ethnicity: 'Brazilian', ageRange: 'young-adult', previewUrl: model047Leo },
  { modelId: 'model_048', name: 'Elise', gender: 'female', bodyType: 'average', ethnicity: 'Dutch', ageRange: 'mature', previewUrl: model048Elise },
  { modelId: 'model_049', name: 'Kai', gender: 'male', bodyType: 'average', ethnicity: 'Hawaiian/Mixed', ageRange: 'adult', previewUrl: model049Kai },
];

export const mockTryOnPoses: TryOnPose[] = [
  { poseId: 'pose_001', name: 'Studio Front', category: 'studio', description: 'Classic front view on clean white background', promptHint: 'Model standing facing camera in a classic lookbook pose, full body front view, relaxed shoulders, arms naturally at sides, clean white studio background', previewUrl: poseStudioFront, previewUrlMale: poseStudioFrontMale },
  { poseId: 'pose_002', name: 'Studio Profile', category: 'studio', description: 'Elegant three-quarter turn with soft shadows', promptHint: 'Model in elegant three-quarter turn, one shoulder slightly forward, chin tilted, professional studio lighting with soft shadows', previewUrl: poseStudioProfile, previewUrlMale: poseStudioProfileMale },
  { poseId: 'pose_007', name: 'Studio Movement', category: 'studio', description: 'Walking pose with natural fabric flow', promptHint: 'Model mid-stride walking naturally, arms in motion, fabric flowing with movement, clean white studio background', previewUrl: poseStudioMovement, previewUrlMale: poseStudioMovementMale },
  { poseId: 'pose_003', name: 'Urban Walking', category: 'lifestyle', description: 'Candid street style with golden hour light', promptHint: 'Model walking confidently down a city street, mid-stride with natural arm swing, candid street style, golden hour warm light casting long shadows', previewUrl: poseLifestyleWalking, previewUrlMale: poseLifestyleWalkingMale },
  { poseId: 'pose_004', name: 'Relaxed Seated', category: 'lifestyle', description: 'Casual seated pose in modern interior', promptHint: 'Model sitting casually in a modern chair, one leg crossed over the other, leaning back relaxed, natural window light in contemporary interior', previewUrl: poseLifestyleSeated, previewUrlMale: poseLifestyleSeatedMale },
  { poseId: 'pose_008', name: 'Garden Natural', category: 'lifestyle', description: 'Relaxed pose among lush greenery', promptHint: 'Model standing relaxed among lush greenery in a botanical garden, one hand gently touching a leaf, soft natural light filtering through foliage', previewUrl: poseLifestyleGarden, previewUrlMale: poseLifestyleGardenMale },
  { poseId: 'pose_005', name: 'Editorial Dramatic', category: 'editorial', description: 'High-fashion stance with dramatic lighting', promptHint: 'Model in a powerful high-fashion stance, sharp angular pose with one hand on hip, dramatic side lighting against a dark moody backdrop', previewUrl: poseEditorialDramatic, previewUrlMale: poseEditorialDramaticMale },
  { poseId: 'pose_009', name: 'Editorial Minimal', category: 'editorial', description: 'Elegant minimal pose with geometric shadows', promptHint: 'Model standing still in an elegant minimal pose, hands loosely at sides, geometric window shadows casting patterns across body and backdrop', previewUrl: poseEditorialMinimal, previewUrlMale: poseEditorialMinimalMale },
  { poseId: 'pose_006', name: 'Street Lean', category: 'streetwear', description: 'Casual lean against urban wall', promptHint: 'Model leaning casually against a graffiti-covered wall, one foot propped up, arms crossed or thumbs in pockets, hip-hop inspired urban attitude', previewUrl: poseStreetwearUrban, previewUrlMale: poseStreetwearUrbanMale },
  { poseId: 'pose_010', name: 'Urban Stairs', category: 'streetwear', description: 'Seated on concrete stairs, urban vibe', promptHint: 'Model sitting on concrete stairs, elbows resting on knees, relaxed forward lean with a cool confident expression, industrial urban vibe', previewUrl: poseStreetwearStairs, previewUrlMale: poseStreetwearStairsMale },
  { poseId: 'pose_011', name: 'Studio Back View', category: 'studio', description: 'Over-the-shoulder rear view', promptHint: 'Model with back to camera, looking over one shoulder, shoulders slightly angled to show garment rear details, clean studio backdrop', previewUrl: poseStudioBack, previewUrlMale: poseStudioBackMale },
  { poseId: 'pose_012', name: 'Studio Close-Up', category: 'studio', description: 'Torso detail shot highlighting fabric', promptHint: 'Close-up torso shot of model, hands adjusting collar or hem, highlighting fabric texture and garment fit details, tight studio crop', previewUrl: poseStudioCloseup, previewUrlMale: poseStudioCloseupMale },
  { poseId: 'pose_013', name: 'Studio Crossed Arms', category: 'studio', description: 'Confident crossed-arms pose', promptHint: 'Model standing with arms confidently crossed over chest, direct eye contact with camera, strong upright posture, clean studio background', previewUrl: poseStudioArms, previewUrlMale: poseStudioArmsMale },
  { poseId: 'pose_014', name: 'Coffee Shop Casual', category: 'lifestyle', description: 'Relaxed café setting with morning light', promptHint: 'Model sitting at a café table holding a coffee cup, relaxed posture with a soft smile, natural morning light through large café windows', previewUrl: poseLifestyleCoffee, previewUrlMale: poseLifestyleCoffeeMale },
  { poseId: 'pose_015', name: 'Beach Sunset', category: 'lifestyle', description: 'Golden hour coastal walk', promptHint: 'Model walking barefoot along the shore at golden hour, wind gently blowing hair, one hand brushing hair back, relaxed coastal lifestyle mood', previewUrl: poseLifestyleBeach, previewUrlMale: poseLifestyleBeachMale },
  { poseId: 'pose_016', name: 'Park Bench', category: 'lifestyle', description: 'Casual outdoor pose on park bench', promptHint: 'Model sitting casually on a wooden park bench, one arm draped over the backrest, legs relaxed, lush greenery and dappled sunlight', previewUrl: poseLifestylePark, previewUrlMale: poseLifestyleParkMale },
  { poseId: 'pose_017', name: 'Rooftop City', category: 'lifestyle', description: 'City skyline views at dusk', promptHint: 'Model standing at a rooftop railing gazing over the city skyline, relaxed lean on the rail, twilight sky with city lights glowing below', previewUrl: poseLifestyleRooftop, previewUrlMale: poseLifestyleRooftopMale },
  { poseId: 'pose_018', name: 'Editorial Window', category: 'editorial', description: 'Silhouette against floor-to-ceiling window', promptHint: 'Model standing in silhouette against a floor-to-ceiling window, one hand on the glass, contemplative pose bathed in natural backlight', previewUrl: poseEditorialWindow, previewUrlMale: poseEditorialWindowMale },
  { poseId: 'pose_019', name: 'Editorial Moody', category: 'editorial', description: 'Dramatic single-light portrait', promptHint: 'Model with face half-lit by a single dramatic side light, chin slightly lowered, intense gaze, low-key moody studio atmosphere', previewUrl: poseEditorialMoody, previewUrlMale: poseEditorialMoodyMale },
  { poseId: 'pose_020', name: 'Editorial Artistic', category: 'editorial', description: 'Expressive high-fashion with bold backdrop', promptHint: 'Model in an expressive high-fashion pose, body twisted artistically, one arm extended, abstract geometric shapes and bold colors in backdrop', previewUrl: poseEditorialArtistic, previewUrlMale: poseEditorialArtisticMale },
  { poseId: 'pose_021', name: 'Editorial Movement', category: 'editorial', description: 'Dynamic spinning with flowing fabric', promptHint: 'Model in dynamic spinning or turning motion, hair and fabric flowing with movement, subtle motion blur emphasizing energy and grace', previewUrl: poseEditorialMotion, previewUrlMale: poseEditorialMotionMale },
  { poseId: 'pose_022', name: 'Basketball Court', category: 'streetwear', description: 'Athletic casual on basketball court', promptHint: 'Model standing on a basketball court, one foot on a ball or leaning against chain-link fence, athletic casual stance, urban playground vibe', previewUrl: poseStreetwearBasketball, previewUrlMale: poseStreetwearBasketballMale },
  { poseId: 'pose_023', name: 'Industrial Underpass', category: 'streetwear', description: 'Dramatic tunnel with strong shadows', promptHint: 'Model walking through an industrial underpass tunnel, hands in pockets, dramatic overhead lighting creating strong shadows on concrete walls', previewUrl: poseStreetwearUnderpass, previewUrlMale: poseStreetwearUnderpassMale },
  { poseId: 'pose_024', name: 'Night Neon', category: 'streetwear', description: 'Neon-lit night scene with colorful glow', promptHint: 'Model standing under neon signs at night, colorful glow reflecting on skin and clothing, relaxed urban pose with hands in jacket pockets', previewUrl: poseStreetwearNeon, previewUrlMale: poseStreetwearNeonMale },
  { poseId: 'pose_025', name: 'Gym & Fitness', category: 'lifestyle', description: 'Athletic setting with modern gym', promptHint: 'Model in active stance near gym equipment, confident athletic pose with hands on hips or gripping a weight, natural light streaming into modern fitness space', previewUrl: poseLifestyleRooftop, previewUrlMale: poseLifestyleGymMale },
  { poseId: 'pose_026', name: 'Shopping District', category: 'streetwear', description: 'Walking through busy shopping area', promptHint: 'Model walking through a busy shopping district carrying bags, mid-stride with a confident smile, storefronts and street energy in background', previewUrl: poseStreetwearStairs, previewUrlMale: poseStreetwearShoppingMale },
  { poseId: 'pose_027', name: 'Resort Poolside', category: 'lifestyle', description: 'Luxury resort pool with warm light', promptHint: 'Model lounging on a poolside daybed at a luxury resort, relaxed summer pose with sunglasses, warm golden afternoon light reflecting off turquoise water', previewUrl: poseLifestyleBeach, previewUrlMale: poseLifestyleResortMale },
  { poseId: 'pose_028', name: 'Art Gallery', category: 'editorial', description: 'Contemplative pose in gallery space', promptHint: 'Model standing contemplatively in a white gallery space, looking at an art installation, one hand resting on chin, clean architectural lines', previewUrl: poseEditorialMinimal, previewUrlMale: poseEditorialGalleryMale },
  { poseId: 'pose_029', name: 'Autumn Park', category: 'lifestyle', description: 'Fall foliage with warm golden tones', promptHint: 'Model walking along a tree-lined park path surrounded by fall foliage, hands in pockets, warm golden tones and soft dappled light filtering through autumn leaves', previewUrl: poseLifestylePark, previewUrlMale: poseLifestyleAutumnMale },
  { poseId: 'pose_030', name: 'Warehouse Loft', category: 'editorial', description: 'Industrial loft with exposed brick', promptHint: 'Model leaning against exposed brick in a raw industrial loft, arms folded, large windows casting directional light across the space', previewUrl: poseEditorialWindow, previewUrlMale: poseEditorialWarehouseMale },
  // === PRODUCT ENVIRONMENT SCENES ===
  { poseId: 'scene_001', name: 'White Seamless', category: 'clean-studio', description: 'Pure white infinity backdrop, even lighting, e-commerce ready', promptHint: 'Pure white infinity backdrop, even lighting, e-commerce ready', previewUrl: templateClothingStudio },
  { poseId: 'scene_002', name: 'Gradient Backdrop', category: 'clean-studio', description: 'Smooth gradient background for premium product positioning', promptHint: 'Smooth gradient background for premium product positioning', previewUrl: templateUniversalGradient },
  { poseId: 'scene_003', name: 'Minimalist Platform', category: 'clean-studio', description: 'Clean pedestal or platform with soft shadows', promptHint: 'Clean pedestal or platform with soft shadows', previewUrl: templateUniversalClean },
  { poseId: 'scene_004', name: 'Marble Surface', category: 'surface', description: 'Polished marble surface with elegant reflections', promptHint: 'Polished marble surface with elegant reflections', previewUrl: showcaseSkincareSerumMarble },
  { poseId: 'scene_005', name: 'Wooden Table', category: 'surface', description: 'Warm rustic wood surface with natural grain texture', promptHint: 'Warm rustic wood surface with natural grain texture', previewUrl: showcaseFoodPastaRustic },
  { poseId: 'scene_006', name: 'Concrete Slab', category: 'surface', description: 'Raw concrete surface for industrial-modern aesthetic', promptHint: 'Raw concrete surface for industrial-modern aesthetic', previewUrl: showcaseHomeConcrete },
  { poseId: 'scene_007', name: 'Overhead Clean', category: 'flat-lay', description: 'Top-down view on clean surface, minimal props', promptHint: 'Top-down view on clean surface, minimal props', previewUrl: templateClothingFlatlay },
  { poseId: 'scene_008', name: 'Styled Flat Lay', category: 'flat-lay', description: 'Curated overhead arrangement with complementary props', promptHint: 'Curated overhead arrangement with complementary props', previewUrl: templateCosmeticsPastel },
  { poseId: 'scene_009', name: 'Rustic Kitchen', category: 'kitchen', description: 'Farmhouse-style kitchen with warm natural light', promptHint: 'Farmhouse-style kitchen with warm natural light', previewUrl: showcaseFoodHoneyFarmhouse },
  { poseId: 'scene_010', name: 'Bright Countertop', category: 'kitchen', description: 'Clean, bright kitchen countertop with modern styling', promptHint: 'Clean, bright kitchen countertop with modern styling', previewUrl: showcaseFoodBreadBakery },
  { poseId: 'scene_011', name: 'Café Table', category: 'kitchen', description: 'Artisan café setting with coffee culture vibes', promptHint: 'Artisan café setting with coffee culture vibes', previewUrl: showcaseFoodCoffeeArtisan },
  { poseId: 'scene_012', name: 'Japandi Shelf', category: 'living-space', description: 'Zen-inspired minimal shelf with natural materials', promptHint: 'Zen-inspired minimal shelf with natural materials', previewUrl: showcaseHomeVasesJapandi },
  { poseId: 'scene_013', name: 'Cozy Evening', category: 'living-space', description: 'Warm candlelit interior with soft textiles', promptHint: 'Warm candlelit interior with soft textiles', previewUrl: showcaseHomeCandleEvening },
  { poseId: 'scene_014', name: 'Morning Bedroom', category: 'living-space', description: 'Bright morning light streaming into a styled bedroom', promptHint: 'Bright morning light streaming into a styled bedroom', previewUrl: showcaseHomeBedroomMorning },
  { poseId: 'scene_015', name: 'Marble Vanity', category: 'bathroom', description: 'Elegant bathroom vanity with marble surfaces', promptHint: 'Elegant bathroom vanity with marble surfaces', previewUrl: showcaseSkincareOilBathroom },
  { poseId: 'scene_016', name: 'Bright Bathroom', category: 'bathroom', description: 'Clean, bright bathroom with natural light and botanicals', promptHint: 'Clean, bright bathroom with natural light and botanicals', previewUrl: showcaseSkincareCreamBotanical },
  { poseId: 'scene_017', name: 'Garden Setting', category: 'botanical', description: 'Lush garden environment with natural greenery', promptHint: 'Lush garden environment with natural greenery', previewUrl: showcaseFashionDressGarden },
  { poseId: 'scene_018', name: 'Botanical Arrangement', category: 'botanical', description: 'Styled botanical backdrop with leaves and flowers', promptHint: 'Styled botanical backdrop with leaves and flowers', previewUrl: showcaseFashionDressBotanical },
];

export const poseCategoryLabels: Record<string, string> = {
  studio: 'Studio',
  lifestyle: 'Lifestyle',
  editorial: 'Editorial',
  streetwear: 'Streetwear',
  'clean-studio': 'Clean Studio',
  surface: 'Surface & Texture',
  'flat-lay': 'Flat Lay',
  kitchen: 'Kitchen & Dining',
  'living-space': 'Living Space',
  bathroom: 'Bathroom & Vanity',
  botanical: 'Botanical',
};

export const bodyTypeLabels: Record<string, string> = {
  slim: 'Slim',
  athletic: 'Athletic',
  average: 'Average',
  'plus-size': 'Plus Size',
};

export const genderLabels: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  'non-binary': 'Non-Binary',
};

// Pricing Plans
export const pricingPlans: PricingPlan[] = [
  {
    planId: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 20,
    features: [
      'All workflows',
      'High quality images',
      '1 Brand Profile',
      '1 product upload',
    ],
    ctaText: 'Current Plan',
  },
  {
    planId: 'starter',
    name: 'Starter',
    monthlyPrice: 39,
    annualPrice: 372,
    credits: 500,
    features: [
      'Try-On mode',
      'Video Generation',
      '3 Brand Profiles',
      'Up to 10 products',
      'High quality images',
    ],
    ctaText: 'Get Starter',
  },
  {
    planId: 'growth',
    name: 'Growth',
    monthlyPrice: 79,
    annualPrice: 756,
    credits: 1500,
    features: [
      'Priority queue',
      'Video Generation',
      '10 Brand Profiles',
      'Up to 100 products',
      'All workflows',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Get Growth',
  },
  {
    planId: 'pro',
    name: 'Pro',
    monthlyPrice: 179,
    annualPrice: 1716,
    credits: 4500,
    features: [
      'Video Generation',
      'Creative Drops',
      'Unlimited profiles',
      'Unlimited products',
    ],
    ctaText: 'Get Pro',
  },
  {
    planId: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 'unlimited',
    features: [
      'Unlimited visuals',
      'All Pro features',
      'Custom SLA',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
    ],
    isEnterprise: true,
    ctaText: 'Contact Sales',
  },
];

// Credit Top-up Packs
export const creditPacks: CreditPack[] = [
  {
    packId: 'pack_200',
    credits: 200,
    price: 15,
    pricePerCredit: 0.075,
  },
  {
    packId: 'pack_500',
    credits: 500,
    price: 29,
    pricePerCredit: 0.058,
    popular: true,
  },
  {
    packId: 'pack_1500',
    credits: 1500,
    price: 69,
    pricePerCredit: 0.046,
  },
];
