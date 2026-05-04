import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getSpecFieldsForCategory, getDisplayUnit, type SpecField, type CategorySpecConfig, type UnitSystem } from '@/lib/productSpecFields';
import type { UserProduct } from './types';
import type { ProductAnalysis } from './types';

export interface ProductSpecValues {
  specs: Record<string, string>;
  notes: string;
}

interface ProductSpecsCardProps {
  allProducts: UserProduct[];
  selectedProductIds: Set<string>;
  analyses: Record<string, ProductAnalysis>;
  productSpecs: Record<string, ProductSpecValues>;
  onProductSpecsChange: (specs: Record<string, ProductSpecValues>) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
}

export function ProductSpecsCard({
  allProducts,
  selectedProductIds,
  analyses,
  productSpecs,
  onProductSpecsChange,
  unitSystem,
  onUnitSystemChange,
}: ProductSpecsCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Only show products that lack a stored dimensions value
  const productsNeedingSpecs = useMemo(() => {
    return allProducts.filter(p => {
      if (!selectedProductIds.has(p.id)) return false;
      if (p.dimensions && p.dimensions.trim().length > 0 && !productSpecs[p.id]) return false;
      return true;
    });
  }, [allProducts, selectedProductIds, productSpecs]);

  const updateSpec = useCallback((productId: string, key: string, value: string) => {
    const existing = productSpecs[productId] || { specs: {}, notes: '' };
    onProductSpecsChange({
      ...productSpecs,
      [productId]: {
        ...existing,
        specs: { ...existing.specs, [key]: value },
      },
    });
  }, [productSpecs, onProductSpecsChange]);

  const updateNotes = useCallback((productId: string, notes: string) => {
    const existing = productSpecs[productId] || { specs: {}, notes: '' };
    onProductSpecsChange({
      ...productSpecs,
      [productId]: { ...existing, notes },
    });
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
              <h3 className="text-sm font-semibold tracking-tight">Product Specifications</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Add dimensions to improve accuracy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-wider">Optional</span>
            {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {!collapsed && (
          <div className="space-y-4 pt-1">
            {/* Unit system toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">Measurement units</span>
              <div className="flex rounded-md border border-border/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => onUnitSystemChange('metric')}
                  className={cn(
                    'px-3 py-1 text-[11px] font-medium transition-colors',
                    unitSystem === 'metric'
                      ? 'bg-foreground text-background'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  cm · mm · ml
                </button>
                <button
                  type="button"
                  onClick={() => onUnitSystemChange('imperial')}
                  className={cn(
                    'px-3 py-1 text-[11px] font-medium transition-colors border-l border-border/60',
                    unitSystem === 'imperial'
                      ? 'bg-foreground text-background'
                      : 'bg-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  in · oz · fl oz
                </button>
              </div>
            </div>

            {productsNeedingSpecs.map(product => {
              const analysis = analyses[product.id];
              const category = analysis?.category || product.product_type;
              const config = getSpecFieldsForCategory(category);
              const specValues = productSpecs[product.id]?.specs || {};
              const notesValue = productSpecs[product.id]?.notes || '';

              return (
                <ProductSpecRow
                  key={product.id}
                  product={product}
                  config={config}
                  specValues={specValues}
                  notesValue={notesValue}
                  unitSystem={unitSystem}
                  onSpecChange={(key, val) => updateSpec(product.id, key, val)}
                  onNotesChange={(val) => updateNotes(product.id, val)}
                />
              );
            })}

            <div className="flex items-start gap-1.5 pt-1">
              <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                Specifications are saved to your product and used in every future generation
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductSpecRow({
  product,
  config,
  specValues,
  notesValue,
  unitSystem,
  onSpecChange,
  onNotesChange,
}: {
  product: UserProduct;
  config: CategorySpecConfig;
  specValues: Record<string, string>;
  notesValue: string;
  unitSystem: UnitSystem;
  onSpecChange: (key: string, value: string) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-3">
      {/* Product header */}
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
          <p className="text-[10px] text-muted-foreground">{config.groupLabel}</p>
        </div>
      </div>

      {/* Spec fields */}
      <div className="grid grid-cols-2 gap-2">
        {config.fields.map((field) => (
          <SpecInput
            key={field.key}
            field={field}
            value={specValues[field.key] || ''}
            unitSystem={unitSystem}
            onChange={(val) => onSpecChange(field.key, val)}
          />
        ))}
      </div>

      {/* Additional details */}
      <Textarea
        value={notesValue}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Additional details (e.g. matte black finish, curved legs, 2-pack)"
        className="text-xs min-h-[52px] resize-none"
        rows={2}
        maxLength={500}
      />
    </div>
  );
}

function SpecInput({
  field,
  value,
  unitSystem,
  onChange,
}: {
  field: SpecField;
  value: string;
  unitSystem: UnitSystem;
  onChange: (value: string) => void;
}) {
  const displayUnit = getDisplayUnit(field, unitSystem);

  if (field.type === 'select' && field.options) {
    return (
      <div className={cn(field.half ? 'col-span-1' : 'col-span-2')}>
        <label className="text-[10px] text-muted-foreground font-medium mb-1 block">{field.label}</label>
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(opt => (
              <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Determine if this is a numeric-like field (has a unit)
  const isNumeric = !!field.unit;

  return (
    <div className={cn(field.half ? 'col-span-1' : 'col-span-2')}>
      <label className="text-[10px] text-muted-foreground font-medium mb-1 block">{field.label}</label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="h-8 text-xs pr-8"
          maxLength={100}
          inputMode={isNumeric ? 'decimal' : 'text'}
        />
        {displayUnit && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
            {displayUnit}
          </span>
        )}
      </div>
    </div>
  );
}
