// Core entity types for the Product Image Generator app

export interface Shop {
  shopId: string;
  shopDomain: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  creditsBalance: number;
  brandDefaults: BrandDefaults;
}

export interface BrandDefaults {
  tone: BrandTone;
  backgroundStyle: BackgroundStyle;
  colors: string[];
  negatives: string[];
  consistencyEnabled: boolean;
}

export type BrandTone = 'luxury' | 'clean' | 'playful' | 'bold' | 'minimal';
export type BackgroundStyle = 'studio' | 'lifestyle' | 'gradient' | 'pattern' | 'contextual';

export interface Template {
  templateId: string;
  category: TemplateCategory;
  name: string;
  description: string;
  promptBlueprint: PromptBlueprint;
  defaults: TemplateDefaults;
  enabled: boolean;
  tags: string[];
  exampleImageUrl?: string;
  recommended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 'garments' | 'beauty-skincare' | 'makeup-lipsticks' | 'fragrance'
  | 'food' | 'beverages' | 'home-decor' | 'supplements-wellness'
  | 'shoes' | 'bags-accessories' | 'tech-devices' | 'hats-small' | 'other'
  | 'backpacks' | 'wallets-cardholders' | 'belts' | 'scarves'
  | 'jewellery-necklaces' | 'jewellery-earrings' | 'jewellery-bracelets' | 'jewellery-rings' | 'watches'
  | 'dresses' | 'hoodies' | 'streetwear' | 'sneakers' | 'boots' | 'high-heels'
  | 'activewear' | 'eyewear' | 'swimwear' | 'lingerie' | 'kidswear' | 'jeans' | 'jackets';

export interface PromptBlueprint {
  sceneDescription: string;
  lighting: string;
  cameraStyle: string;
  backgroundRules: string;
  constraints: {
    do: string[];
    dont: string[];
  };
}

export interface TemplateDefaults {
  aspectRatio: AspectRatio;
  count: number;
  quality: ImageQuality;
  negativePrompt: string;
}

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';
export type ImageQuality = 'standard' | 'high';

export interface GenerationJob {
  jobId: string;
  shopId: string;
  productId: string;
  productSnapshot: ProductSnapshot;
  templateId: string;
  templateSnapshot: Template;
  promptFinal: string;
  status: JobStatus;
  requestedCount: number;
  creditsUsed: number;
  ratio: AspectRatio;
  quality: ImageQuality;
  results: GeneratedAsset[];
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export type JobStatus = 'queued' | 'generating' | 'completed' | 'failed';

export interface ProductSnapshot {
  productId: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
}

export interface GeneratedAsset {
  assetId: string;
  jobId: string;
  imageUrl: string;
  publishedToShopify: boolean;
  shopifyImageId?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  images: ProductImage[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GenerationSettings {
  count: 1 | 4 | 8;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
}

export interface BrandSettings {
  tone: BrandTone;
  backgroundStyle: BackgroundStyle;
  colors: string[];
  negatives: string[];
  consistencyEnabled: boolean;
}

// Generation Mode
export type GenerationMode = 'product-only' | 'virtual-try-on' | 'video';

// Framing / Body Crop
export type FramingOption = 'full_body' | 'upper_body' | 'close_up' | 'hand_wrist' | 'neck_shoulders' | 'side_profile' | 'lower_body' | 'back_view';

// Virtual Try-On Types
export type ModelGender = 'male' | 'female' | 'non-binary';
export type ModelBodyType = 'slim' | 'athletic' | 'average' | 'plus-size';
export type ModelAgeRange = 'young-adult' | 'adult' | 'mature';
export type PoseCategory = 'studio' | 'lifestyle' | 'editorial' | 'streetwear' | 'clean-studio' | 'surface' | 'flat-lay' | 'kitchen' | 'living-space' | 'bathroom' | 'botanical' | 'outdoor' | 'product-editorial' | 'workspace' | 'restaurant' | 'retail' | 'seasonal' | 'beauty' | 'fitness' | (string & {});

export interface ModelProfile {
  modelId: string;
  name: string;
  gender: ModelGender;
  bodyType: ModelBodyType;
  ethnicity: string;
  ageRange: ModelAgeRange;
  previewUrl: string;
  optimizedImageUrl?: string;
  /** Original high-res source image for identity replication */
  sourceImageUrl?: string;
}

export interface TryOnPose {
  poseId: string;
  name: string;
  category: PoseCategory;
  description: string;
  promptHint: string;
  previewUrl: string;
  previewUrlMale?: string;
  optimizedImageUrl?: string;
  created_at?: string;
  promptOnly?: boolean;
}

// Dashboard metrics
export interface DashboardMetrics {
  imagesGenerated30d: number;
  creditsRemaining: number;
  avgGenerationTime: number;
  publishRate: number;
  errorRate: number;
}

// Generation Source Types
export type GenerationSourceType = 'product' | 'scratch' | 'library';

export interface ScratchUpload {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  productInfo: {
    title: string;
    productType: string;
    description: string;
  };
}

// Pricing types
export interface PricingPlan {
  planId: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number | 'unlimited';
  features: Array<string | { text: string; badge?: string }>;
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  isEnterprise?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export interface CreditPack {
  packId: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  stripePriceId?: string;
}
