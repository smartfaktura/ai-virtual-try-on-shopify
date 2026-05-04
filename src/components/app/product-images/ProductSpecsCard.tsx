import { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Info, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import { useState } from 'react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCategoryPlaceholder, getCategoryLabel } from '@/lib/productSpecFields';
import type { UserProduct, ProductAnalysis } from './types';

interface ProductSpecsCardProps {
  allProducts: UserProduct[];
  selectedProductIds: Set<string>;
  analyses: Record<string, ProductAnalysis>;
  productSpecs: Record<string, string>;
  onProductSpecsChange: (specs: Record<string, string>) => void;
}

export function ProductSpecsCard({
  allProducts,
  selectedProductIds,
  analyses,
  productSpecs,
  onProductSpecsChange,
}: ProductSpecsCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const productsNeedingSpecs = useMemo(() => {
    return allProducts.filter(p => {
      if (!selectedProductIds.has(p.id)) return false;
      // Show if no stored dimensions or user already started typing
      if (p.dimensions && p.dimensions.trim().length > 0 && !productSpecs[p.id]) return false;
      return true;
    });
  }, [allProducts, selectedProductIds, productSpecs]);

  const updateSpecs = useCallback((productId: string, value: string) => {
    onProductSpecsChange({ ...productSpecs, [productId]: value });
  }, [productSpecs, onProductSpecsChange]);

  if (productsNeedingSpecs.length === 0) return null;

  return (
    <Card className="border-amber-500/20 bg-amber-500/[0.03]">
      <CardContent className="p-5 space-y-4">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10">
              <Ruler className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Product Details</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Add dimensions and details to improve accuracy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-wider">Optional</span>
            {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {!collapsed && (
          <div className="space-y-3 pt-1">
            {productsNeedingSpecs.map(product => {
              const analysis = analyses[product.id];
              const category = analysis?.category || product.product_type;
              const placeholder = getCategoryPlaceholder(category);
              const categoryLabel = getCategoryLabel(category);
              const value = productSpecs[product.id] || '';

              return (
                <div key={product.id} className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={getOptimizedUrl(product.image_url, { quality: 50 })}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{product.title}</p>
                      <p className="text-[10px] text-muted-foreground">{categoryLabel}</p>
                    </div>
                  </div>
                  <Textarea
                    value={value}
                    onChange={(e) => updateSpecs(product.id, e.target.value)}
                    placeholder={placeholder}
                    className="text-xs min-h-[52px] resize-none"
                    rows={2}
                    maxLength={500}
                  />
                </div>
              );
            })}

            <div className="flex items-start gap-1.5 pt-1">
              <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                Details are saved to your product and reused in future generations
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
