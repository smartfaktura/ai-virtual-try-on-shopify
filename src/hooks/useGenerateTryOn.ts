import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Product, ModelProfile, TryOnPose, AspectRatio } from '@/types';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface GenerateTryOnParams {
  product: Product;
  model: ModelProfile;
  pose: TryOnPose;
  aspectRatio: AspectRatio;
  imageCount: number;
  sourceImageUrl: string;  // The specific product image to use as reference
  modelImageUrl: string;   // The model's preview image for appearance reference
}

interface GenerateTryOnResult {
  images: string[];
  generatedCount: number;
  requestedCount: number;
  partialSuccess?: boolean;
  errors?: string[];
}

interface UseGenerateTryOnReturn {
  generate: (params: GenerateTryOnParams) => Promise<GenerateTryOnResult | null>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export function useGenerateTryOn(): UseGenerateTryOnReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateTryOnParams): Promise<GenerateTryOnResult | null> => {
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

      // Convert both product and model images to base64 so AI model can access them
      console.log('[useGenerateTryOn] Converting images to base64...');
      const [base64ProductImage, base64ModelImage] = await Promise.all([
        convertImageToBase64(params.sourceImageUrl),
        convertImageToBase64(params.modelImageUrl),
      ]);
      console.log('[useGenerateTryOn] Images converted, sending to API');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
        },
        body: JSON.stringify({
          product: {
            title: params.product.title,
            description: params.product.description,
            productType: params.product.productType,
            imageUrl: base64ImageUrl,  // Send base64 instead of relative path
          },
          model: {
            name: params.model.name,
            gender: params.model.gender,
            ethnicity: params.model.ethnicity,
            bodyType: params.model.bodyType,
            ageRange: params.model.ageRange,
          },
          pose: {
            name: params.pose.name,
            description: params.pose.description,
            category: params.pose.category,
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

      const result: GenerateTryOnResult = await response.json();
      
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
      console.error('Generate try-on error:', err);
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
