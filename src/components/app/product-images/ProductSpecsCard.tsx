import { useMemo, useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Ruler, Check, Loader2, Save } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCategoryGuide, getCategoryLabel, getNotesPlaceholder, sanitizeSpecInput, buildSpecsPromptLine } from '@/lib/productSpecFields';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import type { UserProduct, ProductAnalysis } from './types';

interface ProductSpecsCardProps {
  allProducts: UserProduct[];
  selectedProductIds: Set<string>;
  analyses: Record<string, ProductAnalysis>;
  productSpecs: Record<string, string>;
  onProductSpecsChange: (specs: Record<string, string>) => void;
}

// Internal structured state per product
interface ProductSpecData {
  dimValues: Record<string, string>; // label -> value
  notes: string;
}

/** Serialize structured data into a flat string for prompt/storage */
function serializeSpec(data: ProductSpecData, category: string | undefined | null): string {
  const guide = getCategoryGuide(category);
  const parts: string[] = [];

  for (const dim of guide.dimensions) {
    const val = data.dimValues[dim.label]?.trim();
    if (val) {
      parts.push(`${dim.label}: ${val}${dim.unit ? dim.unit : ''}`);
    }
  }

  const notes = data.notes.trim();
  if (notes) {
    if (parts.length > 0) {
      parts.push(notes);
    } else {
      return notes;
    }
  }

  return parts.join(', ');
}

/** Parse a flat spec string back into structured data (best-effort) */
function parseSpec(raw: string, category: string | undefined | null): ProductSpecData {
  const guide = getCategoryGuide(category);
  const dimValues: Record<string, string> = {};
  let remaining = raw;

  for (const dim of guide.dimensions) {
    const pattern = new RegExp(`${dim.label}:\\s*([^,]+)`, 'i');
    const match = remaining.match(pattern);
    if (match) {
      let val = match[1].trim();
      if (dim.unit && val.endsWith(dim.unit)) {
        val = val.slice(0, -dim.unit.length).trim();
      }
      dimValues[dim.label] = val;
      remaining = remaining.replace(match[0], '');
    }
  }

  // Clean up leftover commas/whitespace
  const notes = remaining.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ', ').trim();

  return { dimValues, notes };
}

