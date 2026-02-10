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

// Import product images
import leggingsBlack1 from '@/assets/products/leggings-black-1.jpg';
import leggingsPink1 from '@/assets/products/leggings-pink-1.jpg';
import hoodieGray1 from '@/assets/products/hoodie-gray-1.jpg';
import sportsBraBlack1 from '@/assets/products/sports-bra-black-1.jpg';
import joggersBeige1 from '@/assets/products/joggers-beige-1.jpg';
import tankWhite1 from '@/assets/products/tank-white-1.jpg';
import motoLeggings1 from '@/assets/products/moto-leggings-1.jpg';
import croppedLongsleeve1 from '@/assets/products/cropped-longsleeve-1.jpg';
import fauxFurJacket1 from '@/assets/products/faux-fur-jacket-1.jpg';

// Cosmetics product images
import serumVitaminC from '@/assets/products/serum-vitamin-c.jpg';
import creamHyaluronic from '@/assets/products/cream-hyaluronic.jpg';
import lipstickMatte from '@/assets/products/lipstick-matte.jpg';
import retinolTreatment from '@/assets/products/retinol-treatment.jpg';
import powderSetting from '@/assets/products/powder-setting.jpg';

// Food & Beverage product images
import granolaOrganic from '@/assets/products/granola-organic.jpg';
import juiceGreen from '@/assets/products/juice-green.jpg';
import chocolateArtisan from '@/assets/products/chocolate-artisan.jpg';
import coffeeBeans from '@/assets/products/coffee-beans.jpg';
import honeyOrganic from '@/assets/products/honey-organic.jpg';

// Home & Interior product images
import carafeCeramic from '@/assets/products/carafe-ceramic.jpg';
import candleSoy from '@/assets/products/candle-soy.jpg';
import pillowLinen from '@/assets/products/pillow-linen.jpg';
import planterConcrete from '@/assets/products/planter-concrete.jpg';
import lampBrass from '@/assets/products/lamp-brass.jpg';

// Supplements product images
import vitaminsGummy from '@/assets/products/vitamins-gummy.jpg';
import collagenPowder from '@/assets/products/collagen-powder.jpg';
import magnesiumCapsules from '@/assets/products/magnesium-capsules.jpg';
import greensSuperfood from '@/assets/products/greens-superfood.jpg';
import omegaFishOil from '@/assets/products/omega-fish-oil.jpg';

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

// Model preview images
import modelFemaleSlimAsian from '@/assets/models/model-female-slim-asian.jpg';
import modelFemaleAthleticBlack from '@/assets/models/model-female-athletic-black.jpg';
import modelFemalePlussizeLatina from '@/assets/models/model-female-plussize-latina.jpg';
import modelFemaleAverageEuropean from '@/assets/models/model-female-average-european.jpg';
import modelMaleSlimMiddleeast from '@/assets/models/model-male-slim-middleeast.jpg';
import modelMaleAthleticBlack from '@/assets/models/model-male-athletic-black.jpg';
import modelMaleAverageAsian from '@/assets/models/model-male-average-asian.jpg';
import modelMalePlussizeEuropean from '@/assets/models/model-male-plussize-european.jpg';
// New diverse female models
import modelFemaleMatureEuropean from '@/assets/models/model-female-mature-european.jpg';
import modelFemaleAthleticIndian from '@/assets/models/model-female-athletic-indian.jpg';
import modelFemaleSlimNordic from '@/assets/models/model-female-slim-nordic.jpg';
import modelFemaleAverageMiddleeast from '@/assets/models/model-female-average-middleeast.jpg';
import modelFemalePlussizeAfrican from '@/assets/models/model-female-plussize-african.jpg';
import modelFemalePetiteKorean from '@/assets/models/model-female-petite-korean.jpg';
// New expanded male models (10)
import modelMaleAthleticEuropean from '@/assets/models/model-male-athletic-european.jpg';
import modelMaleAthleticLatino from '@/assets/models/model-male-athletic-latino.jpg';
import modelMaleAthleticJapanese from '@/assets/models/model-male-athletic-japanese.jpg';
import modelMaleSlimNordic from '@/assets/models/model-male-slim-nordic.jpg';
import modelMaleAverageLatino from '@/assets/models/model-male-average-latino.jpg';
import modelMalePlussizeAfrican from '@/assets/models/model-male-plussize-african.jpg';
import modelMaleSlimIndian from '@/assets/models/model-male-slim-indian.jpg';
import modelMaleAverageChinese from '@/assets/models/model-male-average-chinese.jpg';
import modelMaleAthleticMixed from '@/assets/models/model-male-athletic-mixed.jpg';
import modelMalePlussizeLatino from '@/assets/models/model-male-plussize-latino.jpg';
// New expanded female models (8)
import modelFemaleAthleticEuropean from '@/assets/models/model-female-athletic-european.jpg';
import modelFemaleAthleticLatina from '@/assets/models/model-female-athletic-latina.jpg';
import modelFemaleAverageAfrican from '@/assets/models/model-female-average-african.jpg';
import modelFemalePlussizeJapanese from '@/assets/models/model-female-plussize-japanese.jpg';
import modelFemaleAverageNordic from '@/assets/models/model-female-average-nordic.jpg';
import modelFemaleSlimChinese from '@/assets/models/model-female-slim-chinese.jpg';
import modelFemaleAthleticMixed from '@/assets/models/model-female-athletic-mixed.jpg';
import modelFemalePlussizeMiddleeast from '@/assets/models/model-female-plussize-middleeast.jpg';
// Redhead models (2)
import modelFemaleAverageIrish from '@/assets/models/model-female-average-irish.jpg';
import modelMaleAthleticScottish from '@/assets/models/model-male-athletic-scottish.jpg';

