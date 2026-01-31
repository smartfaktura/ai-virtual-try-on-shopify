import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Product, Template, BrandTone, BackgroundStyle, AspectRatio } from '@/types';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface GenerateProductParams {
  product: Product;
  template: Template;
  brandSettings: {
    tone: BrandTone;
    backgroundStyle: BackgroundStyle;
  };
  aspectRatio: AspectRatio;
  imageCount: number;
  sourceImageUrl: string; // The product image to use as reference
}

interface GenerateProductResult {
  images: string[];
  generatedCount: number;
  requestedCount: number;
  partialSuccess?: boolean;
  errors?: string[];
}

interface UseGenerateProductReturn {
  generate: (params: GenerateProductParams) => Promise<GenerateProductResult | null>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export function useGenerateProduct(): UseGenerateProductReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateProductParams): Promise<GenerateProductResult | null> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!SUPABASE_URL) {
        throw new Error('Supabase URL not configured');
      }

      // Convert product image to base64 so AI model can access it
      console.log('[useGenerateProduct] Converting product image to base64...');
      const base64ProductImage = await convertImageToBase64(params.sourceImageUrl);
      console.log('[useGenerateProduct] Image converted, sending to API');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
        },
        body: JSON.stringify({
          product: {
            title: params.product.title,
            productType: params.product.productType,
            description: params.product.description,
            imageUrl: base64ProductImage,
          },
          template: {
            name: params.template.name,
            promptBlueprint: params.template.promptBlueprint,
            negativePrompt: params.template.defaults.negativePrompt,
          },
          brandSettings: {
            tone: params.brandSettings.tone,
            backgroundStyle: params.brandSettings.backgroundStyle,
          },
          aspectRatio: params.aspectRatio,
          imageCount: params.imageCount,
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
          toast.error('Please add credits to your workspace to continue generating.');
          setError('Payment required');
          return null;
        }

        const errorMessage = errorData.error || `Generation failed (${response.status})`;
        toast.error(errorMessage);
        setError(errorMessage);
        return null;
      }

      const result: GenerateProductResult = await response.json();

      setProgress(100);

      if (result.partialSuccess) {
        toast.warning(`Generated ${result.generatedCount} of ${result.requestedCount} images. Some variations failed.`);
      } else {
        toast.success(`Successfully generated ${result.generatedCount} images!`);
      }

      return result;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Generate product error:', err);
      toast.error(`Generation failed: ${errorMessage}`);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generate,
    isLoading,
    progress,
    error,
  };
}
