import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface BrandProfileContext {
  tone: string;
  lightingStyle: string;
  backgroundStyle: string;
  colorTemperature: string;
  compositionBias: string;
  doNotRules: string[];
}

interface FreestyleParams {
  prompt: string;
  sourceImage?: string;
  modelImage?: string;
  sceneImage?: string;
  aspectRatio: string;
  imageCount: number;
  quality: 'standard' | 'high';
  polishPrompt: boolean;
  modelContext?: string;
  stylePresets?: string[];
  brandProfile?: BrandProfileContext;
  negatives?: string[];
}

interface FreestyleResult {
  images: string[];
  generatedCount: number;
  requestedCount: number;
  partialSuccess?: boolean;
  errors?: string[];
}

interface UseGenerateFreestyleReturn {
  generate: (params: FreestyleParams) => Promise<FreestyleResult | null>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export function useGenerateFreestyle(): UseGenerateFreestyleReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: FreestyleParams): Promise<FreestyleResult | null> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 90 ? prev : prev + Math.random() * 8);
    }, 600);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!SUPABASE_URL) {
        throw new Error('Backend not configured');
      }

      // Convert images to base64 if provided
      let sourceImageBase64: string | undefined;
      let modelImageBase64: string | undefined;

      if (params.sourceImage) {
        sourceImageBase64 = await convertImageToBase64(params.sourceImage);
      }
      if (params.modelImage) {
        modelImageBase64 = await convertImageToBase64(params.modelImage);
      }

      let sceneImageBase64: string | undefined;
      if (params.sceneImage) {
        sceneImageBase64 = await convertImageToBase64(params.sceneImage);
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-freestyle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
        },
        body: JSON.stringify({
          prompt: params.prompt,
          sourceImage: sourceImageBase64,
          modelImage: modelImageBase64,
          sceneImage: sceneImageBase64,
          aspectRatio: params.aspectRatio,
          imageCount: params.imageCount,
          quality: params.quality,
          polishPrompt: params.polishPrompt,
          modelContext: params.modelContext,
          stylePresets: params.stylePresets,
          brandProfile: params.brandProfile,
          negatives: params.negatives,
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

      const result: FreestyleResult = await response.json();
      setProgress(100);

      if (result.partialSuccess) {
        toast.warning(`Generated ${result.generatedCount} of ${result.requestedCount} images.`);
      } else {
        toast.success(`Generated ${result.generatedCount} image${result.generatedCount > 1 ? 's' : ''}!`);
      }

      return result;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Freestyle generation error:', err);
      toast.error(`Generation failed: ${errorMessage}`);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, isLoading, progress, error };
}