// Pose preview images
import poseStudioFront from '@/assets/poses/pose-studio-front.jpg';
import poseLifestyleWalking from '@/assets/poses/pose-lifestyle-walking.jpg';
import poseEditorialDramatic from '@/assets/poses/pose-editorial-dramatic.jpg';
import poseStreetwearUrban from '@/assets/poses/pose-streetwear-urban.jpg';
import poseLifestyleSeated from '@/assets/poses/pose-lifestyle-seated.jpg';
import poseStudioProfile from '@/assets/poses/pose-studio-profile.jpg';
// New pose images
import poseStudioMovement from '@/assets/poses/pose-studio-movement.jpg';
import poseLifestyleGarden from '@/assets/poses/pose-lifestyle-garden.jpg';
import poseEditorialMinimal from '@/assets/poses/pose-editorial-minimal.jpg';
import poseStreetwearStairs from '@/assets/poses/pose-streetwear-stairs.jpg';
// Expanded pose library (14 new poses)
import poseStudioBack from '@/assets/poses/pose-studio-back.jpg';
import poseStudioCloseup from '@/assets/poses/pose-studio-closeup.jpg';
import poseStudioArms from '@/assets/poses/pose-studio-arms.jpg';
import poseLifestyleCoffee from '@/assets/poses/pose-lifestyle-coffee.jpg';
import poseLifestyleBeach from '@/assets/poses/pose-lifestyle-beach.jpg';
import poseLifestylePark from '@/assets/poses/pose-lifestyle-park.jpg';
import poseLifestyleRooftop from '@/assets/poses/pose-lifestyle-rooftop.jpg';
import poseEditorialWindow from '@/assets/poses/pose-editorial-window.jpg';
import poseEditorialMoody from '@/assets/poses/pose-editorial-moody.jpg';
import poseEditorialArtistic from '@/assets/poses/pose-editorial-artistic.jpg';
import poseEditorialMotion from '@/assets/poses/pose-editorial-motion.jpg';
import poseStreetwearBasketball from '@/assets/poses/pose-streetwear-basketball.jpg';
import poseStreetwearUnderpass from '@/assets/poses/pose-streetwear-underpass.jpg';
import poseStreetwearNeon from '@/assets/poses/pose-streetwear-neon.jpg';

