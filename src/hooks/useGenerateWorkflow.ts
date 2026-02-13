import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { convertImageToBase64 } from '@/lib/imageUtils';

export interface WorkflowVariation {
  label: string;
  aspect_ratio: string;
}

export interface GenerateWorkflowParams {
  workflowId: string;
  product: {
    title: string;
    productType: string;
    description: string;
    dimensions?: string;
    imageUrl: string; // source image URL to convert to base64
  };
  brandProfile?: {
    tone?: string;
    background_style?: string;
    lighting_style?: string;
    color_temperature?: string;
    brand_keywords?: string[];
    color_palette?: string[];
    target_audience?: string;
    do_not_rules?: string[];
    composition_bias?: string;
    preferred_scenes?: string[];
    photography_reference?: string;
  };
  selectedVariations?: number[];
  quality?: string;
}

export interface GenerateWorkflowResult {
  images: string[];
  variations: WorkflowVariation[];
  generatedCount: number;
  requestedCount: number;
  partialSuccess?: boolean;
  workflow_name: string;
  strategy_type: string;
  errors?: string[];
}

export function useGenerateWorkflow() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateWorkflowParams): Promise<GenerateWorkflowResult | null> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 90 ? prev : prev + Math.random() * 8));
    }, 600);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!SUPABASE_URL) throw new Error('Backend URL not configured');

      console.log('[useGenerateWorkflow] Converting product image to base64...');
      const base64ProductImage = await convertImageToBase64(params.product.imageUrl);
      console.log('[useGenerateWorkflow] Image converted, calling generate-workflow...');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
        },
        body: JSON.stringify({
          workflow_id: params.workflowId,
          product: {
            title: params.product.title,
            productType: params.product.productType,
            description: params.product.description,
            imageUrl: base64ProductImage,
          },
          brand_profile: params.brandProfile,
          selected_variations: params.selectedVariations,
          quality: params.quality,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Rate limit reached. Please wait a moment and try again.');
          setError('Rate limit exceeded');
          return null;
        }
        if (response.status === 402) {
          toast.error('Please add credits to continue generating.');
          setError('Payment required');
          return null;
        }
        const errorMessage = errorData.error || `Generation failed (${response.status})`;
        toast.error(errorMessage);
        setError(errorMessage);
        return null;
      }

      const result: GenerateWorkflowResult = await response.json();
      setProgress(100);

      if (result.partialSuccess) {
        toast.warning(`Generated ${result.generatedCount} of ${result.requestedCount} variations. Some failed.`);
      } else {
        toast.success(`Generated ${result.generatedCount} ${result.workflow_name} images!`);
      }

      return result;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Generate workflow error:', err);
      toast.error(`Generation failed: ${errorMessage}`);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, isLoading, progress, error };
}
