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

export const mockProducts: Product[] = [
  // Fashion Products
  {
    id: 'prod_fashion_001',
    title: 'Silk Midi Wrap Dress',
    vendor: 'Maison Élégance',
    productType: 'Dresses',
    tags: ['silk', 'midi', 'wrap dress', 'elegant', 'evening'],
    description: 'Luxurious 100% mulberry silk wrap dress with a flattering V-neckline and adjustable waist tie. Perfect for cocktail parties and special occasions.',
    images: [
      { id: 'img_f001', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' },
      { id: 'img_f002', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'prod_fashion_002',
    title: 'Oversized Linen Blazer',
    vendor: 'Nordic Atelier',
    productType: 'Blazers',
    tags: ['linen', 'blazer', 'oversized', 'summer', 'workwear'],
    description: 'Relaxed-fit linen blazer in sand beige. Features notched lapels, single-button closure, and patch pockets. Perfect for effortless summer styling.',
    images: [
      { id: 'img_f003', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop' },
      { id: 'img_f004', url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=500&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: 'prod_fashion_003',
    title: 'Satin Slip Blouse',
    vendor: 'Velvet Rose',
    productType: 'Blouses',
    tags: ['satin', 'blouse', 'slip style', 'romantic', 'evening'],
    description: 'Delicate satin camisole top with adjustable spaghetti straps and cowl neckline. A versatile piece that transitions from day to night effortlessly.',
    images: [
      { id: 'img_f005', url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
  },
  {
    id: 'prod_fashion_004',
    title: 'High-Waist Pleated Trousers',
    vendor: 'Studio Minimal',
    productType: 'Pants',
    tags: ['trousers', 'pleated', 'high-waist', 'workwear', 'classic'],
    description: 'Tailored wide-leg trousers with front pleats and high waist. Made from premium wool blend for a structured, elegant silhouette.',
    images: [
      { id: 'img_f006', url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop' },
      { id: 'img_f007', url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=400&h=500&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 'prod_fashion_005',
    title: 'Cashmere Turtleneck Sweater',
    vendor: 'Maison Élégance',
    productType: 'Sweaters',
    tags: ['cashmere', 'turtleneck', 'luxury', 'winter', 'classic'],
    description: 'Ultra-soft 100% cashmere turtleneck in rich burgundy. Relaxed fit with ribbed cuffs and hem. The ultimate winter essential.',
    images: [
      { id: 'img_f008', url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=500&fit=crop' },
      { id: 'img_f009', url: 'https://images.unsplash.com/photo-1608234807905-4466023792f5?w=400&h=500&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },
  // Original products
  {
    id: 'prod_001',
    title: 'Premium Cotton Crewneck Sweater',
    vendor: 'NordStyle',
    productType: 'Sweaters',
    tags: ['cotton', 'casual', 'unisex', 'basic'],
    description: 'A timeless crewneck sweater made from 100% organic cotton. Perfect for layering or wearing on its own.',
    images: [
      { id: 'img_001', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' },
      { id: 'img_002', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'prod_002',
    title: 'Vitamin C Brightening Serum',
    vendor: 'GlowLab',
    productType: 'Serums',
    tags: ['skincare', 'vitamin c', 'brightening', 'anti-aging'],
    description: '20% Vitamin C serum with hyaluronic acid for brighter, more radiant skin.',
    images: [
      { id: 'img_003', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T11:20:00Z',
  },
  {
    id: 'prod_003',
    title: 'Artisan Honey Granola',
    vendor: 'Morning Harvest',
    productType: 'Cereals',
    tags: ['organic', 'breakfast', 'honey', 'granola'],
    description: 'Hand-crafted granola with local honey, oats, and dried fruits. No artificial ingredients.',
    images: [
      { id: 'img_004', url: 'https://images.unsplash.com/photo-1517686748843-bb360cfc62b3?w=400&h=400&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-10T15:45:00Z',
  },
  {
    id: 'prod_004',
    title: 'Ceramic Minimalist Vase',
    vendor: 'Terra Home',
    productType: 'Decor',
    tags: ['ceramic', 'minimalist', 'home decor', 'handmade'],
    description: 'Hand-thrown ceramic vase with a natural matte finish. Each piece is unique.',
    images: [
      { id: 'img_005', url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-03T12:00:00Z',
    updatedAt: '2024-01-08T09:15:00Z',
  },
  {
    id: 'prod_005',
    title: 'Plant-Based Protein Powder',
    vendor: 'VitalFuel',
    productType: 'Supplements',
    tags: ['protein', 'vegan', 'plant-based', 'fitness'],
    description: '25g of complete plant protein per serving. No artificial sweeteners.',
    images: [
      { id: 'img_006', url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop' },
    ],
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-06T16:30:00Z',
  },
];

export const mockJobs: GenerationJob[] = [
  {
    jobId: 'job_001',
    shopId: 'shop_123',
    productId: 'prod_001',
    productSnapshot: {
      productId: 'prod_001',
      title: 'Premium Cotton Crewneck Sweater',
      vendor: 'NordStyle',
      productType: 'Sweaters',
      tags: ['cotton', 'casual', 'unisex', 'basic'],
      description: 'A timeless crewneck sweater...',
      images: mockProducts[0].images,
    },
    templateId: 'tpl_001',
    templateSnapshot: mockTemplates[0],
    promptFinal: 'Professional fashion photography studio setup. Premium Cotton Crewneck Sweater by NordStyle. Soft diffused studio lighting with subtle rim light. Medium shot, 85mm lens look, shallow depth of field. Clean white seamless backdrop. Emphasize fabric texture, show garment structure.',
    status: 'completed',
    requestedCount: 4,
    ratio: '4:5',
    quality: 'high',
    results: [
      {
        assetId: 'asset_001',
        jobId: 'job_001',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
        publishedToShopify: true,
        shopifyImageId: 'shopify_img_001',
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_002',
        jobId: 'job_001',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop',
        publishedToShopify: false,
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_003',
        jobId: 'job_001',
        imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=1000&fit=crop',
        publishedToShopify: false,
        createdAt: '2024-01-15T14:35:00Z',
      },
      {
        assetId: 'asset_004',
        jobId: 'job_001',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
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
    productId: 'prod_002',
    productSnapshot: {
      productId: 'prod_002',
      title: 'Vitamin C Brightening Serum',
      vendor: 'GlowLab',
      productType: 'Serums',
      tags: ['skincare', 'vitamin c', 'brightening'],
      description: '20% Vitamin C serum...',
      images: mockProducts[1].images,
    },
    templateId: 'tpl_004',
    templateSnapshot: mockTemplates[3],
    promptFinal: 'Luxury cosmetics product photography. Vitamin C Brightening Serum by GlowLab. Dramatic beauty lighting with highlights and reflections. Close-up macro details, sharp focus on product.',
    status: 'completed',
    requestedCount: 4,
    ratio: '1:1',
    quality: 'high',
    results: [
      {
        assetId: 'asset_005',
        jobId: 'job_002',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
        publishedToShopify: true,
        shopifyImageId: 'shopify_img_002',
        createdAt: '2024-01-14T10:20:00Z',
      },
      {
        assetId: 'asset_006',
        jobId: 'job_002',
        imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop',
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
    productId: 'prod_003',
    productSnapshot: {
      productId: 'prod_003',
      title: 'Artisan Honey Granola',
      vendor: 'Morning Harvest',
      productType: 'Cereals',
      tags: ['organic', 'breakfast'],
      description: 'Hand-crafted granola...',
      images: mockProducts[2].images,
    },
    templateId: 'tpl_007',
    templateSnapshot: mockTemplates[6],
    promptFinal: 'Commercial food photography setup. Artisan Honey Granola by Morning Harvest. Bright key light with fill, appetizing highlights.',
    status: 'generating',
    requestedCount: 4,
    ratio: '1:1',
    quality: 'high',
    results: [],
    createdAt: '2024-01-15T16:00:00Z',
  },
  {
    jobId: 'job_004',
    shopId: 'shop_123',
    productId: 'prod_004',
    productSnapshot: {
      productId: 'prod_004',
      title: 'Ceramic Minimalist Vase',
      vendor: 'Terra Home',
      productType: 'Decor',
      tags: ['ceramic', 'minimalist'],
      description: 'Hand-thrown ceramic vase...',
      images: mockProducts[3].images,
    },
    templateId: 'tpl_010',
    templateSnapshot: mockTemplates[9],
    promptFinal: 'Japandi style interior shelf vignette. Ceramic Minimalist Vase by Terra Home.',
    status: 'failed',
    requestedCount: 4,
    ratio: '1:1',
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
];

export const mockTryOnPoses: TryOnPose[] = [
  {
    poseId: 'pose_001',
    name: 'Studio Front',
    category: 'studio',
    description: 'Classic lookbook pose, full body front view with clean white background',
    previewUrl: poseStudioFront,
  },
  {
    poseId: 'pose_002',
    name: 'Studio Profile',
    category: 'studio',
    description: 'Elegant three-quarter turn, professional studio lighting',
    previewUrl: poseStudioProfile,
  },
  {
    poseId: 'pose_007',
    name: 'Studio Movement',
    category: 'studio',
    description: 'Dynamic walking motion with flowing fabric, clean background',
    previewUrl: poseStudioMovement,
  },
  {
    poseId: 'pose_003',
    name: 'Urban Walking',
    category: 'lifestyle',
    description: 'Candid street style, walking in city with golden hour light',
    previewUrl: poseLifestyleWalking,
  },
  {
    poseId: 'pose_004',
    name: 'Relaxed Seated',
    category: 'lifestyle',
    description: 'Casual seated pose in modern interior with natural light',
    previewUrl: poseLifestyleSeated,
  },
  {
    poseId: 'pose_008',
    name: 'Garden Natural',
    category: 'lifestyle',
    description: 'Relaxed outdoor pose in beautiful botanical garden setting',
    previewUrl: poseLifestyleGarden,
  },
  {
    poseId: 'pose_005',
    name: 'Editorial Dramatic',
    category: 'editorial',
    description: 'High-fashion pose with dramatic lighting and dark backdrop',
    previewUrl: poseEditorialDramatic,
  },
  {
    poseId: 'pose_009',
    name: 'Editorial Minimal',
    category: 'editorial',
    description: 'Elegant minimal pose with geometric window shadows',
    previewUrl: poseEditorialMinimal,
  },
  {
    poseId: 'pose_006',
    name: 'Street Lean',
    category: 'streetwear',
    description: 'Urban street style against graffiti wall, hip-hop inspired',
    previewUrl: poseStreetwearUrban,
  },
  {
    poseId: 'pose_010',
    name: 'Urban Stairs',
    category: 'streetwear',
    description: 'Cool casual pose sitting on concrete stairs, industrial vibe',
    previewUrl: poseStreetwearStairs,
  },
];

export const poseCategoryLabels: Record<string, string> = {
  studio: 'Studio',
  lifestyle: 'Lifestyle',
  editorial: 'Editorial',
  streetwear: 'Streetwear',
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
    planId: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 90, // 2 months free
    credits: 100,
    features: [
      '100 credits/month',
      'All templates included',
      'Standard image quality',
      'Email support',
    ],
    ctaText: 'Start with Starter',
  },
  {
    planId: 'growth',
    name: 'Growth',
    monthlyPrice: 29,
    annualPrice: 290,
    credits: 500,
    features: [
      '500 credits/month',
      'All Starter features',
      'Virtual Try-On access',
      'Priority generation queue',
      'Brand consistency',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Start with Growth',
  },
  {
    planId: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 790,
    credits: 2000,
    features: [
      '2,000 credits/month',
      'All Growth features',
      'API access',
      'Bulk generation',
      'Custom templates (soon)',
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
      'Unlimited credits',
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
    packId: 'pack_50',
    credits: 50,
    price: 5,
    pricePerCredit: 0.10,
  },
  {
    packId: 'pack_200',
    credits: 200,
    price: 15,
    pricePerCredit: 0.075,
    popular: true,
  },
  {
    packId: 'pack_500',
    credits: 500,
    price: 30,
    pricePerCredit: 0.06,
  },
];