// Male pose preview images
import poseStudioFrontMale from '@/assets/poses/pose-studio-front-male.jpg';
import poseStudioProfileMale from '@/assets/poses/pose-studio-profile-male.jpg';
import poseStudioMovementMale from '@/assets/poses/pose-studio-movement-male.jpg';
import poseLifestyleWalkingMale from '@/assets/poses/pose-lifestyle-walking-male.jpg';
import poseLifestyleSeatedMale from '@/assets/poses/pose-lifestyle-seated-male.jpg';
import poseLifestyleGardenMale from '@/assets/poses/pose-lifestyle-garden-male.jpg';
import poseEditorialDramaticMale from '@/assets/poses/pose-editorial-dramatic-male.jpg';
import poseEditorialMinimalMale from '@/assets/poses/pose-editorial-minimal-male.jpg';
import poseStreetwearUrbanMale from '@/assets/poses/pose-streetwear-urban-male.jpg';
import poseStreetwearStairsMale from '@/assets/poses/pose-streetwear-stairs-male.jpg';
import poseStudioBackMale from '@/assets/poses/pose-studio-back-male.jpg';
import poseStudioCloseupMale from '@/assets/poses/pose-studio-closeup-male.jpg';
import poseStudioArmsMale from '@/assets/poses/pose-studio-arms-male.jpg';
import poseLifestyleCoffeeMale from '@/assets/poses/pose-lifestyle-coffee-male.jpg';
import poseLifestyleBeachMale from '@/assets/poses/pose-lifestyle-beach-male.jpg';
import poseLifestyleParkMale from '@/assets/poses/pose-lifestyle-park-male.jpg';
import poseLifestyleRooftopMale from '@/assets/poses/pose-lifestyle-rooftop-male.jpg';
import poseEditorialWindowMale from '@/assets/poses/pose-editorial-window-male.jpg';
import poseEditorialMoodyMale from '@/assets/poses/pose-editorial-moody-male.jpg';
import poseEditorialArtisticMale from '@/assets/poses/pose-editorial-artistic-male.jpg';
import poseEditorialMotionMale from '@/assets/poses/pose-editorial-motion-male.jpg';
import poseStreetwearBasketballMale from '@/assets/poses/pose-streetwear-basketball-male.jpg';
import poseStreetwearUnderpassMale from '@/assets/poses/pose-streetwear-underpass-male.jpg';
import poseStreetwearNeonMale from '@/assets/poses/pose-streetwear-neon-male.jpg';
import poseLifestyleGymMale from '@/assets/poses/pose-lifestyle-gym-male.jpg';
import poseStreetwearShoppingMale from '@/assets/poses/pose-streetwear-shopping-male.jpg';
import poseLifestyleResortMale from '@/assets/poses/pose-lifestyle-resort-male.jpg';
import poseEditorialGalleryMale from '@/assets/poses/pose-editorial-gallery-male.jpg';
import poseLifestyleAutumnMale from '@/assets/poses/pose-lifestyle-autumn-male.jpg';
import poseEditorialWarehouseMale from '@/assets/poses/pose-editorial-warehouse-male.jpg';

// Scene environment images (product photography)
import templateClothingStudio from '@/assets/templates/clothing-studio.jpg';
import templateUniversalGradient from '@/assets/templates/universal-gradient.jpg';
import templateUniversalClean from '@/assets/templates/universal-clean.jpg';
import showcaseSkincareSerumMarble from '@/assets/showcase/skincare-serum-marble.jpg';
import showcaseFoodPastaRustic from '@/assets/showcase/food-pasta-rustic.jpg';
import showcaseHomeConcrete from '@/assets/templates/home-concrete.jpg';
import templateClothingFlatlay from '@/assets/templates/clothing-flatlay.jpg';
import templateCosmeticsPastel from '@/assets/templates/cosmetics-pastel.jpg';
import showcaseFoodCoffeeArtisan from '@/assets/showcase/food-coffee-artisan.jpg';
import showcaseFoodHoneyFarmhouse from '@/assets/showcase/food-honey-farmhouse.jpg';
import showcaseFoodBreadBakery from '@/assets/showcase/food-bread-bakery.jpg';
import showcaseHomeVasesJapandi from '@/assets/showcase/home-vases-japandi.jpg';
import showcaseHomeCandleEvening from '@/assets/showcase/home-candle-evening.jpg';
import showcaseHomeBedroomMorning from '@/assets/showcase/home-bedroom-morning.jpg';
import showcaseSkincareOilBathroom from '@/assets/showcase/skincare-oil-bathroom.jpg';
import showcaseSkincareCreamBotanical from '@/assets/showcase/skincare-cream-botanical.jpg';
import showcaseFashionDressGarden from '@/assets/showcase/fashion-dress-garden.jpg';
import showcaseFashionDressBotanical from '@/assets/showcase/fashion-dress-botanical.jpg';

