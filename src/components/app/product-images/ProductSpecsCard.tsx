import { useMemo, useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, ChevronDown, ChevronUp, Ruler, Check, Loader2, Save } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getCategoryFields, getCategoryLabel, sanitizeSpecInput, buildSpecsPromptLine, isApparelCategory } from '@/lib/productSpecFields';
import type { SpecField } from '@/lib/productSpecFields';
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

// Internal structured state: field key -> value
type FieldValues = Record<string, string>;

interface ProductSpecData {
  fields: FieldValues;
  notes: string;
}

/** Serialize structured fields + notes into a flat string */
function serializeSpec(data: ProductSpecData, specFields: SpecField[]): string {
  const parts: string[] = [];
  for (const f of specFields) {
    const val = data.fields[f.key]?.trim();
    if (val) {
      parts.push(`${f.label}: ${val}${f.unit && !val.includes(f.unit) ? f.unit : ''}`);
    }
  }
  const notes = data.notes.trim();
  if (notes) parts.push(notes);
  return parts.join(', ');
}

/** Parse a flat string back into structured data (best-effort) */
function parseSpec(raw: string, specFields: SpecField[]): ProductSpecData {
  const fields: FieldValues = {};
  let remaining = raw;

  for (const f of specFields) {
    // Escape special regex chars in label
    const escaped = f.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escaped}:\\s*([^,]+)`, 'i');
    const match = remaining.match(pattern);
    if (match) {
      let val = match[1].trim();
      if (f.unit && val.endsWith(f.unit)) {
        val = val.slice(0, -f.unit.length).trim();
      }
      fields[f.key] = val;
      remaining = remaining.replace(match[0], '');
    }
  }

  const notes = remaining.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ', ').trim();
  return { fields, notes };
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

  const updateStructured = useCallback((productId: string, specFields: SpecField[], data: ProductSpecData) => {
    const serialized = serializeSpec(data, specFields);
    onProductSpecsChange({ ...productSpecs, [productId]: serialized });
  }, [productSpecs, onProductSpecsChange]);

  const getStructured = useCallback((productId: string, specFields: SpecField[]): ProductSpecData => {
    const raw = productSpecs[productId] || '';
    return parseSpec(raw, specFields);
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
      toast.success('Product details saved');
    } catch {
      toast.error('Failed to save details');
    } finally {
      setSaving(false);
    }
  }, [productsNeedingSpecs, productSpecs]);

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
          <div className="space-y-2 pt-1">
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
              {productsNeedingSpecs.map(product => {
                const category = getCategory(product);
                const categoryLabel = getCategoryLabel(category);
                const isOpen = openProductId === product.id;
                const specFields = getCategoryFields(category);
                const data = getStructured(product.id, specFields);
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
                        {/* Spec fields grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2.5">
                          {specFields.map(field => (
                            <div key={field.key} className="space-y-1">
                              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {field.label}
                              </label>

                              {field.type === 'select' && field.options ? (
                                <Select
                                  value={data.fields[field.key] || undefined}
                                  onValueChange={(val) => {
                                    const newFields = { ...data.fields, [field.key]: val };
                                    updateStructured(product.id, specFields, { ...data, fields: newFields });
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={data.fields[field.key] || ''}
                                    onChange={(e) => {
                                      const newFields = { ...data.fields, [field.key]: e.target.value };
                                      updateStructured(product.id, specFields, { ...data, fields: newFields });
                                    }}
                                    placeholder={field.placeholder}
                                    className="h-8 text-xs"
                                    inputMode={field.placeholder && /^\d/.test(field.placeholder) ? 'decimal' : 'text'}
                                    maxLength={50}
                                  />
                                  {field.unit && (
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0 min-w-[20px]">{field.unit}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {isApparelCategory(category) && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Fabric is auto-detected from your product image
                          </p>
                        )}

                        {/* Additional notes */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Additional Notes
                          </label>
                          <Textarea
                            value={data.notes}
                            onChange={(e) => {
                              updateStructured(product.id, specFields, { ...data, notes: e.target.value });
                            }}
                            placeholder="Any additional details about your product…"
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
