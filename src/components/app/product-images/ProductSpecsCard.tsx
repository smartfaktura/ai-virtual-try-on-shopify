import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Info, ChevronDown, ChevronUp, Ruler, Check, Loader2 } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCategoryPlaceholder, getCategoryLabel, sanitizeSpecInput } from '@/lib/productSpecFields';
import { buildSpecsPromptLine } from '@/lib/productSpecFields';
import { supabase } from '@/integrations/supabase/client';
import type { UserProduct, ProductAnalysis } from './types';

interface ProductSpecsCardProps {
  allProducts: UserProduct[];
  selectedProductIds: Set<string>;
  analyses: Record<string, ProductAnalysis>;
  productSpecs: Record<string, string>;
  onProductSpecsChange: (specs: Record<string, string>) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export function ProductSpecsCard({
  allProducts,
  selectedProductIds,
  analyses,
  productSpecs,
  onProductSpecsChange,
}: ProductSpecsCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [saveStatuses, setSaveStatuses] = useState<Record<string, SaveStatus>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const productsNeedingSpecs = useMemo(() => {
    return allProducts.filter(p => {
      if (!selectedProductIds.has(p.id)) return false;
      if (p.dimensions && p.dimensions.trim().length > 0 && !productSpecs[p.id]) return false;
      return true;
    });
  }, [allProducts, selectedProductIds, productSpecs]);

  // Auto-open first product with empty specs
  useEffect(() => {
    if (openProductId) return;
    const first = productsNeedingSpecs.find(p => !productSpecs[p.id]?.trim());
    if (first) setOpenProductId(first.id);
    else if (productsNeedingSpecs.length > 0) setOpenProductId(productsNeedingSpecs[0].id);
  }, [productsNeedingSpecs, openProductId, productSpecs]);

  // Cleanup timers
  useEffect(() => {
    const t = timersRef.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  const filledCount = useMemo(() => {
    return productsNeedingSpecs.filter(p => productSpecs[p.id]?.trim()).length;
  }, [productsNeedingSpecs, productSpecs]);

  const persistSpec = useCallback(async (productId: string, raw: string) => {
    setSaveStatuses(s => ({ ...s, [productId]: 'saving' }));
    const dimStr = buildSpecsPromptLine(raw);
    await supabase.from('user_products').update({ dimensions: dimStr || null }).eq('id', productId);
    setSaveStatuses(s => ({ ...s, [productId]: 'saved' }));
  }, []);

  const updateSpecs = useCallback((productId: string, value: string) => {
    const sanitized = sanitizeSpecInput(value, 500);
    onProductSpecsChange({ ...productSpecs, [productId]: sanitized });
    setSaveStatuses(s => ({ ...s, [productId]: 'idle' }));

    // Debounced auto-save
    if (timersRef.current[productId]) clearTimeout(timersRef.current[productId]);
    timersRef.current[productId] = setTimeout(() => {
      if (sanitized.trim()) persistSpec(productId, sanitized);
    }, 800);
  }, [productSpecs, onProductSpecsChange, persistSpec]);

  const toggleProduct = useCallback((id: string) => {
    setOpenProductId(prev => prev === id ? null : id);
  }, []);

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
              <p className="text-xs text-muted-foreground mt-0.5">
                {collapsed && productsNeedingSpecs.length > 1
                  ? `${filledCount} of ${productsNeedingSpecs.length} products have details`
                  : 'Add dimensions and details to improve accuracy'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-wider">Optional</span>
            {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {!collapsed && (
          <div className="space-y-1.5 pt-1 max-h-[360px] overflow-y-auto">
            {productsNeedingSpecs.map(product => {
              const analysis = analyses[product.id];
              const category = analysis?.category || product.product_type;
              const placeholder = getCategoryPlaceholder(category);
              const categoryLabel = getCategoryLabel(category);
              const value = productSpecs[product.id] || '';
              const isOpen = openProductId === product.id;
              const status = saveStatuses[product.id] || 'idle';
              const hasFilled = value.trim().length > 0;

              return (
                <div key={product.id} className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="flex items-center gap-2.5 w-full text-left p-3"
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={getOptimizedUrl(product.image_url, { quality: 50 })}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{product.title}</p>
                      <p className="text-[10px] text-muted-foreground">{categoryLabel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {status === 'saving' && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
                      {status === 'saved' && <Check className="w-3 h-3 text-emerald-500" />}
                      {status === 'idle' && hasFilled && <Check className="w-3 h-3 text-muted-foreground/50" />}
                      {isOpen
                        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded textarea */}
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-1.5">
                      <Textarea
                        value={value}
                        onChange={(e) => updateSpecs(product.id, e.target.value)}
                        placeholder={placeholder}
                        className="text-xs min-h-[52px] resize-none"
                        rows={2}
                        maxLength={500}
                      />
                      <p className="text-[10px] text-muted-foreground text-right tabular-nums">
                        {value.length}/500
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-start gap-1.5 pt-1.5">
              <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                Details are auto-saved and reused in future generations
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