export const mockModels: ModelProfile[] = [
  {
    modelId: 'model_001',
    name: 'Yuki',
    gender: 'female',
    bodyType: 'slim',
    ethnicity: 'East Asian',
    ageRange: 'young-adult',
    previewUrl: modelFemaleSlimAsian,
  },
  {
    modelId: 'model_002',
    name: 'Amara',
    gender: 'female',
    bodyType: 'athletic',
    ethnicity: 'Black African',
    ageRange: 'adult',
    previewUrl: modelFemaleAthleticBlack,
  },
  {
    modelId: 'model_003',
    name: 'Isabella',
    gender: 'female',
    bodyType: 'plus-size',
    ethnicity: 'Latina',
    ageRange: 'young-adult',
    previewUrl: modelFemalePlussizeLatina,
  },
  {
    modelId: 'model_004',
    name: 'Charlotte',
    gender: 'female',
    bodyType: 'average',
    ethnicity: 'European',
    ageRange: 'adult',
    previewUrl: modelFemaleAverageEuropean,
  },
  // New diverse female models
  {
    modelId: 'model_009',
    name: 'Victoria',
    gender: 'female',
    bodyType: 'slim',
    ethnicity: 'European',
    ageRange: 'mature',
    previewUrl: modelFemaleMatureEuropean,
  },
  {
    modelId: 'model_010',
    name: 'Priya',
    gender: 'female',
    bodyType: 'athletic',
    ethnicity: 'South Asian',
    ageRange: 'young-adult',
    previewUrl: modelFemaleAthleticIndian,
  },
  {
    modelId: 'model_011',
    name: 'Ingrid',
    gender: 'female',
    bodyType: 'slim',
    ethnicity: 'Nordic',
    ageRange: 'young-adult',
    previewUrl: modelFemaleSlimNordic,
  },
  {
    modelId: 'model_012',
    name: 'Layla',
    gender: 'female',
    bodyType: 'average',
    ethnicity: 'Middle Eastern',
    ageRange: 'adult',
    previewUrl: modelFemaleAverageMiddleeast,
  },
  {
    modelId: 'model_013',
    name: 'Nia',
    gender: 'female',
    bodyType: 'plus-size',
    ethnicity: 'Black African',
    ageRange: 'young-adult',
    previewUrl: modelFemalePlussizeAfrican,
  },
  {
    modelId: 'model_014',
    name: 'Soo-Min',
    gender: 'female',
    bodyType: 'slim',
    ethnicity: 'Korean',
    ageRange: 'young-adult',
    previewUrl: modelFemalePetiteKorean,
  },
  // Male models
  {
    modelId: 'model_005',
    name: 'Omar',
    gender: 'male',
    bodyType: 'slim',
    ethnicity: 'Middle Eastern',
    ageRange: 'young-adult',
    previewUrl: modelMaleSlimMiddleeast,
  },
  {
    modelId: 'model_006',
    name: 'Marcus',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'Black African',
    ageRange: 'adult',
    previewUrl: modelMaleAthleticBlack,
  },
  {
    modelId: 'model_007',
    name: 'Jin',
    gender: 'male',
    bodyType: 'average',
    ethnicity: 'East Asian',
    ageRange: 'young-adult',
    previewUrl: modelMaleAverageAsian,
  },
  {
    modelId: 'model_008',
    name: 'Henrik',
    gender: 'male',
    bodyType: 'plus-size',
    ethnicity: 'European',
    ageRange: 'mature',
    previewUrl: modelMalePlussizeEuropean,
  },
  // === NEW MALE MODELS (10) ===
  {
    modelId: 'model_015',
    name: 'Liam',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'European',
    ageRange: 'adult',
    previewUrl: modelMaleAthleticEuropean,
  },
  {
    modelId: 'model_016',
    name: 'Rafael',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'Latino',
    ageRange: 'young-adult',
    previewUrl: modelMaleAthleticLatino,
  },
  {
    modelId: 'model_017',
    name: 'Kenji',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'Japanese',
    ageRange: 'adult',
    previewUrl: modelMaleAthleticJapanese,
  },
  {
    modelId: 'model_018',
    name: 'Anders',
    gender: 'male',
    bodyType: 'slim',
    ethnicity: 'Nordic',
    ageRange: 'young-adult',
    previewUrl: modelMaleSlimNordic,
  },
  {
    modelId: 'model_019',
    name: 'Diego',
    gender: 'male',
    bodyType: 'average',
    ethnicity: 'Latino',
    ageRange: 'adult',
    previewUrl: modelMaleAverageLatino,
  },
  {
    modelId: 'model_020',
    name: 'Jamal',
    gender: 'male',
    bodyType: 'plus-size',
    ethnicity: 'Black African',
    ageRange: 'adult',
    previewUrl: modelMalePlussizeAfrican,
  },
  {
    modelId: 'model_021',
    name: 'Ravi',
    gender: 'male',
    bodyType: 'slim',
    ethnicity: 'South Asian',
    ageRange: 'adult',
    previewUrl: modelMaleSlimIndian,
  },
  {
    modelId: 'model_022',
    name: 'Chen Wei',
    gender: 'male',
    bodyType: 'average',
    ethnicity: 'Chinese',
    ageRange: 'mature',
    previewUrl: modelMaleAverageChinese,
  },
  {
    modelId: 'model_023',
    name: 'Tyler',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'Mixed',
    ageRange: 'young-adult',
    previewUrl: modelMaleAthleticMixed,
  },
  {
    modelId: 'model_024',
    name: 'Mateo',
    gender: 'male',
    bodyType: 'plus-size',
    ethnicity: 'Latino',
    ageRange: 'adult',
    previewUrl: modelMalePlussizeLatino,
  },
  // === NEW FEMALE MODELS (8) ===
  {
    modelId: 'model_025',
    name: 'Sofia',
    gender: 'female',
    bodyType: 'athletic',
    ethnicity: 'European',
    ageRange: 'adult',
    previewUrl: modelFemaleAthleticEuropean,
  },
  {
    modelId: 'model_026',
    name: 'Elena',
    gender: 'female',
    bodyType: 'athletic',
    ethnicity: 'Latina',
    ageRange: 'young-adult',
    previewUrl: modelFemaleAthleticLatina,
  },
  {
    modelId: 'model_027',
    name: 'Maya',
    gender: 'female',
    bodyType: 'average',
    ethnicity: 'Black African',
    ageRange: 'adult',
    previewUrl: modelFemaleAverageAfrican,
  },
  {
    modelId: 'model_028',
    name: 'Akiko',
    gender: 'female',
    bodyType: 'plus-size',
    ethnicity: 'Japanese',
    ageRange: 'adult',
    previewUrl: modelFemalePlussizeJapanese,
  },
  {
    modelId: 'model_029',
    name: 'Freya',
    gender: 'female',
    bodyType: 'average',
    ethnicity: 'Nordic',
    ageRange: 'young-adult',
    previewUrl: modelFemaleAverageNordic,
  },
  {
    modelId: 'model_030',
    name: 'Mei',
    gender: 'female',
    bodyType: 'slim',
    ethnicity: 'Chinese',
    ageRange: 'mature',
    previewUrl: modelFemaleSlimChinese,
  },
  {
    modelId: 'model_031',
    name: 'Zara',
    gender: 'female',
    bodyType: 'athletic',
    ethnicity: 'Mixed',
    ageRange: 'young-adult',
    previewUrl: modelFemaleAthleticMixed,
  },
  {
    modelId: 'model_032',
    name: 'Fatima',
    gender: 'female',
    bodyType: 'plus-size',
    ethnicity: 'Middle Eastern',
    ageRange: 'adult',
    previewUrl: modelFemalePlussizeMiddleeast,
  },
  // === REDHEAD MODELS (2) ===
  {
    modelId: 'model_033',
    name: 'Sienna',
    gender: 'female',
    bodyType: 'average',
    ethnicity: 'Irish',
    ageRange: 'young-adult',
    previewUrl: modelFemaleAverageIrish,
  },
  {
    modelId: 'model_034',
    name: 'Rowan',
    gender: 'male',
    bodyType: 'athletic',
    ethnicity: 'Scottish',
    ageRange: 'adult',
    previewUrl: modelMaleAthleticScottish,
  },
];

