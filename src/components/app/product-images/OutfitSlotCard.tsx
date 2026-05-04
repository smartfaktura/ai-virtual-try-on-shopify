// ── Reusable Outfit Slot Card ──
// Renders one slot (Top, Bottom, Shoes, Outerwear, Bag, Hat, etc.) with:
// Type chips → Sub-style chips → Color swatches → Material pills → Clear.
// When `locked` + `productThumb` are given, shows a locked product card instead.

import { Button } from '@/components/ui/button';
import { Lock, X, Plus } from 'lucide-react';
import type { OutfitPiece } from '@/components/app/product-images/types';
import { OUTFIT_COLORS, type GarmentTypeOption } from '@/lib/outfitVocabulary';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface OutfitSlotCardProps {
  label: string;                 // "TOP", "BOTTOM", "SHOES"…
  hint?: string;                 // e.g. "What's underneath?"
  ghostDefault?: string;         // ghost-text shown when slot empty (e.g. "Auto: white tee")
  types: GarmentTypeOption[];
  value?: OutfitPiece;
  onChange: (next: OutfitPiece | undefined) => void;
  locked?: boolean;
  productThumb?: string;
  productName?: string;
  onAddLayer?: () => void;       // shown only when this is a "top" slot and outerwear is allowed
  layerLabel?: string;
  showFit?: boolean;
}

const FIT_OPTIONS = ['Slim', 'Relaxed', 'Oversized', 'Cropped'];

export function OutfitSlotCard({
  label, hint, ghostDefault, types, value, onChange,
  locked, productThumb, productName, onAddLayer, layerLabel, showFit = true,
}: OutfitSlotCardProps) {
  // ── Locked state: product fills this slot ──
  if (locked) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
        <div className="flex items-center gap-3">
          <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">{label}</span>
          {productThumb && (
            <img src={getOptimizedUrl(productThumb, { quality: 60 })} alt={productName || ''} className="h-9 w-9 rounded-md object-cover border" />
          )}
          <span className="text-xs text-muted-foreground truncate">
            Filled by your {productName || 'product'}
          </span>
        </div>
        {onAddLayer && (
          <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5" onClick={onAddLayer}>
            <Plus className="h-3 w-3" /> {layerLabel || '+ Add layer over (jacket, blazer, shirt, cardigan)'}
          </Button>
        )}
      </div>
    );
  }

  const selectedType = types.find(t => t.id === value?.garment);

  return (
    <div className="rounded-xl border bg-card/40 p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">{label}</span>
          {hint && <span className="text-[10px] text-muted-foreground/70 truncate">· {hint}</span>}
          {!value?.garment && ghostDefault && (
            <span className="text-[10px] text-muted-foreground/50 italic truncate">· {ghostDefault}</span>
          )}
        </div>
        {value?.garment && value.garment !== 'none' && (
          <button
            onClick={() => onChange(undefined)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Clear ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-1.5">
        {types.map(t => {
          const active = value?.garment === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange({ garment: t.id, color: value?.color || '', subtype: undefined, material: undefined, fit: value?.fit })}
              className={cn(
                'h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors',
                active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-style chips (contextual) */}
      {selectedType?.subtypes && selectedType.subtypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedType.subtypes.map(s => {
            const active = value?.subtype === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ ...value!, subtype: active ? undefined : s })}
                className={cn(
                  'h-6 px-2 rounded-md text-[10px] font-medium border transition-colors',
                  active ? 'bg-foreground text-background border-foreground' : 'bg-muted/50 hover:bg-muted border-border/50 text-muted-foreground',
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Color swatches */}
      {value?.garment && value.garment !== 'none' && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] text-muted-foreground/70 w-12">Color</span>
          {OUTFIT_COLORS.map(c => {
            const active = value?.color === c.label.toLowerCase();
            return (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => onChange({ ...value!, color: c.label.toLowerCase() })}
                className={cn(
                  'h-5 w-5 rounded-full border-2 transition-all',
                  active ? 'border-primary scale-110 ring-2 ring-primary/30' : 'border-border hover:scale-105',
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      )}

      {/* Material pills */}
      {value?.garment && value.garment !== 'none' && selectedType?.materials && selectedType.materials.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/70 w-12">Material</span>
          {selectedType.materials.map(m => {
            const active = value?.material === m;
            return (
              <button
                key={m}
                onClick={() => onChange({ ...value!, material: active ? undefined : m })}
                className={cn(
                  'h-6 px-2 rounded-md text-[10px] font-medium border transition-colors',
                  active ? 'bg-foreground text-background border-foreground' : 'bg-muted/30 hover:bg-muted border-border/50',
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* Fit pills */}
      {value?.garment && value.garment !== 'none' && showFit && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/70 w-12">Fit</span>
          {FIT_OPTIONS.map(f => {
            const active = value?.fit === f.toLowerCase();
            return (
              <button
                key={f}
                onClick={() => onChange({ ...value!, fit: active ? undefined : f.toLowerCase() })}
                className={cn(
                  'h-6 px-2 rounded-md text-[10px] font-medium border transition-colors',
                  active ? 'bg-foreground text-background border-foreground' : 'bg-muted/30 hover:bg-muted border-border/50',
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
