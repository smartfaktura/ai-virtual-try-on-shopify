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

export type TemplateCategory = 'clothing' | 'cosmetics' | 'food' | 'home' | 'supplements' | 'universal';

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

export type AspectRatio = '1:1' | '4:5' | '16:9';
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
  preserveAccuracy: boolean;
}

export interface BrandSettings {
  tone: BrandTone;
  backgroundStyle: BackgroundStyle;
  colors: string[];
  negatives: string[];
  consistencyEnabled: boolean;
}

// Generation Mode
export type GenerationMode = 'product-only' | 'virtual-try-on';

// Virtual Try-On Types
export type ModelGender = 'male' | 'female' | 'non-binary';
export type ModelBodyType = 'slim' | 'athletic' | 'average' | 'plus-size';
export type ModelAgeRange = 'young-adult' | 'adult' | 'mature';
export type PoseCategory = 'studio' | 'lifestyle' | 'editorial' | 'streetwear';

export interface ModelProfile {
  modelId: string;
  name: string;
  gender: ModelGender;
  bodyType: ModelBodyType;
  ethnicity: string;
  ageRange: ModelAgeRange;
  previewUrl: string;
}

export interface TryOnPose {
  poseId: string;
  name: string;
  category: PoseCategory;
  description: string;
  previewUrl: string;
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
export type GenerationSourceType = 'product' | 'scratch';

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
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  isEnterprise?: boolean;
}

export interface CreditPack {
  packId: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
}