export const mockTryOnPoses: TryOnPose[] = [
  {
    poseId: 'pose_001',
    name: 'Studio Front',
    category: 'studio',
    description: 'Model standing facing camera in a classic lookbook pose, full body front view, relaxed shoulders, arms naturally at sides, clean white studio background',
    previewUrl: poseStudioFront,
    previewUrlMale: poseStudioFrontMale,
  },
  {
    poseId: 'pose_002',
    name: 'Studio Profile',
    category: 'studio',
    description: 'Elegant three-quarter turn, professional studio lighting',
    previewUrl: poseStudioProfile,
    previewUrlMale: poseStudioProfileMale,
  },
  {
    poseId: 'pose_007',
    name: 'Studio Movement',
    category: 'studio',
    description: 'Dynamic walking motion with flowing fabric, clean background',
    previewUrl: poseStudioMovement,
    previewUrlMale: poseStudioMovementMale,
  },
  {
    poseId: 'pose_003',
    name: 'Urban Walking',
    category: 'lifestyle',
    description: 'Candid street style, walking in city with golden hour light',
    previewUrl: poseLifestyleWalking,
    previewUrlMale: poseLifestyleWalkingMale,
  },
  {
    poseId: 'pose_004',
    name: 'Relaxed Seated',
    category: 'lifestyle',
    description: 'Casual seated pose in modern interior with natural light',
    previewUrl: poseLifestyleSeated,
    previewUrlMale: poseLifestyleSeatedMale,
  },
  {
    poseId: 'pose_008',
    name: 'Garden Natural',
    category: 'lifestyle',
    description: 'Relaxed outdoor pose in beautiful botanical garden setting',
    previewUrl: poseLifestyleGarden,
    previewUrlMale: poseLifestyleGardenMale,
  },
  {
    poseId: 'pose_005',
    name: 'Editorial Dramatic',
    category: 'editorial',
    description: 'High-fashion pose with dramatic lighting and dark backdrop',
    previewUrl: poseEditorialDramatic,
    previewUrlMale: poseEditorialDramaticMale,
  },
  {
    poseId: 'pose_009',
    name: 'Editorial Minimal',
    category: 'editorial',
    description: 'Elegant minimal pose with geometric window shadows',
    previewUrl: poseEditorialMinimal,
    previewUrlMale: poseEditorialMinimalMale,
  },
  {
    poseId: 'pose_006',
    name: 'Street Lean',
    category: 'streetwear',
    description: 'Urban street style against graffiti wall, hip-hop inspired',
    previewUrl: poseStreetwearUrban,
    previewUrlMale: poseStreetwearUrbanMale,
  },
  {
    poseId: 'pose_010',
    name: 'Urban Stairs',
    category: 'streetwear',
    description: 'Cool casual pose sitting on concrete stairs, industrial vibe',
    previewUrl: poseStreetwearStairs,
    previewUrlMale: poseStreetwearStairsMale,
  },
  // === EXPANDED POSE LIBRARY (14 new poses) ===
  // Studio Category (+3)
  {
    poseId: 'pose_011',
    name: 'Studio Back View',
    category: 'studio',
    description: 'Elegant back pose showing garment rear details, shoulders angled',
    previewUrl: poseStudioBack,
    previewUrlMale: poseStudioBackMale,
  },
  {
    poseId: 'pose_012',
    name: 'Studio Close-Up',
    category: 'studio',
    description: 'Torso-focused crop highlighting fabric texture and fit',
    previewUrl: poseStudioCloseup,
    previewUrlMale: poseStudioCloseupMale,
  },
  {
    poseId: 'pose_013',
    name: 'Studio Crossed Arms',
    category: 'studio',
    description: 'Confident pose with crossed arms, direct eye contact',
    previewUrl: poseStudioArms,
    previewUrlMale: poseStudioArmsMale,
  },
  // Lifestyle Category (+4)
  {
    poseId: 'pose_014',
    name: 'Coffee Shop Casual',
    category: 'lifestyle',
    description: 'Relaxed pose at cafe table with natural morning light',
    previewUrl: poseLifestyleCoffee,
    previewUrlMale: poseLifestyleCoffeeMale,
  },
  {
    poseId: 'pose_015',
    name: 'Beach Sunset',
    category: 'lifestyle',
    description: 'Coastal lifestyle scene with golden sunset backdrop',
    previewUrl: poseLifestyleBeach,
    previewUrlMale: poseLifestyleBeachMale,
  },
  {
    poseId: 'pose_016',
    name: 'Park Bench',
    category: 'lifestyle',
    description: 'Casual outdoor pose on wooden park bench with greenery',
    previewUrl: poseLifestylePark,
    previewUrlMale: poseLifestyleParkMale,
  },
  {
    poseId: 'pose_017',
    name: 'Rooftop City',
    category: 'lifestyle',
    description: 'Urban rooftop with city skyline in background at dusk',
    previewUrl: poseLifestyleRooftop,
    previewUrlMale: poseLifestyleRooftopMale,
  },
  // Editorial Category (+4)
  {
    poseId: 'pose_018',
    name: 'Editorial Window',
    category: 'editorial',
    description: 'Silhouette against floor-to-ceiling window with natural light',
    previewUrl: poseEditorialWindow,
    previewUrlMale: poseEditorialWindowMale,
  },
  {
    poseId: 'pose_019',
    name: 'Editorial Moody',
    category: 'editorial',
    description: 'Low-key studio lighting with single dramatic side light',
    previewUrl: poseEditorialMoody,
    previewUrlMale: poseEditorialMoodyMale,
  },
  {
    poseId: 'pose_020',
    name: 'Editorial Artistic',
    category: 'editorial',
    description: 'High-fashion pose with abstract geometric backdrop',
    previewUrl: poseEditorialArtistic,
    previewUrlMale: poseEditorialArtisticMale,
  },
  {
    poseId: 'pose_021',
    name: 'Editorial Movement',
    category: 'editorial',
    description: 'Dynamic motion blur effect with flowing hair/fabric',
    previewUrl: poseEditorialMotion,
    previewUrlMale: poseEditorialMotionMale,
  },
  // Streetwear Category (+3)
  {
    poseId: 'pose_022',
    name: 'Basketball Court',
    category: 'streetwear',
    description: 'Urban playground with chain-link fence backdrop',
    previewUrl: poseStreetwearBasketball,
    previewUrlMale: poseStreetwearBasketballMale,
  },
  {
    poseId: 'pose_023',
    name: 'Industrial Underpass',
    category: 'streetwear',
    description: 'Industrial tunnel with dramatic overhead lighting',
    previewUrl: poseStreetwearUnderpass,
    previewUrlMale: poseStreetwearUnderpassMale,
  },
  {
    poseId: 'pose_024',
    name: 'Night Neon',
    category: 'streetwear',
    description: 'Night scene with neon signs and urban glow',
    previewUrl: poseStreetwearNeon,
    previewUrlMale: poseStreetwearNeonMale,
  },
  // === EXPANDED ON-MODEL SCENES ===
  {
    poseId: 'pose_025',
    name: 'Gym & Fitness',
    category: 'lifestyle',
    description: 'Athletic setting with gym equipment and natural light',
    previewUrl: poseLifestyleRooftop,
    previewUrlMale: poseLifestyleGymMale,
  },
  {
    poseId: 'pose_026',
    name: 'Shopping District',
    category: 'streetwear',
    description: 'Busy shopping area with storefronts and street energy',
    previewUrl: poseStreetwearStairs,
    previewUrlMale: poseStreetwearShoppingMale,
  },
  {
    poseId: 'pose_027',
    name: 'Resort Poolside',
    category: 'lifestyle',
    description: 'Luxury resort pool area with warm golden light',
    previewUrl: poseLifestyleBeach,
    previewUrlMale: poseLifestyleResortMale,
  },
  {
    poseId: 'pose_028',
    name: 'Art Gallery',
    category: 'editorial',
    description: 'White gallery space with art installations and clean lines',
    previewUrl: poseEditorialMinimal,
    previewUrlMale: poseEditorialGalleryMale,
  },
  {
    poseId: 'pose_029',
    name: 'Autumn Park',
    category: 'lifestyle',
    description: 'Fall foliage with warm golden tones and soft light',
    previewUrl: poseLifestylePark,
    previewUrlMale: poseLifestyleAutumnMale,
  },
  {
    poseId: 'pose_030',
    name: 'Warehouse Loft',
    category: 'editorial',
    description: 'Raw industrial loft with large windows and exposed brick',
    previewUrl: poseEditorialWindow,
    previewUrlMale: poseEditorialWarehouseMale,
  },
  // === PRODUCT ENVIRONMENT SCENES ===
  // Clean Studio (3)
  {
    poseId: 'scene_001',
    name: 'White Seamless',
    category: 'clean-studio',
    description: 'Pure white infinity backdrop, even lighting, e-commerce ready',
    previewUrl: templateClothingStudio,
  },
  {
    poseId: 'scene_002',
    name: 'Gradient Backdrop',
    category: 'clean-studio',
    description: 'Smooth gradient background for premium product positioning',
    previewUrl: templateUniversalGradient,
  },
  {
    poseId: 'scene_003',
    name: 'Minimalist Platform',
    category: 'clean-studio',
    description: 'Clean pedestal or platform with soft shadows',
    previewUrl: templateUniversalClean,
  },
  // Surface & Texture (3)
  {
    poseId: 'scene_004',
    name: 'Marble Surface',
    category: 'surface',
    description: 'Polished marble surface with elegant reflections',
    previewUrl: showcaseSkincareSerumMarble,
  },
  {
    poseId: 'scene_005',
    name: 'Wooden Table',
    category: 'surface',
    description: 'Warm rustic wood surface with natural grain texture',
    previewUrl: showcaseFoodPastaRustic,
  },
  {
    poseId: 'scene_006',
    name: 'Concrete Slab',
    category: 'surface',
    description: 'Raw concrete surface for industrial-modern aesthetic',
    previewUrl: showcaseHomeConcrete,
  },
  // Flat Lay (2)
  {
    poseId: 'scene_007',
    name: 'Overhead Clean',
    category: 'flat-lay',
    description: 'Top-down view on clean surface, minimal props',
    previewUrl: templateClothingFlatlay,
  },
  {
    poseId: 'scene_008',
    name: 'Styled Flat Lay',
    category: 'flat-lay',
    description: 'Curated overhead arrangement with complementary props',
    previewUrl: templateCosmeticsPastel,
  },
  // Kitchen & Dining (3)
  {
    poseId: 'scene_009',
    name: 'Rustic Kitchen',
    category: 'kitchen',
    description: 'Farmhouse-style kitchen with warm natural light',
    previewUrl: showcaseFoodHoneyFarmhouse,
  },
  {
    poseId: 'scene_010',
    name: 'Bright Countertop',
    category: 'kitchen',
    description: 'Clean, bright kitchen countertop with modern styling',
    previewUrl: showcaseFoodBreadBakery,
  },
  {
    poseId: 'scene_011',
    name: 'Café Table',
    category: 'kitchen',
    description: 'Artisan café setting with coffee culture vibes',
    previewUrl: showcaseFoodCoffeeArtisan,
  },
  // Living Space (3)
  {
    poseId: 'scene_012',
    name: 'Japandi Shelf',
    category: 'living-space',
    description: 'Zen-inspired minimal shelf with natural materials',
    previewUrl: showcaseHomeVasesJapandi,
  },
  {
    poseId: 'scene_013',
    name: 'Cozy Evening',
    category: 'living-space',
    description: 'Warm candlelit interior with soft textiles',
    previewUrl: showcaseHomeCandleEvening,
  },
  {
    poseId: 'scene_014',
    name: 'Morning Bedroom',
    category: 'living-space',
    description: 'Bright morning light streaming into a styled bedroom',
    previewUrl: showcaseHomeBedroomMorning,
  },
  // Bathroom & Vanity (2)
  {
    poseId: 'scene_015',
    name: 'Marble Vanity',
    category: 'bathroom',
    description: 'Elegant bathroom vanity with marble surfaces',
    previewUrl: showcaseSkincareOilBathroom,
  },
  {
    poseId: 'scene_016',
    name: 'Bright Bathroom',
    category: 'bathroom',
    description: 'Clean, bright bathroom with natural light and botanicals',
    previewUrl: showcaseSkincareCreamBotanical,
  },
  // Botanical (2)
  {
    poseId: 'scene_017',
    name: 'Garden Setting',
    category: 'botanical',
    description: 'Lush garden environment with natural greenery',
    previewUrl: showcaseFashionDressGarden,
  },
  {
    poseId: 'scene_018',
    name: 'Botanical Arrangement',
    category: 'botanical',
    description: 'Styled botanical backdrop with leaves and flowers',
    previewUrl: showcaseFashionDressBotanical,
  },
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
      '20 credits (signup bonus)',
      'Standard workflows',
      'Freestyle Studio',
      '1 Brand Profile',
      'Standard delivery',
      'Community support',
    ],
    ctaText: 'Current Plan',
  },
  {
    planId: 'starter',
    name: 'Starter',
    monthlyPrice: 39,
    annualPrice: 372,
    credits: 1000,
    features: [
      '1,000 credits/month',
      'All workflows',
      'Freestyle Studio',
      '3 Brand Profiles',
      'Standard delivery',
      'Email support',
    ],
    ctaText: 'Start with Starter',
  },
  {
    planId: 'growth',
    name: 'Growth',
    monthlyPrice: 79,
    annualPrice: 756,
    credits: 2500,
    features: [
      '2,500 credits/month',
      'All Starter features',
      'Virtual Try-On',
      'Video generation',
      'Monthly Creative Drops',
      '10 Brand Profiles',
      'Bulk Generation',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Start with Growth',
  },
  {
    planId: 'pro',
    name: 'Pro',
    monthlyPrice: 179,
    annualPrice: 1716,
    credits: 6000,
    features: [
      '6,000 credits/month',
      'All Growth features',
      'API access',
      'Weekly Creative Drops',
      'Unlimited Brand Profiles',
      'Dedicated support',
    ],
    ctaText: 'Start with Pro',
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
    packId: 'pack_500',
    credits: 500,
    price: 15,
    pricePerCredit: 0.030,
  },
  {
    packId: 'pack_1500',
    credits: 1500,
    price: 39,
    pricePerCredit: 0.026,
    popular: true,
  },
  {
    packId: 'pack_4000',
    credits: 4000,
    price: 89,
    pricePerCredit: 0.0223,
  },
];
