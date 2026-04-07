import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserProduct, ProductAnalysis } from '@/components/app/product-images/types';

interface AnalysisState {
  /** Map of productId -> analysis */
  analyses: Record<string, ProductAnalysis>;
  /** Product IDs currently being analyzed */
  pending: Set<string>;
  /** Whether any analysis is in progress */
  isAnalyzing: boolean;
}

export function useProductAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    analyses: {},
    pending: new Set(),
    isAnalyzing: false,
  });

  /**
   * Analyze products that don't yet have analysis_json.
   * Returns the full analyses map once done.
   */
  const analyzeProducts = useCallback(async (products: UserProduct[]) => {
    // Collect already-analyzed products from DB cache
    const cached: Record<string, ProductAnalysis> = {};
    const needsAnalysis: UserProduct[] = [];

    for (const p of products) {
      const existing = (p as any).analysis_json as ProductAnalysis | null;
      if (existing?.category && existing?.version === 2) {
        cached[p.id] = existing;
      } else {
        needsAnalysis.push(p);
      }
    }

    if (needsAnalysis.length === 0) {
      setState(prev => ({ ...prev, analyses: { ...prev.analyses, ...cached }, isAnalyzing: false }));
      return cached;
    }

    // Mark as analyzing
    const pendingIds = new Set(needsAnalysis.map(p => p.id));
    setState(prev => ({
      ...prev,
      analyses: { ...prev.analyses, ...cached },
      pending: pendingIds,
      isAnalyzing: true,
    }));

    const newAnalyses: Record<string, ProductAnalysis> = { ...cached };

    // Analyze in parallel (max 3 concurrent)
    const chunks: UserProduct[][] = [];
    for (let i = 0; i < needsAnalysis.length; i += 3) {
      chunks.push(needsAnalysis.slice(i, i + 3));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (product) => {
          try {
            const { data, error } = await supabase.functions.invoke('analyze-product-category', {
              body: {
                imageUrl: product.image_url,
                title: product.title,
                description: product.description,
                productType: product.product_type,
              },
            });

            if (error || !data?.analysis) {
              console.warn(`Analysis failed for ${product.id}:`, error);
              // Fallback analysis
              newAnalyses[product.id] = {
                category: 'other',
                sizeClass: 'medium',
                colorFamily: 'neutral',
                materialFamily: 'mixed',
                finish: 'matte',
                packagingRelevant: false,
                personCompatible: true,
              };
            } else {
              newAnalyses[product.id] = data.analysis;
            }

            // Persist to DB (fire-and-forget)
            supabase
              .from('user_products')
              .update({ analysis_json: newAnalyses[product.id] as any })
              .eq('id', product.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.warn('Failed to cache analysis:', updateErr);
              });

            // Update state incrementally
            setState(prev => {
              const nextPending = new Set(prev.pending);
              nextPending.delete(product.id);
              return {
                analyses: { ...prev.analyses, [product.id]: newAnalyses[product.id] },
                pending: nextPending,
                isAnalyzing: nextPending.size > 0,
              };
            });
          } catch (err) {
            console.error(`Analysis error for ${product.id}:`, err);
            newAnalyses[product.id] = {
              category: 'other',
              sizeClass: 'medium',
              colorFamily: 'neutral',
              materialFamily: 'mixed',
              finish: 'matte',
              packagingRelevant: false,
              personCompatible: true,
            };
            setState(prev => {
              const nextPending = new Set(prev.pending);
              nextPending.delete(product.id);
              return {
                analyses: { ...prev.analyses, [product.id]: newAnalyses[product.id] },
                pending: nextPending,
                isAnalyzing: nextPending.size > 0,
              };
            });
          }
        }),
      );
    }

    return newAnalyses;
  }, []);

  /** Re-analyze a single product (force fresh analysis regardless of version) */
  const reAnalyzeProduct = useCallback(async (product: UserProduct) => {
    // Mark as pending
    setState(prev => {
      const nextPending = new Set(prev.pending);
      nextPending.add(product.id);
      return { ...prev, pending: nextPending, isAnalyzing: true };
    });

    try {
      const { data, error } = await supabase.functions.invoke('analyze-product-category', {
        body: {
          imageUrl: product.image_url,
          title: product.title,
          description: product.description,
          productType: product.product_type,
        },
      });

      const freshAnalysis: ProductAnalysis = (error || !data?.analysis)
        ? {
            category: 'other',
            sizeClass: 'medium',
            colorFamily: 'neutral',
            materialFamily: 'mixed',
            finish: 'matte',
            packagingRelevant: false,
            personCompatible: true,
          }
        : data.analysis;

      // Persist to DB
      supabase
        .from('user_products')
        .update({ analysis_json: freshAnalysis as any })
        .eq('id', product.id)
        .then(({ error: updateErr }) => {
          if (updateErr) console.warn('Failed to cache re-analysis:', updateErr);
        });

      // Update state
      setState(prev => {
        const nextPending = new Set(prev.pending);
        nextPending.delete(product.id);
        return {
          analyses: { ...prev.analyses, [product.id]: freshAnalysis },
          pending: nextPending,
          isAnalyzing: nextPending.size > 0,
        };
      });

      return freshAnalysis;
    } catch (err) {
      console.error(`Re-analysis error for ${product.id}:`, err);
      setState(prev => {
        const nextPending = new Set(prev.pending);
        nextPending.delete(product.id);
        return { ...prev, pending: nextPending, isAnalyzing: nextPending.size > 0 };
      });
      return null;
    }
  }, []);

  /** Manually override a product's category */
  const overrideCategory = useCallback((productId: string, category: ProductAnalysis['category']) => {
    setState(prev => {
      const existing = prev.analyses[productId];
      if (!existing) return prev;
      const updated = { ...existing, category };
      // Persist override
      supabase
        .from('user_products')
        .update({ analysis_json: updated as any })
        .eq('id', productId)
        .then(() => {});
      return {
        ...prev,
        analyses: { ...prev.analyses, [productId]: updated },
      };
    });
  }, []);

  return {
    analyses: state.analyses,
    isAnalyzing: state.isAnalyzing,
    pendingIds: state.pending,
    analyzeProducts,
    reAnalyzeProduct,
    overrideCategory,
  };
}
