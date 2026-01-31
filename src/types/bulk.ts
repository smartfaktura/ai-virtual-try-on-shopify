// Bulk Generation Types
import type { AspectRatio, ImageQuality, Product, GenerationMode } from './index';

export interface BulkGenerationConfig {
  mode: GenerationMode;
  // Product-only settings
  templateId?: string;
  // Virtual Try-On settings
  modelId?: string;
  poseId?: string;
  // Common settings
  imageCount: 1 | 4 | 8;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
}

export type BulkItemStatus = 'pending' | 'converting' | 'generating' | 'completed' | 'failed';

export interface BulkQueueItem {
  productId: string;
  product: Product;
  sourceImageUrl: string;
  status: BulkItemStatus;
  progress: number;
  results?: string[];
  error?: string;
  retryCount: number;
}

export type BulkStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled';

export interface BulkGenerationState {
  batchId: string;
  config: BulkGenerationConfig;
  queue: BulkQueueItem[];
  currentIndex: number;
  status: BulkStatus;
  startedAt?: string;
  completedAt?: string;
  totalCreditsUsed: number;
}

export interface BulkProductResult {
  productId: string;
  productTitle: string;
  images: string[];
  status: 'success' | 'partial' | 'failed';
}

export interface BulkGenerationSummary {
  totalProducts: number;
  successfulProducts: number;
  failedProducts: number;
  totalImages: number;
  creditsUsed: number;
}

export interface BulkGenerationResult {
  batchId: string;
  productResults: BulkProductResult[];
  summary: BulkGenerationSummary;
}

// Constants
export const MAX_PRODUCTS_PER_BATCH = 20;
export const INTER_PRODUCT_DELAY_MS = 2000;
export const MAX_RETRIES = 3;

// Helper functions
export function calculateBulkCredits(
  productCount: number,
  imagesPerProduct: number,
  mode: GenerationMode
): number {
  const creditsPerImage = mode === 'virtual-try-on' ? 3 : 1;
  return productCount * imagesPerProduct * creditsPerImage;
}