export function ProductSpecsCard({
  allProducts,
  selectedProductIds,
  analyses,
  productSpecs,
  onProductSpecsChange,
}: ProductSpecsCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedSpecs, setLastSavedSpecs] = useState<Record<string, string>>({});

  const productsNeedingSpecs = useMemo(() => {
    return allProducts.filter(p => {
      if (!selectedProductIds.has(p.id)) return false;
      if (p.dimensions && p.dimensions.trim().length > 0 && !productSpecs[p.id]) return false;
      return true;
    });
  }, [allProducts, selectedProductIds, productSpecs]);

  // Auto-open first product
  useMemo(() => {
    if (openProductId) return;
    const first = productsNeedingSpecs.find(p => !productSpecs[p.id]?.trim());
    if (first) setOpenProductId(first.id);
    else if (productsNeedingSpecs.length > 0) setOpenProductId(productsNeedingSpecs[0].id);
  }, [productsNeedingSpecs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filledCount = useMemo(() => {
    return productsNeedingSpecs.filter(p => productSpecs[p.id]?.trim()).length;
  }, [productsNeedingSpecs, productSpecs]);

  const hasUnsavedChanges = useMemo(() => {
    return productsNeedingSpecs.some(p => {
      const current = productSpecs[p.id] || '';
      const saved = lastSavedSpecs[p.id] || '';
      return current !== saved;
    });
  }, [productsNeedingSpecs, productSpecs, lastSavedSpecs]);

  const getCategory = useCallback((product: UserProduct) => {
    const analysis = analyses[product.id];
    return analysis?.category || product.product_type;
  }, [analyses]);

  const updateStructured = useCallback((productId: string, category: string | undefined | null, data: ProductSpecData) => {
    const serialized = serializeSpec(data, category);
    onProductSpecsChange({ ...productSpecs, [productId]: serialized });
  }, [productSpecs, onProductSpecsChange]);

  const getStructured = useCallback((productId: string, category: string | undefined | null): ProductSpecData => {
    const raw = productSpecs[productId] || '';
    return parseSpec(raw, category);
  }, [productSpecs]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updates = productsNeedingSpecs
        .filter(p => (productSpecs[p.id] || '').trim())
        .map(p => {
          const dimStr = buildSpecsPromptLine(productSpecs[p.id]);
          return supabase.from('user_products').update({ dimensions: dimStr || null }).eq('id', p.id);
        });
      await Promise.all(updates);
      setLastSavedSpecs({ ...productSpecs });
      toast({ title: 'Product details saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [productsNeedingSpecs, productSpecs]);

  const toggleProduct = useCallback((id: string) => {
    setOpenProductId(prev => prev === id ? null : id);
  }, []);

  const appendExtra = useCallback((productId: string, category: string | undefined | null, chip: string) => {
    const data = getStructured(productId, category);
    const notes = data.notes ? `${data.notes}, ${chip}` : chip;
    updateStructured(productId, category, { ...data, notes: sanitizeSpecInput(notes, 500) });
  }, [getStructured, updateStructured]);

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
          <div className="space-y-2 pt-1">
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {productsNeedingSpecs.map(product => {
                const category = getCategory(product);
                const categoryLabel = getCategoryLabel(category);
                const isOpen = openProductId === product.id;
                const guide = getCategoryGuide(category);
                const data = getStructured(product.id, category);
                const hasFilled = (productSpecs[product.id] || '').trim().length > 0;

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
                        {hasFilled && <Check className="w-3 h-3 text-emerald-500" />}
                        {isOpen
                          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Structured dimension inputs */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {guide.dimensions.map(dim => (
                            <div key={dim.label} className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {dim.label}
                              </label>
                              <div className="flex items-center gap-1">
                                <Input
                                  value={data.dimValues[dim.label] || ''}
                                  onChange={(e) => {
                                    const newDims = { ...data.dimValues, [dim.label]: e.target.value };
                                    updateStructured(product.id, category, { ...data, dimValues: newDims });
                                  }}
                                  placeholder={dim.placeholder}
                                  className="h-8 text-xs"
                                  inputMode={/^\d/.test(dim.placeholder) ? 'decimal' : 'text'}
                                  maxLength={50}
                                />
                                {dim.unit && (
                                  <span className="text-[10px] text-muted-foreground flex-shrink-0 w-6">{dim.unit}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hint chips */}
                        {guide.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {guide.extras.map(chip => {
                              const isUsed = data.notes.toLowerCase().includes(chip.toLowerCase());
                              return (
                                <button
                                  key={chip}
                                  onClick={() => !isUsed && appendExtra(product.id, category, chip)}
                                  disabled={isUsed}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                                    isUsed
                                      ? 'border-primary/30 bg-primary/10 text-primary cursor-default'
                                      : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'
                                  }`}
                                >
                                  {isUsed ? '✓ ' : '+ '}{chip}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Additional notes textarea */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Additional Notes
                          </label>
                          <Textarea
                            value={data.notes}
                            onChange={(e) => {
                              updateStructured(product.id, category, {
                                ...data,
                                notes: e.target.value,
                              });
                            }}
                            placeholder={getNotesPlaceholder()}
                            className="text-xs min-h-[44px] resize-none"
                            rows={2}
                            maxLength={500}
                          />
                          <p className="text-[10px] text-muted-foreground text-right tabular-nums">
                            {data.notes.length}/500
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Details are saved to your product and reused in future generations
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="h-8 text-xs gap-1.5 flex-shrink-0"
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {saving ? 'Saving…' : 'Save Details'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
