import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface VariationInput {
  label: string;
  instruction: string;
  referenceImageUrl: string | null;
}

interface ProductInput {
  id: string;
  imageUrl: string;
  title: string;
}

interface GenerateParams {
  products: ProductInput[];
  variations: VariationInput[];
  ratios: string[];
  quality: 'standard' | 'high';
}

interface UseGeneratePerspectivesOptions {
  onComplete?: () => void;
}

export function useGeneratePerspectives(options?: UseGeneratePerspectivesOptions) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = useCallback(async (params: GenerateParams) => {
    if (!user) {
      toast.error('Please sign in to generate');
      return;
    }

    const { products, variations, ratios, quality } = params;
    const totalJobs = products.length * variations.length * ratios.length;

    if (totalJobs === 0) {
      toast.error('Select at least one product, angle, and ratio');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    if (!token) {
      toast.error('Authentication required');
      setIsGenerating(false);
      return;
    }

    const batchId = crypto.randomUUID();
    let enqueuedCount = 0;

    // Enqueue sequentially to avoid credit race conditions
    for (const product of products) {
      // Convert product image to base64 once per product
      let productBase64: string | null = null;
      try {
        productBase64 = await convertImageToBase64(product.imageUrl);
      } catch {
        toast.error(`Failed to load image for ${product.title}`);
        continue;
      }

      for (const variation of variations) {
        // Convert reference image if provided
        let referenceBase64: string | null = null;
        if (variation.referenceImageUrl) {
          try {
            referenceBase64 = await convertImageToBase64(variation.referenceImageUrl);
          } catch {
            // Non-critical — proceed without reference
            console.warn('Failed to load reference image:', variation.referenceImageUrl);
          }
        }

        for (const ratio of ratios) {
          const variationPrompt = `${variation.instruction}\n\nProduct: ${product.title}. Maintain the exact product identity from the source image. Generate from the "${variation.label}" perspective.`;

          const payload: Record<string, unknown> = {
            prompt: variationPrompt,
            productImage: productBase64,
            aspectRatio: ratio,
            quality,
            polishPrompt: true,
            imageCount: 1,
            batch_id: batchId,
            productId: product.id === 'direct' ? null : product.id,
            // Perspective-specific fields
            variation_instruction: variation.instruction,
            variation_label: variation.label,
          };

          // If a reference image was uploaded for this angle, pass it as sourceImage
          // This makes it act as [REFERENCE IMAGE] in the prompt builder
          if (referenceBase64) {
            payload.sourceImage = referenceBase64;
          }

          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/enqueue-generation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                jobType: 'freestyle',
                payload,
                imageCount: 1,
                quality,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));

              if (response.status === 402) {
                toast.error(`Insufficient credits. ${enqueuedCount} of ${totalJobs} queued.`);
                break;
              }
              if (response.status === 429) {
                toast.error(errorData.message || `Rate limit reached. ${enqueuedCount} of ${totalJobs} queued.`);
                break;
              }

              toast.error(errorData.error || `Failed to enqueue job`);
              continue;
            }

            enqueuedCount++;
            setProgress(Math.round((enqueuedCount / totalJobs) * 100));
          } catch (err) {
            console.error('Enqueue error:', err);
            continue;
          }
        }
      }
    }

    if (enqueuedCount > 0) {
      toast.success(`${enqueuedCount} perspective${enqueuedCount > 1 ? 's' : ''} queued!`);
      options?.onComplete?.();
    } else {
      toast.error('No images were queued');
    }

    setIsGenerating(false);
    setProgress(0);
  }, [user, options]);

  return { generate, isGenerating, progress };
}
