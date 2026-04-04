import type { Tables } from '@/integrations/supabase/types';

export type UserProduct = Tables<'user_products'>;

export type PIStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ProductImageScene {
  id: string;
  title: string;
  description: string;
  previewUrl?: string;
  chips?: string[];
  triggerBlocks: string[];
  isGlobal: boolean;
  categoryCollection?: string;
}

export interface CategoryCollection {
  id: string;
  title: string;
  scenes: ProductImageScene[];
}

export interface DetailSettings {
  // Format / generation config
  aspectRatio?: string;
  quality?: string;
  imageCount?: string;

  // Background & composition
  backgroundTone?: string;
  shadowStyle?: string;
  compositionFraming?: string;
  negativeSpace?: string;

  // Visual direction
  mood?: string;
  sceneIntensity?: string;
  productProminence?: string;
  lightingStyle?: string;

  // Scene environment
  environmentType?: string;
  surfaceType?: string;
  stylingDensity?: string;
  props?: string;

  // Visible person details
  presentation?: string;
  ageRange?: string;
  skinTone?: string;
  handStyle?: string;
  nails?: string;
  jewelryVisible?: string;
  cropType?: string;
  expression?: string;
  hairVisibility?: string;

  // Action details
  actionType?: string;
  actionIntensity?: string;

  // Detail focus
  focusArea?: string;
  cropIntensity?: string;
  detailStyle?: string;

  // Angle selection
  requestedViews?: string;
  numberOfViews?: string;
  matchStyle?: boolean;

  // Packaging details
  packagingType?: string;
  packagingState?: string;
  packagingComposition?: string;
  packagingFocus?: string;
  referenceStrength?: string;
  packagingReferenceUrl?: string;

  // Product size
  productSize?: string;

  // Branding visibility
  brandingVisibility?: string;

  // Layout space
  layoutSpace?: string;

  // Consistency
  consistency?: string;

  // Custom note
  customNote?: string;

  // Per-scene aspect ratio overrides (sceneId -> ratio)
  sceneAspectOverrides?: Record<string, string>;

  // Model selection (replaces generic person details when set)
  selectedModelId?: string;
}

export interface GenerationPlan {
  products: UserProduct[];
  scenes: ProductImageScene[];
  details: DetailSettings;
  totalImages: number;
  totalCredits: number;
}
