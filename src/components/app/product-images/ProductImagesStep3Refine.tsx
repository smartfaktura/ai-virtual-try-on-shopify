import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColorPickerDialog } from '@/components/app/product-images/ColorPickerDialog';
import { ProductThumbnail } from '@/components/app/product-images/ProductThumbnail';
import { useUserSavedColors } from '@/hooks/useUserSavedColors';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Crown, UserX, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Paintbrush, User, Users, Layers, Camera, ChevronDown, ChevronRight, RotateCcw, Upload,
  ImageIcon, Coins, Plus, X, Search, PackagePlus, Settings2, Sparkles, Lock, Shirt,
  Save, Trash2, History, Check, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getBlocksByScene, BLOCK_FIELD_MAP, REFERENCE_TRIGGERS } from './detailBlockConfig';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import type { DetailSettings, ProductImageScene, UserProduct, RefineSettings, OverallAesthetic, PersonStyling, ProductCategory, OutfitConfig, OutfitPiece, OutfitPreset, ProductAnalysis } from './types';
import type { ModelProfile } from '@/types';
import { getConflictingSlots, resolveGarmentType, type OutfitSlot } from '@/lib/productImagePromptBuilder';
import { OutfitSlotCard } from './OutfitSlotCard';
import { OutfitPresetBar } from './OutfitPresetBar';
import { resolveOutfitConflicts, type OutfitSlotKey } from '@/lib/outfitConflictResolver';
import {
  TOP_TYPES, BOTTOM_TYPES, OUTERWEAR_TYPES, DRESS_TYPES, SHOE_TYPES,
  BAG_TYPES, HAT_TYPES, EYEWEAR_TYPES, BELT_TYPES, WATCH_TYPES, COVER_UP_TYPES,
  JEWELRY_NECKLACES, JEWELRY_EARRINGS, JEWELRY_BRACELETS, JEWELRY_RINGS, JEWELRY_METALS,
  pickDefaultPreset, pickDefaultPresetPerProduct,
} from '@/lib/outfitVocabulary';
import { AiStylistCard } from './AiStylistCard';
import { toast } from '@/lib/brandedToast';

/* ══════════════════════════════════════════════
   Model Picker with Brand / Library sections
   ══════════════════════════════════════════════ */

function ModelPickerSections({ userModels, globalModels, selectedModelId, selectedModelIds, onSelect, onMultiSelect, previewImages, isFree, freeLimitReached, onFreeLimitHit, onUpgradeClick }: {
  userModels: ModelProfile[];
  globalModels: ModelProfile[];
  selectedModelId?: string;
  selectedModelIds?: string[];
  onSelect: (id: string) => void;
  onMultiSelect?: (ids: string[]) => void;
  previewImages?: string[];
  isFree?: boolean;
  freeLimitReached?: boolean;
  onFreeLimitHit?: () => void;
  onUpgradeClick?: () => void;
}) {
  const navigate = useNavigate();
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalGender, setModalGender] = useState<'all' | 'female' | 'male'>('all');
  const [modalSearch, setModalSearch] = useState('');

  // Use multi-select IDs if available, fallback to single
  const activeIds = useMemo(() => {
    if (selectedModelIds && selectedModelIds.length > 0) return new Set(selectedModelIds);
    if (selectedModelId) return new Set([selectedModelId]);
    return new Set<string>();
  }, [selectedModelIds, selectedModelId]);

  const toggleModel = useCallback((id: string) => {
    // Free plan: refuse second pick (don't silently swap)
    if (isFree && freeLimitReached && !activeIds.has(id)) {
      onFreeLimitHit?.();
      return;
    }
    if (onMultiSelect) {
      const next = new Set(activeIds);
      if (next.has(id)) next.delete(id); else next.add(id);
      onMultiSelect(Array.from(next));
    } else {
      onSelect(id);
    }
  }, [activeIds, onMultiSelect, onSelect, isFree, freeLimitReached, onFreeLimitHit]);

  const filteredUser = useMemo(() =>
    genderFilter === 'all' ? userModels : userModels.filter(m => m.gender === genderFilter),
    [userModels, genderFilter]);

  const filteredGlobal = useMemo(() =>
    genderFilter === 'all' ? globalModels : globalModels.filter(m => m.gender === genderFilter),
    [globalModels, genderFilter]);

  const INLINE_LIMIT = 6;

  const inlineModels = useMemo(() => {
    // Always show selected models first, then fill with unselected
    const selectedInGlobal = Array.from(activeIds)
      .map(id => filteredGlobal.find(m => m.modelId === id))
      .filter(Boolean) as ModelProfile[];
    // Remove duplicates with user models
    const selectedNotUser = selectedInGlobal.filter(
      m => !filteredUser.some(u => u.modelId === m.modelId)
    );
    // Fill remaining slots with unselected models
    const remaining = INLINE_LIMIT - selectedNotUser.length;
    const unselected = filteredGlobal
      .filter(m => !activeIds.has(m.modelId))
      .slice(0, Math.max(0, remaining));
    return [...selectedNotUser, ...unselected].slice(0, INLINE_LIMIT);
  }, [filteredGlobal, filteredUser, activeIds]);

  const modalFilteredUser = useMemo(() =>
    modalGender === 'all' ? userModels : userModels.filter(m => m.gender === modalGender),
    [userModels, modalGender]);

  const modalFilteredGlobal = useMemo(() => {
    let list = modalGender === 'all' ? globalModels : globalModels.filter(m => m.gender === modalGender);
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    return list;
  }, [globalModels, modalGender, modalSearch]);

  const handleModalSelect = (id: string) => {
    toggleModel(id);
  };

  return (
    <div className="space-y-5">
      {/* Inline gender filter + count badge */}
      <div className="flex items-center gap-3">
        {(['all', 'female', 'male'] as const).map(g => (
          <button
            key={g}
            type="button"
            onClick={() => setGenderFilter(g)}
            className={cn(
              'text-xs font-medium transition-colors cursor-pointer pb-0.5',
              genderFilter === g
                ? 'text-foreground border-b border-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {g === 'all' ? 'All' : g === 'female' ? 'Women' : 'Men'}
          </button>
        ))}
        {activeIds.size > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-bold ml-auto">
            {activeIds.size} selected
          </Badge>
        )}
      </div>

      {/* Your Brand Models */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your Brand Models</span>
        </div>
        {filteredUser.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredUser.map(m => (
              <ModelSelectorCard key={m.modelId} model={m} isSelected={activeIds.has(m.modelId)} onSelect={() => toggleModel(m.modelId)} />
            ))}
          </div>
        ) : (
          <button
            onClick={() => {
              if (isFree && onUpgradeClick) {
                onUpgradeClick();
              } else {
                navigate('/app/models');
              }
            }}
            className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 p-4 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Create Your Brand Model</p>
                <p className="text-[11px] text-muted-foreground">Generate a unique AI model for your brand</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Library Models — inline preview */}
      {filteredGlobal.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">VOVV.AI Models</span>
            {isFree && (
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Free plan: 1 model per generation
                {onUpgradeClick && (
                  <button type="button" onClick={onUpgradeClick} className="text-primary font-medium hover:underline">Upgrade</button>
                )}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {inlineModels.map(m => (
              <ModelSelectorCard key={m.modelId} model={m} isSelected={activeIds.has(m.modelId)} onSelect={() => toggleModel(m.modelId)} />
            ))}
          </div>
          {filteredGlobal.length > INLINE_LIMIT && (
            <button
              className="mt-2 w-full text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer py-2 hover:underline underline-offset-4"
              onClick={() => { setModalGender(genderFilter); setModalSearch(''); setShowAllModal(true); }}
            >
              View all {filteredGlobal.length} models →
            </button>
          )}
        </div>
      )}

      {userModels.length === 0 && globalModels.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No models available. Use manual styling options below.</p>
      )}

      {/* Full model picker modal */}
      <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4 text-primary" />Select Models</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Tabs value={modalGender} onValueChange={(v) => setModalGender(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-[11px] px-3 h-6">All</TabsTrigger>
                <TabsTrigger value="female" className="text-[11px] px-3 h-6">Women</TabsTrigger>
                <TabsTrigger value="male" className="text-[11px] px-3 h-6">Men</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search models..." value={modalSearch} onChange={e => setModalSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {modalFilteredUser.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your Brand Models</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {modalFilteredUser.map(m => (
                    <ModelSelectorCard key={m.modelId} model={m} isSelected={activeIds.has(m.modelId)} onSelect={() => handleModalSelect(m.modelId)} />
                  ))}
                </div>
              </div>
            )}

            {modalFilteredGlobal.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">VOVV.AI Models</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {modalFilteredGlobal.map(m => (
                    <ModelSelectorCard key={m.modelId} model={m} isSelected={activeIds.has(m.modelId)} onSelect={() => handleModalSelect(m.modelId)} />
                  ))}
                </div>
              </div>
            )}

            {modalFilteredUser.length === 0 && modalFilteredGlobal.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No models match your search.</p>
            )}
          </div>

          {/* Modal footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {activeIds.size} selected
              </Badge>
              {activeIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => { if (onMultiSelect) onMultiSelect([]); else onSelect(''); }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            <Button size="sm" onClick={() => setShowAllModal(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Shared UI helpers
   ══════════════════════════════════════════════ */

function ChipSelector({ label, value, onChange, options }: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer',
              value === o.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Multi-select chip selector — stores comma-separated values in a single string field */
function MultiChipSelector({ label, value, onChange, options }: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  const selected = useMemo(() => new Set((value || '').split(',').filter(Boolean)), [value]);
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v); else next.add(v);
    onChange(Array.from(next).join(','));
  };
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-medium">{label}</Label>
          {selected.size > 1 && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-bold">
              ×{selected.size}
            </Badge>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer',
              selected.has(o.value)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RatioShape({ ratio }: { ratio: string }) {
  const size = 14;
  const shapes: Record<string, { w: number; h: number }> = {
    '1:1': { w: 10, h: 10 }, '4:5': { w: 9, h: 11 }, '3:4': { w: 8, h: 11 },
    '9:16': { w: 7, h: 12 }, '16:9': { w: 12, h: 7 },
  };
  const s = shapes[ratio] || { w: 10, h: 10 };
  const x = (size - s.w) / 2;
  const y = (size - s.h) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <rect x={x} y={y} width={s.w} height={s.h} rx={1.5} className="fill-none stroke-current" strokeWidth={1.5} />
    </svg>
  );
}

function MiniRatioChips({ activeRatios, globalRatios, onChange }: { activeRatios: string[]; globalRatios: string[]; onChange: (ratios: string[]) => void }) {
  const ratios = ['1:1', '4:5', '3:4', '9:16', '16:9'];
  const activeSet = new Set(activeRatios);
  const globalSet = new Set(globalRatios);
  const toggle = (r: string) => {
    if (activeSet.has(r)) {
      if (activeSet.size <= 1) return; // keep at least 1
      onChange(activeRatios.filter(x => x !== r));
    } else {
      onChange([...activeRatios, r]);
    }
  };
  return (
    <div className="flex gap-1">
      {ratios.map(r => {
        const isActive = activeSet.has(r);
        const isGlobalDefault = globalSet.has(r);
        return (
          <button key={r} type="button" onClick={() => toggle(r)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all border cursor-pointer',
              isActive ? 'bg-primary text-primary-foreground border-primary'
                : isGlobalDefault ? 'bg-muted/60 text-muted-foreground border-border/60 hover:border-primary/40'
                : 'bg-muted/30 text-muted-foreground/70 border-border/40 hover:border-primary/40',
            )}>
            <RatioShape ratio={r} />{r}
          </button>
        );
      })}
    </div>
  );
}

function SceneThumbnail({ sceneId }: { sceneId: string }) {
  const { allScenes: dbScenes } = useProductImageScenes();
  const scene = dbScenes.find(s => s.id === sceneId);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {scene?.previewUrl ? <img src={getOptimizedUrl(scene.previewUrl, { quality: 40 })} alt={scene.title} className="w-full h-full object-cover" /> : <Camera className="w-3 h-3 text-muted-foreground/40" />}
      </div>
      {hovered && (
        <div className="absolute z-50 left-0 top-full mt-1 w-[120px] h-[120px] rounded-lg bg-muted border border-border shadow-lg overflow-hidden">
          {scene?.previewUrl ? <img src={getOptimizedUrl(scene.previewUrl, { quality: 60 })} alt={scene?.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="w-8 h-8 text-muted-foreground/30" /></div>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Prop Picker Modal
   ══════════════════════════════════════════════ */

function PropPickerModal({ open, onOpenChange, products, excludeIds, alreadySelected, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void; products: UserProduct[];
  excludeIds: Set<string>; alreadySelected: string[]; onConfirm: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(alreadySelected));
  const available = products.filter(p => !excludeIds.has(p.id) && (p.title.toLowerCase().includes(search.toLowerCase()) || p.product_type.toLowerCase().includes(search.toLowerCase())));
  const toggle = (id: string) => { const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); setSelected(n); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-base"><PackagePlus className="w-4 h-4 text-primary" />Add Props / Accessories</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">Pick products from your catalog to add as styling props in this scene.</p>
        <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" /></div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto p-0.5">
          {available.map(p => {
            const isSel = selected.has(p.id);
            return (
              <button key={p.id} type="button" onClick={() => toggle(p.id)} className={cn('relative rounded-lg border-2 p-1.5 transition-all text-left', isSel ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                <ShimmerImage src={p.image_url} alt={p.title} className="w-full aspect-square object-contain rounded bg-white" />
                <p className="text-[10px] font-medium truncate mt-1">{p.title}</p>
              </button>
            );
          })}
          {available.length === 0 && <p className="col-span-full text-center text-xs text-muted-foreground py-6">No products available</p>}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { onConfirm(Array.from(selected)); onOpenChange(false); }}>Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════
   Block field renderers (only actionDetails kept)
   ══════════════════════════════════════════════ */

function BlockFields({ blockKey, details, update, sceneIds }: { blockKey: string; details: DetailSettings; update: (p: Partial<DetailSettings>) => void; sceneIds: string[] }) {
  switch (blockKey) {
    case 'actionDetails':
      return (
        <div className="grid grid-cols-2 gap-3">
          <ChipSelector label="Action Type" value={details.actionType} onChange={v => update({ actionType: v })} options={[
            { value: 'holding', label: 'Holding' }, { value: 'opening', label: 'Opening' }, { value: 'applying', label: 'Applying' },
            { value: 'pouring', label: 'Pouring' }, { value: 'using', label: 'Using' }, { value: 'displaying', label: 'Displaying' },
          ]} />
          <ChipSelector label="Intensity" value={details.actionIntensity} onChange={v => update({ actionIntensity: v })} options={[
            { value: 'static', label: 'Static' }, { value: 'subtle', label: 'Subtle' }, { value: 'clear', label: 'Clear Action' },
          ]} />
        </div>
      );
    default: return null;
  }
}

/* ══════════════════════════════════════════════
   Background Swatch Selector — studio-style 3:4 cards
   ══════════════════════════════════════════════ */

const BG_SWATCH_OPTIONS: { value: string; label: string; fill: string; isGradient?: boolean }[] = [
  { value: 'white', label: 'Pure White', fill: '#FFFFFF' },
  { value: 'off-white', label: 'Off-White', fill: '#FAFAFA' },
  { value: 'light-gray', label: 'Light Gray', fill: '#E5E7EB' },
  { value: 'warm-neutral', label: 'Warm Beige', fill: '#F5F0EB' },
  { value: 'cool-neutral', label: 'Cool Gray', fill: '#EDF0F4' },
  { value: 'taupe', label: 'Taupe', fill: '#D6CFC7' },
  { value: 'sage', label: 'Sage', fill: '#E8EDE6' },
  { value: 'blush', label: 'Blush', fill: '#F8ECE8' },
  { value: 'gradient', label: 'Navy Fade', fill: 'linear-gradient(135deg, #FFFFFF, #123668)', isGradient: true },
  { value: 'gradient-warm', label: 'Terracotta', fill: 'linear-gradient(135deg, #984D1B, #FBEFE9)', isGradient: true },
  { value: 'gradient-cool', label: 'Forest', fill: 'linear-gradient(135deg, #0F570F, #EAFBE9)', isGradient: true },
];

function BackgroundSwatchSelector({ value, onChange, details, update, savedColors, canSave, onSaveColor, onSaveGradient, onDeleteSavedColor, isFree, maxSelections, onLimitReached, onUpgradeClick }: {
  value: string;
  onChange: (v: string) => void;
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  savedColors: { id: string; hex: string | null; gradient_from: string | null; gradient_to: string | null; label: string }[];
  canSave: boolean;
  onSaveColor: (hex: string) => void;
  onSaveGradient: (from: string, to: string) => void;
  onDeleteSavedColor: (id: string) => void;
  isFree?: boolean;
  maxSelections?: number;
  onLimitReached?: () => void;
  onUpgradeClick?: () => void;
}) {
  const [gradFrom, setGradFrom] = useState(details.backgroundCustomGradient?.from || '#F8F8F8');
  const [gradTo, setGradTo] = useState(details.backgroundCustomGradient?.to || '#EEEEEE');
  const [customHex, setCustomHex] = useState(details.backgroundCustomHex || '#FFFFFF');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'solid' | 'gradient'>('solid');

  const applyGradient = (from: string, to: string) => {
    setGradFrom(from);
    setGradTo(to);
    if (/^#[0-9A-Fa-f]{6}$/.test(from) && /^#[0-9A-Fa-f]{6}$/.test(to)) {
      update({ backgroundCustomGradient: { from, to } });
    }
  };

  const applyCustomHex = (hex: string) => {
    let v = hex;
    if (!v.startsWith('#')) v = '#' + v;
    v = v.slice(0, 7);
    setCustomHex(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      update({ backgroundCustomHex: v });
    }
  };

  const selected = value ? value.split(',').filter(Boolean) : [];

  const toggleSwatch = (sVal: string) => {
    const current = new Set(selected);
    if (current.has(sVal)) {
      current.delete(sVal);
    } else {
      // Free plan: refuse adding a second swatch
      if (typeof maxSelections === 'number' && current.size >= maxSelections) {
        onLimitReached?.();
        return;
      }
      if (sVal === 'custom') current.delete('gradient-custom');
      if (sVal === 'gradient-custom') current.delete('custom');
      current.add(sVal);
    }
    onChange(Array.from(current).join(','));
  };

  const deselectSwatch = (sVal: string) => {
    const current = new Set(selected);
    current.delete(sVal);
    onChange(Array.from(current).join(','));
  };

  const hasCustom = selected.includes('custom');
  const hasGradientCustom = selected.includes('gradient-custom');
  const validCustomHex = /^#[0-9A-Fa-f]{6}$/.test(customHex);

  const handleCustomCardClick = () => {
    if (!hasCustom) toggleSwatch('custom');
    setPickerMode('solid');
    setPickerOpen(true);
  };

  const handleGradientCardClick = () => {
    if (!hasGradientCustom) toggleSwatch('gradient-custom');
    setPickerMode('gradient');
    setPickerOpen(true);
  };

  const XButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-1 left-1 z-10 w-5 h-5 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center transition-colors"
      aria-label="Remove"
    >
      <X className="w-3 h-3 text-white" />
    </button>
  );

  const EditButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute bottom-6 right-1.5 z-10 w-5 h-5 rounded-full bg-black/50 hover:bg-primary flex items-center justify-center transition-colors"
      aria-label="Edit color"
    >
      <Paintbrush className="w-2.5 h-2.5 text-white" />
    </button>
  );

  const SaveButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-1 right-7 z-10 w-5 h-5 rounded-full bg-black/50 hover:bg-primary flex items-center justify-center transition-colors"
      aria-label="Save color"
    >
      <Save className="w-2.5 h-2.5 text-white" />
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Color Picker Dialog */}
      <ColorPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode={pickerMode}
        initialHex={customHex}
        initialGradientFrom={gradFrom}
        initialGradientTo={gradTo}
        canSave={canSave}
        onApplySolid={(h) => { applyCustomHex(h); if (!hasCustom) toggleSwatch('custom'); }}
        onApplyGradient={(f, t) => { applyGradient(f, t); if (!hasGradientCustom) toggleSwatch('gradient-custom'); }}
        onSaveColor={onSaveColor}
        onSaveGradient={onSaveGradient}
      />

      {isFree && (
        <div className="flex items-center justify-end gap-1.5 -mb-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">Free plan: 1 background per generation</span>
          {onUpgradeClick && (
            <button type="button" onClick={onUpgradeClick} className="text-[10px] text-primary font-medium hover:underline">Upgrade</button>
          )}
        </div>
      )}

      {/* Swatch grid — square aspect cards, 8 per row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {/* Preset cards */}
        {BG_SWATCH_OPTIONS.map(o => {
          const isActive = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggleSwatch(o.value)}
              aria-label={o.label}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'ring-2 ring-primary shadow-md'
                  : 'ring-1 ring-border hover:ring-primary/30 hover:shadow-sm',
              )}
            >
              {isActive && <XButton onClick={(e) => { e.stopPropagation(); deselectSwatch(o.value); }} />}
              <div className="aspect-square w-full" style={{ background: o.fill }} />
              {isActive && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-1 py-1">
                <p className="text-[9px] font-medium text-white leading-tight truncate">{o.label}</p>
              </div>
            </button>
          );
        })}

        {/* Saved color cards */}
        {savedColors.map(sc => {
          const isGrad = !!(sc.gradient_from && sc.gradient_to);
          const fill = isGrad
            ? `linear-gradient(135deg, ${sc.gradient_from}, ${sc.gradient_to})`
            : sc.hex || '#FFFFFF';
          const savedKey = `saved-${sc.id}`;
          const isActive = selected.includes(savedKey);
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                toggleSwatch(savedKey);
                if (isGrad) {
                  update({ backgroundCustomGradient: { from: sc.gradient_from!, to: sc.gradient_to! } });
                } else if (sc.hex) {
                  update({ backgroundCustomHex: sc.hex });
                }
              }}
              aria-label={sc.label}
              className={cn(
                'relative rounded-xl overflow-hidden transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'ring-2 ring-primary shadow-md'
                  : 'ring-1 ring-border hover:ring-primary/30 hover:shadow-sm',
              )}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deselectSwatch(savedKey); onDeleteSavedColor(sc.id); }}
                className="absolute top-1 left-1 z-10 w-5 h-5 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center transition-colors"
                aria-label="Delete saved color"
              >
                <Trash2 className="w-2.5 h-2.5 text-white" />
              </button>
              <div className="aspect-square w-full" style={{ background: fill }} />
              {isActive && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-1 py-1">
                <p className="text-[9px] font-medium text-white leading-tight truncate">{sc.label}</p>
              </div>
            </button>
          );
        })}

        {/* Custom Color card */}
        <button
          type="button"
          onClick={handleCustomCardClick}
          aria-label="Custom Color"
          className={cn(
            'relative rounded-xl overflow-hidden transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            hasCustom
              ? 'ring-2 ring-primary shadow-md'
              : 'ring-1 ring-dashed ring-border hover:ring-primary/30 hover:shadow-sm',
          )}
        >
          {hasCustom && <XButton onClick={(e) => { e.stopPropagation(); deselectSwatch('custom'); }} />}
          {hasCustom && <EditButton onClick={(e) => { e.stopPropagation(); setPickerMode('solid'); setPickerOpen(true); }} />}
          {hasCustom && canSave && validCustomHex && (
            <SaveButton onClick={(e) => { e.stopPropagation(); onSaveColor(customHex); }} />
          )}
          <div
            className="aspect-square w-full flex items-center justify-center"
            style={{ background: hasCustom && validCustomHex ? customHex : undefined }}
          >
            {!hasCustom && <Plus className="w-4 h-4 text-muted-foreground" />}
          </div>
          {hasCustom && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-1 py-1">
            <p className="text-[9px] font-medium text-white leading-tight">Custom Color</p>
          </div>
        </button>

        {/* Custom Gradient card */}
        <button
          type="button"
          onClick={handleGradientCardClick}
          aria-label="Custom Gradient"
          className={cn(
            'relative rounded-xl overflow-hidden transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            hasGradientCustom
              ? 'ring-2 ring-primary shadow-md'
              : 'ring-1 ring-dashed ring-border hover:ring-primary/30 hover:shadow-sm',
          )}
        >
          {hasGradientCustom && <XButton onClick={(e) => { e.stopPropagation(); deselectSwatch('gradient-custom'); }} />}
          {hasGradientCustom && <EditButton onClick={(e) => { e.stopPropagation(); setPickerMode('gradient'); setPickerOpen(true); }} />}
          {hasGradientCustom && canSave && (
            <SaveButton onClick={(e) => { e.stopPropagation(); onSaveGradient(gradFrom, gradTo); }} />
          )}
          <div
            className="aspect-square w-full flex items-center justify-center"
            style={{ background: hasGradientCustom ? `linear-gradient(135deg, ${gradFrom}, ${gradTo})` : 'linear-gradient(135deg, #F8B4C8, #C8A8E8, #A8D8EA, #B8E8C8)' }}
          >
            {!hasGradientCustom && <Plus className="w-4 h-4 text-white drop-shadow-sm" />}
          </div>
          {hasGradientCustom && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-1 py-1">
            <p className="text-[9px] font-medium text-white leading-tight">Custom Gradient</p>
          </div>
        </button>
      </div>

      {/* Saved colors info */}
      {savedColors.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {savedColors.length}/6 saved colors • Click trash to remove
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Outfit Lock Panel (Pro structured system)
   ══════════════════════════════════════════════ */

const GARMENT_OPTIONS: Record<string, string[]> = {
  top: ['t-shirt', 'turtleneck', 'blouse', 'crew-neck tee', 'tank top', 'shirt', 'sweater', 'crop top', 'camisole'],
  bottom: ['trousers', 'chinos', 'jeans', 'skirt', 'shorts', 'leggings', 'wide-leg pants'],
  shoes: ['sneakers', 'ankle boots', 'heels', 'loafers', 'sandals', 'mules', 'flats'],
};
const COLOR_OPTIONS = ['white', 'black', 'beige', 'navy', 'cream', 'gray', 'brown', 'olive', 'blush', 'camel', 'charcoal', 'burgundy'];

const COLOR_HEX: Record<string, string> = {
  white: '#FFFFFF', black: '#1A1A1A', cream: '#FFFDD0', beige: '#F5F0E1',
  navy: '#1B2A4A', gray: '#9CA3AF', brown: '#6B4226', olive: '#556B2F',
  blush: '#DE98AB', camel: '#C19A6B', charcoal: '#36454F', burgundy: '#722F37',
};

const SKIN_TONE_HEX: Record<string, string> = {
  light: '#FADCB8', medium: '#C68642', deep: '#5C3317',
};

const FIT_OPTIONS = ['slim', 'relaxed', 'cropped', 'fitted', 'oversized', 'tailored', 'regular'];
const MATERIAL_OPTIONS = ['cotton', 'silk', 'linen', 'denim', 'leather', 'wool', 'cashmere', 'knit', 'satin'];

function ColorDot({ color, size = 12, hex }: { color?: string; size?: number; hex?: string }) {
  const bg = hex || (color ? COLOR_HEX[color] || '#D1D5DB' : '#D1D5DB');
  const isBright = color === 'white' || color === 'cream';
  return (
    <span
      className={cn('rounded-full inline-block flex-shrink-0', isBright && 'border border-border')}
      style={{ width: size, height: size, backgroundColor: bg }}
    />
  );
}

function PresetColorDots({ config }: { config: OutfitConfig }) {
  const colors = [config.top?.color, config.bottom?.color, config.shoes?.color].filter(Boolean) as string[];
  return (
    <div className="flex flex-col w-6 h-6 rounded-md overflow-hidden border border-border/40 shrink-0">
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: COLOR_HEX[c] || c }} />
      ))}
    </div>
  );
}

const CATEGORY_OUTFIT_CONFIG_DEFAULTS: Record<string, OutfitConfig> = {
  garments: {
    top: { garment: 't-shirt', color: 'white', fit: 'fitted', material: 'cotton' },
    bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
    accessories: 'none',
  },
  'bags-accessories': {
    top: { garment: 'turtleneck', color: 'black', fit: 'fitted', material: 'knit' },
    bottom: { garment: 'trousers', color: 'navy', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'ankle boots', color: 'black', material: 'leather' },
    accessories: 'none',
  },
  shoes: {
    top: { garment: 't-shirt', color: 'white', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'jeans', color: 'black', fit: 'slim', material: 'denim' },
    accessories: 'none',
  },
  fragrance: {
    top: { garment: 'camisole', color: 'cream', fit: 'fitted', material: 'silk' },
    accessories: 'none',
  },
  'beauty-skincare': {
    top: { garment: 'camisole', color: 'cream', fit: 'fitted', material: 'silk' },
    accessories: 'none',
  },
  'makeup-lipsticks': {
    top: { garment: 'camisole', color: 'cream', fit: 'fitted', material: 'silk' },
    accessories: 'none',
  },
  'hats-small': {
    top: { garment: 'blazer', color: 'black', fit: 'fitted', material: 'wool' },
    bottom: { garment: 'trousers', color: 'charcoal', fit: 'slim', material: 'wool' },
    shoes: { garment: 'loafers', color: 'black', material: 'leather' },
    accessories: 'none',
  },
  'home-decor': {
    top: { garment: 'sweater', color: 'cream', fit: 'relaxed', material: 'knit' },
    bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'suede' },
    accessories: 'none',
  },
  'tech-devices': {
    top: { garment: 't-shirt', color: 'black', fit: 'fitted', material: 'cotton' },
    bottom: { garment: 'jeans', color: 'charcoal', fit: 'slim', material: 'denim' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
    accessories: 'none',
  },
  food: {
    top: { garment: 'blouse', color: 'white', fit: 'relaxed', material: 'linen' },
    bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'leather' },
    accessories: 'none',
  },
  beverages: {
    top: { garment: 'blouse', color: 'white', fit: 'relaxed', material: 'linen' },
    bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'leather' },
    accessories: 'none',
  },
  'supplements-wellness': {
    top: { garment: 'tank top', color: 'white', fit: 'fitted', material: 'cotton' },
    bottom: { garment: 'joggers', color: 'grey', fit: 'slim', material: 'jersey' },
    shoes: { garment: 'sneakers', color: 'white', material: 'mesh' },
    accessories: 'none',
  },
  other: {
    top: { garment: 't-shirt', color: 'white', fit: 'fitted', material: 'cotton' },
    bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
    accessories: 'none',
  },
};

const MALE_OUTFIT_OVERRIDES: Record<string, Partial<OutfitConfig>> = {
  garments: {
    top: { garment: 'crew-neck tee', color: 'white', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'chinos', color: 'navy', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
  },
  'bags-accessories': {
    top: { garment: 'sweater', color: 'black', fit: 'regular', material: 'wool' },
    bottom: { garment: 'trousers', color: 'navy', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'black', material: 'leather' },
  },
  shoes: {
    top: { garment: 't-shirt', color: 'white', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'jeans', color: 'black', fit: 'slim', material: 'denim' },
  },
  fragrance: {
    top: { garment: 'shirt', color: 'white', fit: 'fitted', material: 'cotton' },
  },
  'hats-small': {
    top: { garment: 'bomber jacket', color: 'navy', fit: 'regular', material: 'nylon' },
    bottom: { garment: 'chinos', color: 'charcoal', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
  },
  'home-decor': {
    top: { garment: 'henley', color: 'cream', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'chinos', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'suede' },
  },
  'tech-devices': {
    top: { garment: 'crew-neck tee', color: 'black', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'jeans', color: 'charcoal', fit: 'slim', material: 'denim' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
  },
  food: {
    top: { garment: 'shirt', color: 'white', fit: 'regular', material: 'linen' },
    bottom: { garment: 'chinos', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'leather' },
  },
  beverages: {
    top: { garment: 'shirt', color: 'white', fit: 'regular', material: 'linen' },
    bottom: { garment: 'chinos', color: 'beige', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'loafers', color: 'tan', material: 'leather' },
  },
  'supplements-wellness': {
    top: { garment: 'tank top', color: 'white', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'joggers', color: 'grey', fit: 'slim', material: 'jersey' },
    shoes: { garment: 'sneakers', color: 'white', material: 'mesh' },
  },
  other: {
    top: { garment: 'crew-neck tee', color: 'white', fit: 'regular', material: 'cotton' },
    bottom: { garment: 'chinos', color: 'navy', fit: 'slim', material: 'cotton' },
    shoes: { garment: 'sneakers', color: 'white', material: 'leather' },
  },
};

function getBuiltInPresets(category: string, isMale = false): OutfitPreset[] {
  // Map new sub-categories to their parent outfit config
  const OUTFIT_CATEGORY_FALLBACK: Record<string, string> = {
    backpacks: 'bags-accessories',
    'wallets-cardholders': 'bags-accessories',
    belts: 'bags-accessories',
    scarves: 'bags-accessories',
    'jewellery-necklaces': 'fragrance',
    'jewellery-earrings': 'fragrance',
    'jewellery-bracelets': 'fragrance',
    'jewellery-rings': 'fragrance',
    watches: 'hats-small',
    eyewear: 'hats-small',
    sneakers: 'shoes',
    boots: 'shoes',
    'high-heels': 'shoes',
    dresses: 'garments',
    hoodies: 'garments',
    streetwear: 'garments',
    jeans: 'garments',
    jackets: 'garments',
    activewear: 'supplements-wellness',
    swimwear: 'garments',
    lingerie: 'fragrance',
    kidswear: 'garments',
  };
  const resolvedCategory = OUTFIT_CATEGORY_FALLBACK[category] || category;
  let base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[resolvedCategory];
  if (!base) base = CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
  if (!base.bottom) base = { ...base, bottom: { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' } };
  if (!base.shoes) base = { ...base, shoes: { garment: 'sneakers', color: 'white', material: 'leather' } };
  if (isMale && MALE_OUTFIT_OVERRIDES[category]) {
    base = { ...base, ...MALE_OUTFIT_OVERRIDES[category] };
  }
  return [
    { id: `builtin-studio-${category}`, name: 'Studio Standard', config: base, category, isBuiltIn: true, createdAt: '' },
    { id: `builtin-editorial-${category}`, name: 'Editorial', config: {
      ...base,
      top: base.top ? { ...base.top, color: 'black' } : undefined,
      bottom: base.bottom ? { ...base.bottom, color: 'black', fit: 'tailored' } : undefined,
    }, category, isBuiltIn: true, createdAt: '' },
    { id: `builtin-minimal-${category}`, name: 'Minimal', config: {
      ...base,
      top: base.top ? { ...base.top, color: 'white', garment: base.top.garment } : undefined,
      bottom: base.bottom ? { ...base.bottom, color: 'cream', fit: 'relaxed' } : undefined,
      shoes: base.shoes ? { ...base.shoes, color: 'white' } : undefined,
    }, category, isBuiltIn: true, createdAt: '' },
    { id: `builtin-streetwear-${category}`, name: 'Streetwear', config: {
      ...base,
      top: base.top ? { ...base.top, color: 'charcoal', fit: 'oversized', material: 'cotton' } : undefined,
      bottom: base.bottom ? { ...base.bottom, color: 'black', fit: 'relaxed', material: 'denim' } : undefined,
      shoes: base.shoes ? { ...base.shoes, garment: 'sneakers', color: 'black', material: 'leather' } : undefined,
    }, category, isBuiltIn: true, createdAt: '' },
    { id: `builtin-luxurysoft-${category}`, name: 'Luxury Soft', config: {
      ...base,
      top: base.top ? { ...base.top, color: 'cream', fit: 'tailored', material: 'silk' } : undefined,
      bottom: base.bottom ? { ...base.bottom, color: 'camel', fit: 'tailored', material: 'cashmere' } : undefined,
      shoes: base.shoes ? { ...base.shoes, color: 'beige', material: 'suede' } : undefined,
    }, category, isBuiltIn: true, createdAt: '' },
  ];
}

function loadSavedPresets(): OutfitPreset[] {
  try {
    const raw = localStorage.getItem('pi_outfit_presets');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePresetsToStorage(presets: OutfitPreset[]) {
  localStorage.setItem('pi_outfit_presets', JSON.stringify(presets));
}

function PieceField({ label, piece, onChange, pieceType }: {
  label: string;
  piece?: OutfitPiece;
  onChange: (p: OutfitPiece) => void;
  pieceType: 'top' | 'bottom' | 'shoes';
}) {
  const garments = GARMENT_OPTIONS[pieceType] || [];
  const current = piece || { garment: '', color: '', fit: '', material: '' };
  const [showAllGarments, setShowAllGarments] = useState(false);

  const updateField = (field: keyof OutfitPiece, value: string) => {
    onChange({ ...current, [field]: value === current[field] ? '' : value });
  };

  const INLINE_GARMENT_LIMIT = 5;
  const visibleGarments = showAllGarments ? garments : garments.slice(0, INLINE_GARMENT_LIMIT);
  const hasMore = garments.length > INLINE_GARMENT_LIMIT;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Shirt className="w-3.5 h-3.5" />{label}
      </span>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">Garment</Label>
        <div className="flex flex-wrap gap-2">
          {visibleGarments.map(g => (
            <button key={g} type="button" onClick={() => updateField('garment', g)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                current.garment === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
              )}><span className="capitalize">{g}</span></button>
          ))}
          {hasMore && !showAllGarments && (
            <button type="button" onClick={() => setShowAllGarments(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              More…
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <button key={c} type="button" onClick={() => updateField('color', c)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                current.color === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
              )}>
              <ColorDot color={c} size={12} />
              <span className="capitalize">{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Fit</Label>
          <div className="flex flex-wrap gap-2">
            {FIT_OPTIONS.map(f => (
              <button key={f} type="button" onClick={() => updateField('fit', f)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                  current.fit === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}><span className="capitalize">{f}</span></button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Material</Label>
          <div className="flex flex-wrap gap-2">
            {MATERIAL_OPTIONS.map(m => (
              <button key={m} type="button" onClick={() => updateField('material', m)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer',
                  current.material === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}><span className="capitalize">{m}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutfitLockPanel({ details, update, primaryCategory, modelGender }: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  primaryCategory?: string;
  modelGender?: string;
}) {
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [savedPresets, setSavedPresets] = useState<OutfitPreset[]>(() => loadSavedPresets());

  const cat = primaryCategory || 'garments';
  const isMale = modelGender === 'male';

  const defaultConfig = useMemo((): OutfitConfig => {
    const base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[cat] || CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
    if (isMale && MALE_OUTFIT_OVERRIDES[cat]) {
      return { ...base, ...MALE_OUTFIT_OVERRIDES[cat] };
    }
    return base;
  }, [cat, isMale]);

  const currentConfig: OutfitConfig = details.outfitConfig || defaultConfig;

  const prevCatRef = useRef(cat);

   useEffect(() => {
    const categoryChanged = prevCatRef.current !== cat;
    prevCatRef.current = cat;
    if (!details.outfitConfig || categoryChanged) {
      const config = { ...defaultConfig };
      // Don't force bottom/shoes — respect categories that intentionally omit them
      // (e.g., fragrance, beauty). The prompt builder handles per-product slot nullification.
      update({ outfitConfig: config });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig]);

  const updateConfig = useCallback((partial: Partial<OutfitConfig>) => {
    const next = { ...currentConfig, ...partial };
    update({ outfitConfig: next });
  }, [currentConfig, update]);

  const isPresetActive = useCallback((presetConfig: OutfitConfig): boolean => {
    const keys: (keyof OutfitConfig)[] = ['top', 'bottom', 'shoes', 'accessories'];
    return keys.every(k => {
      if (k === 'top' || k === 'bottom' || k === 'shoes') {
        const a = currentConfig[k];
        const b = presetConfig[k];
        if (!a && !b) return true;
        if (!a || !b) return false;
        return a.garment === b.garment && a.color === b.color && a.fit === b.fit && a.material === b.material;
      }
      return (currentConfig[k] || '') === (presetConfig[k] || '');
    });
  }, [currentConfig]);

  const builtInPresets = useMemo(() => getBuiltInPresets(cat, isMale), [cat, isMale]);
  const categoryPresets = savedPresets.filter(p => p.category === cat);
  const allPresets = [...builtInPresets, ...categoryPresets];

  const loadPreset = (preset: OutfitPreset) => {
    update({ outfitConfig: { ...preset.config } });
  };

  const saveCurrentAsPreset = () => {
    if (!saveName.trim()) return;
    const newPreset: OutfitPreset = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      config: currentConfig,
      category: cat,
      gender: modelGender,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    savePresetsToStorage(updated);
    setSaveName('');
    setShowSave(false);
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    savePresetsToStorage(updated);
  };

  const showBottom = true;
  const showShoes = true;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-muted-foreground">Locked across all on-model scenes.</span>
        {isMale && <Badge variant="outline" className="text-xs h-5 px-2">Male defaults</Badge>}
      </div>

      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />Style direction
      </span>
      <div className="flex flex-wrap gap-2">
        {allPresets.map(preset => {
          const active = isPresetActive(preset.config);
          const PRESET_DESCRIPTIONS: Record<string, string> = {
            'Studio Standard': 'Clean, neutral styling for commercial product focus',
            'Editorial': 'Sharper, more fashion-led styling with elevated polish',
            'Minimal': 'Quiet neutrals, soft tones, relaxed premium simplicity',
            'Streetwear': 'Relaxed silhouettes, darker tones, urban attitude',
            'Luxury Soft': 'Warm neutrals, refined textures, elegant softness',
          };
          const description = PRESET_DESCRIPTIONS[preset.name] || '';
          return (
          <div key={preset.id} className="flex items-center gap-0.5 flex-shrink-0 group">
            <button
              type="button"
              onClick={() => loadPreset(preset)}
              className={cn(
                'w-[160px] text-left p-3 rounded-xl border transition-all cursor-pointer',
                active
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm'
                  : 'bg-muted/40 border-border hover:border-primary/40 hover:bg-muted/60',
              )}
            >
              <span className={cn('text-xs font-semibold block', active ? 'text-primary' : 'text-foreground')}>{preset.name}</span>
              {description && <span className="text-[10px] text-muted-foreground leading-snug mt-0.5 block">{description}</span>}
            </button>
            {!preset.isBuiltIn && (
              <button type="button" onClick={() => deletePreset(preset.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer p-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          );
        })}
        {showSave ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsPreset(); if (e.key === 'Escape') setShowSave(false); }}
              placeholder="Preset name..."
              className="h-8 w-32 text-xs px-2.5"
              autoFocus
            />
            <button type="button" onClick={saveCurrentAsPreset} className="text-primary hover:text-primary/80 cursor-pointer"><Save className="w-4 h-4" /></button>
            <button type="button" onClick={() => setShowSave(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowSave(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex-shrink-0">
            <Plus className="w-3.5 h-3.5" />Save
          </button>
        )}
      </div>

      <div className="space-y-2">
        <PieceField label="Top" piece={currentConfig.top} onChange={p => updateConfig({ top: p })} pieceType="top" />
        {showBottom && <PieceField label="Bottom" piece={currentConfig.bottom} onChange={p => updateConfig({ bottom: p })} pieceType="bottom" />}
        {showShoes && <PieceField label="Shoes" piece={currentConfig.shoes} onChange={p => updateConfig({ shoes: p })} pieceType="shoes" />}
      </div>
    </div>
  );
}

/** Presets-only portion of OutfitLockPanel — always visible */
function OutfitPresetsOnly({ details, update, primaryCategory, modelGender }: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  primaryCategory?: string;
  modelGender?: string;
}) {
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [savedPresets, setSavedPresets] = useState<OutfitPreset[]>(() => loadSavedPresets());

  const cat = primaryCategory || 'garments';
  const isMale = modelGender === 'male';

  const defaultConfig = useMemo((): OutfitConfig => {
    const base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[cat] || CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
    if (isMale && MALE_OUTFIT_OVERRIDES[cat]) return { ...base, ...MALE_OUTFIT_OVERRIDES[cat] };
    return base;
  }, [cat, isMale]);

  const currentConfig: OutfitConfig = details.outfitConfig || defaultConfig;

  const isPresetActive = useCallback((presetConfig: OutfitConfig): boolean => {
    const keys: (keyof OutfitConfig)[] = ['top', 'bottom', 'shoes', 'accessories'];
    return keys.every(k => {
      if (k === 'top' || k === 'bottom' || k === 'shoes') {
        const a = currentConfig[k]; const b = presetConfig[k];
        if (!a && !b) return true; if (!a || !b) return false;
        return a.garment === b.garment && a.color === b.color && a.fit === b.fit && a.material === b.material;
      }
      return (currentConfig[k] || '') === (presetConfig[k] || '');
    });
  }, [currentConfig]);

  const builtInPresets = useMemo(() => getBuiltInPresets(cat, isMale), [cat, isMale]);
  const categoryPresets = savedPresets.filter(p => p.category === cat);
  const allPresets = [...builtInPresets, ...categoryPresets];

  const loadPreset = (preset: OutfitPreset) => { update({ outfitConfig: { ...preset.config } }); };

  const saveCurrentAsPreset = () => {
    if (!saveName.trim()) return;
    const newPreset: OutfitPreset = { id: crypto.randomUUID(), name: saveName.trim(), config: currentConfig, category: cat, gender: modelGender, createdAt: new Date().toISOString() };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated); savePresetsToStorage(updated); setSaveName(''); setShowSave(false);
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated); savePresetsToStorage(updated);
  };

  // Auto-select Studio Standard on mount if nothing set
  useEffect(() => {
    if (!details.outfitConfig && builtInPresets.length > 0) {
      update({ outfitConfig: { ...builtInPresets[0].config } });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allPresets.map(preset => {
          const active = isPresetActive(preset.config);
          return (
            <div key={preset.id} className="flex items-center gap-0.5 flex-shrink-0 group">
              <button type="button" onClick={() => loadPreset(preset)}
                className={cn('w-[130px] text-left rounded-lg border transition-colors duration-150 cursor-pointer',
                  active
                    ? 'border-primary/30 bg-primary/8 ring-1 ring-primary/40'
                    : 'border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-border/60')}>
                <div className="px-3 py-2.5">
                  <span className={cn('text-xs font-semibold block', active ? 'text-primary' : 'text-foreground')}>{preset.name}</span>
                </div>
              </button>
              {!preset.isBuiltIn && (
                <button type="button" onClick={() => deletePreset(preset.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer p-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {showSave ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Input value={saveName} onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsPreset(); if (e.key === 'Escape') setShowSave(false); }}
              placeholder="Preset name..." className="h-8 w-32 text-xs px-2.5" autoFocus />
            <button type="button" onClick={saveCurrentAsPreset} className="text-primary hover:text-primary/80 cursor-pointer"><Save className="w-4 h-4" /></button>
            <button type="button" onClick={() => setShowSave(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowSave(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex-shrink-0">
            <Plus className="w-3.5 h-3.5" />Save
          </button>
        )}
      </div>
    </div>
  );
}

/** Piece fields portion of OutfitLockPanel — shown in collapsible */
function OutfitPieceFields({ details, update, primaryCategory, modelGender, analyses, selectedProductIds, allProducts }: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  primaryCategory?: string;
  modelGender?: string;
  analyses?: Record<string, ProductAnalysis>;
  selectedProductIds?: Set<string>;
  allProducts?: UserProduct[];
}) {
  const cat = primaryCategory || 'garments';
  const isMale = modelGender === 'male';
  const defaultConfig = useMemo((): OutfitConfig => {
    const base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[cat] || CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
    if (isMale && MALE_OUTFIT_OVERRIDES[cat]) return { ...base, ...MALE_OUTFIT_OVERRIDES[cat] };
    return base;
  }, [cat, isMale]);

  const currentConfig: OutfitConfig = details.outfitConfig || defaultConfig;
  const updateConfig = useCallback((partial: Partial<OutfitConfig>) => {
    update({ outfitConfig: { ...currentConfig, ...partial } });
  }, [currentConfig, update]);

  // Compute conflicting slots across all selected products
  const slotConflicts = useMemo(() => {
    const conflicts: Record<OutfitSlot, string[]> = { top: [], bottom: [], shoes: [] };
    if (!selectedProductIds) return conflicts;
    for (const pid of selectedProductIds) {
      const a = analyses?.[pid];
      const product = allProducts?.find(p => p.id === pid);
      const resolved = resolveGarmentType(a, product);
      if (!resolved) continue;
      const conflicting = getConflictingSlots(resolved);
      for (const slot of conflicting) {
        conflicts[slot].push(resolved);
      }
    }
    return conflicts;
  }, [analyses, selectedProductIds, allProducts]);

  const totalProducts = selectedProductIds?.size || 0;

  // Check if ALL products are full-body (both top+bottom conflicted)
  const isFullBodyMode = totalProducts > 0 && slotConflicts.top.length === totalProducts && slotConflicts.bottom.length === totalProducts;

  const renderSlot = (slot: OutfitSlot, label: string, icon: string, piece: OutfitPiece | undefined, onChange: (p: OutfitPiece) => void) => {
    const conflictCount = slotConflicts[slot].length;
    const allConflict = totalProducts > 0 && conflictCount === totalProducts;
    const someConflict = conflictCount > 0 && !allConflict;
    const uniqueTypes = [...new Set(slotConflicts[slot])];
    const typeLabel = uniqueTypes.length <= 2 ? uniqueTypes.join(', ') : `${uniqueTypes.length} products`;

    if (allConflict) {
      return (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border/50">
          <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
          <span className="text-xs text-muted-foreground/70 ml-auto">Filled by your {typeLabel}</span>
        </div>
      );
    }

    return (
      <div className="relative">
        <PieceField label={label} piece={piece} onChange={onChange} pieceType={slot} />
        {someConflict && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 pl-1 italic">
            Applied only to non-{typeLabel} products
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      {isFullBodyMode && (
        <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/5 border border-primary/10 mb-1">
          <Shirt className="h-3.5 w-3.5 text-primary/60" />
          <span className="text-xs text-primary/80 font-medium">Full-body garment — only shoes &amp; accessories apply</span>
        </div>
      )}
      {renderSlot('top', 'Top', '👕', currentConfig.top, p => updateConfig({ top: p }))}
      {renderSlot('bottom', 'Bottom', '👖', currentConfig.bottom, p => updateConfig({ bottom: p }))}
      {renderSlot('shoes', 'Shoes', '👟', currentConfig.shoes, p => updateConfig({ shoes: p }))}
    </>
  );
}

/* ══════════════════════════════════════════════
   Inline Person Details (compact per-scene)
   ══════════════════════════════════════════════ */

function InlinePersonDetails({ details, update, outfitAccessories, onAccessoriesChange }: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  outfitAccessories?: string;
  onAccessoriesChange?: (v: string) => void;
}) {
  const skinToneOptions = [
    { value: 'light', label: 'Light', icon: <ColorDot hex={SKIN_TONE_HEX.light} size={10} /> },
    { value: 'medium', label: 'Medium', icon: <ColorDot hex={SKIN_TONE_HEX.medium} size={10} /> },
    { value: 'deep', label: 'Deep', icon: <ColorDot hex={SKIN_TONE_HEX.deep} size={10} /> },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ChipSelector label="Presentation" value={details.presentation} onChange={v => update({ presentation: v })} options={[
          { value: 'feminine', label: 'Feminine' }, { value: 'masculine', label: 'Masculine' }, { value: 'neutral', label: 'Neutral' }, { value: 'auto', label: 'Auto' },
        ]} />
        <ChipSelector label="Age Range" value={details.ageRange} onChange={v => update({ ageRange: v })} options={[
          { value: '18-25', label: '18–25' }, { value: '25-35', label: '25–35' }, { value: '35-50', label: '35–50' }, { value: '50+', label: '50+' }, { value: 'auto', label: 'Auto' },
        ]} />
        <ChipSelector label="Skin Tone" value={details.skinTone} onChange={v => update({ skinTone: v })} options={skinToneOptions} />
        <ChipSelector label="Expression" value={details.expression} onChange={v => update({ expression: v })} options={[
          { value: 'neutral', label: 'Neutral' }, { value: 'soft-smile', label: 'Soft smile' }, { value: 'confident', label: 'Confident' }, { value: 'auto', label: 'Auto' },
        ]} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <ChipSelector label="Hand Style" value={details.handStyle} onChange={v => update({ handStyle: v })} options={[
          { value: 'clean-studio', label: 'Manicured' }, { value: 'natural-lifestyle', label: 'Natural' },
          { value: 'polished-beauty', label: 'Polished' }, { value: 'auto', label: 'Auto' },
        ]} />
        <ChipSelector label="Nails" value={details.nails} onChange={v => update({ nails: v })} options={[
          { value: 'natural', label: 'Natural' }, { value: 'polished', label: 'Polished' }, { value: 'minimal', label: 'Minimal' }, { value: 'auto', label: 'Auto' },
        ]} />
        <ChipSelector label="Jewelry" value={details.jewelryVisible} onChange={v => update({ jewelryVisible: v })} options={[
          { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' }, { value: 'styled', label: 'Styled' }, { value: 'auto', label: 'Auto' },
        ]} />
        {onAccessoriesChange && (
          <ChipSelector label="Accessories" value={outfitAccessories || ''} onChange={v => onAccessoriesChange(v)} options={[
            { value: 'none', label: 'None' }, { value: 'minimal', label: 'Minimal' }, { value: 'statement', label: 'Statement' },
          ]} />
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Summary helpers for collapsible triggers
   ══════════════════════════════════════════════ */

function getOutfitSummary(config?: OutfitConfig): string {
  if (!config) return '';
  const parts: string[] = [];
  if (config.top) parts.push(`${config.top.color || ''} ${config.top.garment || ''}`.trim());
  if (config.bottom) parts.push(`${config.bottom.color || ''} ${config.bottom.garment || ''}`.trim());
  if (config.shoes) parts.push(config.shoes.garment || '');
  return parts.filter(Boolean).join(' · ') || '';
}

function getAppearanceSummary(d: DetailSettings): string {
  const parts: string[] = [];
  if (d.presentation && d.presentation !== 'auto') parts.push(d.presentation.charAt(0).toUpperCase() + d.presentation.slice(1));
  if (d.ageRange && d.ageRange !== 'auto') parts.push(d.ageRange);
  if (d.skinTone && d.skinTone !== 'auto') parts.push(d.skinTone.charAt(0).toUpperCase() + d.skinTone.slice(1));
  if (d.expression && d.expression !== 'auto') parts.push(d.expression.replace('-', ' '));
  return parts.join(' · ') || 'Auto';
}

/* ══════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════ */

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square 1:1' },
  { value: '4:5', label: 'Portrait 4:5' },
  { value: '3:4', label: 'Tall 3:4' },
  { value: '9:16', label: 'Story 9:16' },
  { value: '16:9', label: 'Landscape 16:9' },
];

const IMAGE_COUNT_OPTIONS = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' },
];

/* ══════════════════════════════════════════════
   Main Props
   ══════════════════════════════════════════════ */

interface Step3RefineProps {
  selectedSceneIds: Set<string>;
  productCount: number;
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  userModels?: ModelProfile[];
  globalModels?: ModelProfile[];
  selectedScenes?: ProductImageScene[];
  allProducts?: UserProduct[];
  selectedProductIds?: Set<string>;
  hasMultipleCategories?: boolean;
  primaryCategory?: string;
  sceneExtraRefs?: Record<string, string>;
  onSceneExtraRefsChange?: (refs: Record<string, string>) => void;
  analyses?: Record<string, import('./types').ProductAnalysis>;
  isFree?: boolean;
  onUpgradeClick?: () => void;
}

/* ══════════════════════════════════════════════
   ZARA Outfit Panel — product-aware slot grid
   ══════════════════════════════════════════════ */

const SLOT_TYPES: Record<OutfitSlotKey, { label: string; types: typeof TOP_TYPES; ghost?: string; hint?: string; isAccessory?: boolean }> = {
  outerwear: { label: 'Outerwear', types: OUTERWEAR_TYPES },
  top:       { label: 'Top', types: TOP_TYPES, ghost: 'Auto: white fitted tee' },
  bottom:    { label: 'Bottom', types: BOTTOM_TYPES, ghost: 'Auto: straight-leg trousers' },
  dress:     { label: 'Dress', types: DRESS_TYPES },
  shoes:     { label: 'Shoes', types: SHOE_TYPES, ghost: 'Auto: white low-top sneakers' },
  coverUp:   { label: 'Cover-up', types: COVER_UP_TYPES, hint: 'Beach overlay' },
  bag:       { label: 'Bag', types: BAG_TYPES, isAccessory: true },
  hat:       { label: 'Hat', types: HAT_TYPES, isAccessory: true },
  eyewear:   { label: 'Eyewear', types: EYEWEAR_TYPES, isAccessory: true },
  belt:      { label: 'Belt', types: BELT_TYPES, isAccessory: true },
  watch:     { label: 'Watch', types: WATCH_TYPES, isAccessory: true },
  jewelry:   { label: 'Jewelry', types: [], isAccessory: true },
};

function ZaraOutfitPanel({
  details, update, primaryCategory, modelGender, analyses, selectedProductIds, allProducts, productCategories,
}: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  primaryCategory?: string;
  modelGender?: string;
  analyses: Record<string, ProductAnalysis | undefined>;
  selectedProductIds: Set<string>;
  allProducts: UserProduct[];
  productCategories?: string[];
}) {
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  // Resolve conflicts based on the first selected product (or primary category fallback)
  const firstProductId = Array.from(selectedProductIds)[0];
  const firstAnalysis = firstProductId ? analyses[firstProductId] : undefined;
  const firstProduct = allProducts.find(p => p.id === firstProductId);
  const resolution = useMemo(
    () => resolveOutfitConflicts(
      firstAnalysis?.category || primaryCategory,
      firstAnalysis?.garmentType,
    ),
    [firstAnalysis, primaryCategory],
  );

  const config: OutfitConfig = details.outfitConfig || {};
  const updateSlot = (slot: OutfitSlotKey, piece: OutfitPiece | undefined) => {
    const next: OutfitConfig = { ...config };
    if (piece) (next as Record<string, unknown>)[slot] = piece;
    else delete (next as Record<string, unknown>)[slot];
    update({ outfitConfig: next });
  };
  const handleLoadPreset = (cfg: OutfitConfig) => update({ outfitConfig: cfg });

  if (resolution.hideOutfitPanel) {
    return (
      <p className="text-xs text-muted-foreground italic px-1">Outfit not needed for this product.</p>
    );
  }

  // Split available slots into garments (always shown) vs accessories (collapsible)
  const garmentOrder: OutfitSlotKey[] = ['outerwear', 'top', 'bottom', 'dress', 'shoes', 'coverUp'];
  const garmentSlots = garmentOrder.filter(s => s === resolution.lockedSlot || resolution.availableSlots.includes(s));
  const accessorySlots = (['bag', 'hat', 'eyewear', 'belt', 'watch', 'jewelry'] as OutfitSlotKey[])
    .filter(s => s === resolution.lockedSlot || resolution.availableSlots.includes(s));

  return (
    <div className="space-y-3">
      <OutfitPresetBar
        currentConfig={config}
        resolution={resolution}
        onLoad={handleLoadPreset}
        category={firstAnalysis?.category || primaryCategory}
        gender={modelGender}
        productCategories={productCategories}
      />

      <div className="space-y-2">
        {garmentSlots.map(slot => {
          const meta = SLOT_TYPES[slot];
          const isLocked = resolution.lockedSlot === slot;
          const value = (config as Record<string, OutfitPiece | undefined>)[slot];
          // Show "add layer" CTA on TOP slot when outerwear is available + not yet picked
          const showAddLayer = slot === 'top'
            && resolution.availableSlots.includes('outerwear')
            && !config.outerwear
            && !isLocked;
          return (
            <OutfitSlotCard
              key={slot}
              label={meta.label.toUpperCase()}
              hint={slot === 'top' && resolution.lockedSlot === 'outerwear' ? "What's underneath?" : undefined}
              ghostDefault={meta.ghost}
              types={meta.types}
              value={value}
              onChange={(p) => updateSlot(slot, p)}
              locked={isLocked}
              productThumb={isLocked ? firstProduct?.image_url : undefined}
              productName={isLocked ? firstProduct?.title : undefined}
              onAddLayer={showAddLayer ? () => updateSlot('outerwear', { garment: 'jacket', color: '' }) : undefined}
              layerLabel="+ Add layer over (jacket, blazer, cardigan)"
            />
          );
        })}
      </div>

      {accessorySlots.length > 0 && (
        <Collapsible open={accessoriesOpen} onOpenChange={setAccessoriesOpen}>
          <CollapsibleTrigger className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group/acc">
            <ChevronRight className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0', accessoriesOpen && 'rotate-90')} />
            <span className="text-xs font-semibold text-muted-foreground group-hover/acc:text-foreground transition-colors">Accessories</span>
            <span className="text-[11px] text-muted-foreground/60 truncate ml-1">
              {accessorySlots.map(s => SLOT_TYPES[s].label).join(' · ')}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-2">
              {accessorySlots.map(slot => {
                const meta = SLOT_TYPES[slot];
                const isLocked = resolution.lockedSlot === slot;
                // ── Special: jewelry uses JewelryConfig (necklace/earrings/bracelet/ring/metal) ──
                if (slot === 'jewelry') {
                  const jv = config.jewelry || {};
                  const updateJewelry = (patch: Partial<typeof jv>) => {
                    const next = { ...jv, ...patch };
                    // Clean undefined entries
                    Object.keys(next).forEach(k => {
                      if (!(next as Record<string, unknown>)[k]) delete (next as Record<string, unknown>)[k];
                    });
                    const hasAny = Object.keys(next).length > 0;
                    update({ outfitConfig: { ...config, jewelry: hasAny ? next : undefined } });
                  };
                  const ChipRow = ({ label, options, current, field }: { label: string; options: string[]; current?: string; field: keyof typeof jv }) => (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground/70 w-16 shrink-0">{label}</span>
                      {options.map(opt => {
                        const active = current === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => updateJewelry({ [field]: active ? undefined : opt } as Partial<typeof jv>)}
                            className={cn(
                              'h-6 px-2 rounded-md text-[10px] font-medium border transition-colors',
                              active ? 'bg-foreground text-background border-foreground' : 'bg-muted/30 hover:bg-muted border-border/50',
                            )}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  );
                  const hasAny = Object.keys(jv).length > 0;
                  return (
                    <div key={slot} className="rounded-xl border bg-card/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">JEWELRY</span>
                        {hasAny && (
                          <button
                            onClick={() => update({ outfitConfig: { ...config, jewelry: undefined } })}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear jewelry"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <ChipRow label="Necklace" options={JEWELRY_NECKLACES} current={jv.necklace} field="necklace" />
                      <ChipRow label="Earrings" options={JEWELRY_EARRINGS} current={jv.earrings} field="earrings" />
                      <ChipRow label="Bracelet" options={JEWELRY_BRACELETS} current={jv.bracelet} field="bracelet" />
                      <ChipRow label="Ring" options={JEWELRY_RINGS} current={jv.ring} field="ring" />
                      <ChipRow label="Metal" options={JEWELRY_METALS} current={jv.metal} field="metal" />
                    </div>
                  );
                }
                // Default OutfitPiece-based slot (bag, hat, eyewear, belt, watch)
                if (meta.types.length === 0) return null;
                const value = (config as Record<string, OutfitPiece | undefined>)[slot];
                return (
                  <OutfitSlotCard
                    key={slot}
                    label={meta.label.toUpperCase()}
                    types={meta.types}
                    value={value}
                    onChange={(p) => updateSlot(slot, p)}
                    locked={isLocked}
                    productThumb={isLocked ? firstProduct?.image_url : undefined}
                    productName={isLocked ? firstProduct?.title : undefined}
                    showFit={false}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════ */

export function ProductImagesStep3Refine({
  selectedSceneIds,
  productCount,
  details,
  onDetailsChange,
  userModels = [],
  globalModels = [],
  selectedScenes = [],
  allProducts = [],
  selectedProductIds = new Set(),
  hasMultipleCategories = false,
  primaryCategory,
  sceneExtraRefs = {},
  onSceneExtraRefsChange,
  analyses = {},
  isFree = false,
  onUpgradeClick,
}: Step3RefineProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [uploadingSceneId, setUploadingSceneId] = useState<string | null>(null);
  const extraRefInputRef = useRef<HTMLInputElement>(null);
  const pendingSceneIdRef = useRef<string | null>(null);
  const { colors: savedColors, canSave, saveColor, saveGradient, deleteColor } = useUserSavedColors();
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });

  // Free-plan inline limit hints (transient, auto-dismiss)
  const [modelLimitHintAt, setModelLimitHintAt] = useState<number | null>(null);
  const [bgLimitHintAt, setBgLimitHintAt] = useState<number | null>(null);
  useEffect(() => {
    if (modelLimitHintAt == null) return;
    const t = setTimeout(() => setModelLimitHintAt(null), 3500);
    return () => clearTimeout(t);
  }, [modelLimitHintAt]);
  useEffect(() => {
    if (bgLimitHintAt == null) return;
    const t = setTimeout(() => setBgLimitHintAt(null), 3500);
    return () => clearTimeout(t);
  }, [bgLimitHintAt]);
  const flashModelLimit = useCallback(() => setModelLimitHintAt(Date.now()), []);
  const flashBgLimit = useCallback(() => setBgLimitHintAt(Date.now()), []);
  const modelFreeLimitReached = isFree && ((details.selectedModelIds?.length || 0) >= 1 || !!details.selectedModelId);
  const allSceneIds = Array.from(selectedSceneIds);
  const [aestheticPickerOpen, setAestheticPickerOpen] = useState(false);
  const { allScenes: dbScenes } = useProductImageScenes();

  // Scene-specific detail blocks
  const sceneGroups = getBlocksByScene(selectedSceneIds, dbScenes);
  const hasPersonBlock = sceneGroups.some(g => g.blocks.includes('personDetails'));

  // Scenes that need a model
  const scenesNeedingModel = useMemo(() =>
    selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails')),
    [selectedScenes]
  );
  const needsModel = scenesNeedingModel.length > 0 && !details.selectedModelId;

  // Packaging scenes detection
  const hasPackagingScenes = useMemo(() =>
    selectedScenes.some(s => (s.triggerBlocks || []).includes('packagingDetails')),
    [selectedScenes]
  );
  const [uploadingPackagingRef, setUploadingPackagingRef] = useState(false);
  const packagingRefInputRef = useRef<HTMLInputElement>(null);

  const handlePackagingRefUpload = useCallback(async (file: File) => {
    setUploadingPackagingRef(true);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `packaging-refs/${ts}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.storage
        .from('product-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from('product-uploads')
        .getPublicUrl(data.path);
      update({ packagingReferenceUrl: urlData.publicUrl });
    } catch (e: any) {
      const { toast } = await import('@/lib/brandedToast');
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingPackagingRef(false);
    }
  }, [update]);

  // Back view scenes detection
  const hasBackViewScenes = useMemo(() =>
    selectedScenes.some(s => (s.triggerBlocks || []).includes('backView')),
    [selectedScenes]
  );
  const [uploadingBackRef, setUploadingBackRef] = useState(false);
  const backRefInputRef = useRef<HTMLInputElement>(null);

  // Reference trigger detection — find which REFERENCE_TRIGGERS are active from selected scenes
  const activeReferenceTriggers = useMemo(() => {
    const found = new Set<string>();
    for (const scene of selectedScenes) {
      for (const tb of (scene.triggerBlocks || [])) {
        if (REFERENCE_TRIGGERS[tb]) found.add(tb);
      }
    }
    return Array.from(found);
  }, [selectedScenes]);

  const [uploadingRefTrigger, setUploadingRefTrigger] = useState<string | null>(null);
  const refTriggerInputRef = useRef<HTMLInputElement>(null);
  const pendingRefTriggerRef = useRef<string | null>(null);

  // Selected products for per-product reference UI
  const selectedProductsList = useMemo(
    () => allProducts.filter(p => selectedProductIds.has(p.id)),
    [allProducts, selectedProductIds],
  );
  const isMultiProduct = selectedProductsList.length > 1;

  // Union of selected product categories — drives preset filtering + auto-pick
  const selectedProductCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of selectedProductsList) {
      const cat = analyses[p.id]?.category;
      if (cat) cats.add(cat);
    }
    if (cats.size === 0 && primaryCategory) cats.add(primaryCategory);
    return Array.from(cats);
  }, [selectedProductsList, analyses, primaryCategory]);

  // ── AI Stylist: per-product auto-pick ──
  // Each selected product gets its own preset suited to its category.
  // Stored in details.outfitConfigByProduct so the prompt builder can resolve
  // the right outfit for each product at generation time.
  const [restyleSeed, setRestyleSeed] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const autoPickedRef = useRef(false);

  // Build the per-product picks (productId → preset) used by both the AI Stylist card
  // and the auto-apply effect below. Recomputed when products, categories, or seed change.
  const perProductPicks = useMemo(() => {
    if (selectedProductsList.length === 0) return {} as Record<string, ReturnType<typeof pickDefaultPreset>>;
    const items = selectedProductsList.map(p => ({
      id: p.id,
      categories: [analyses[p.id]?.category, primaryCategory].filter(Boolean) as string[],
    }));
    return pickDefaultPresetPerProduct(items, restyleSeed);
  }, [selectedProductsList, analyses, primaryCategory, restyleSeed]);

  // Apply the per-product picks on first mount (silent) — and again whenever Re-style is clicked.
  useEffect(() => {
    if (!hasPersonBlock) return;
    const cfg = details.outfitConfig;
    const hasGlobal = cfg && Object.keys(cfg).some(k => {
      const v = (cfg as Record<string, unknown>)[k];
      return v !== undefined && v !== null && v !== '';
    });
    const hasPerProduct = details.outfitConfigByProduct && Object.keys(details.outfitConfigByProduct).length > 0;
    // First mount with any existing user customization → leave alone
    if (!autoPickedRef.current && (hasGlobal || hasPerProduct)) {
      autoPickedRef.current = true;
      return;
    }
    // Apply (or re-apply on restyle)
    if (Object.keys(perProductPicks).length === 0) return;
    const map: Record<string, OutfitConfig> = {};
    for (const [pid, preset] of Object.entries(perProductPicks)) {
      if (preset) map[pid] = preset.config;
    }
    autoPickedRef.current = true;
    update({ outfitConfigByProduct: map, outfitConfig: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPersonBlock, restyleSeed, perProductPicks]);

  const handleRestyle = useCallback(() => {
    setRestyleSeed(s => s + 1);
    const count = selectedProductsList.length;
    toast.success(`Re-styled ${count} ${count === 1 ? 'product' : 'products'}`);
  }, [selectedProductsList.length]);

  // Picks shown in the card (productId → preset name), filtered to current selection
  const stylistCardPicks = useMemo(() => {
    return selectedProductsList
      .map(p => ({
        product: p,
        presetName: perProductPicks[p.id]?.name || '',
      }))
      .filter(x => !!x.presetName);
  }, [selectedProductsList, perProductPicks]);

  // Legacy single-name fallback (used in Edit-Outfit override card)
  const autoPickedPresetName = stylistCardPicks[0]?.presetName || null;

  const clearAutoPick = useCallback(() => {
    update({ outfitConfig: {}, outfitConfigByProduct: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-product reference upload handler — stores as trigger:{type}:{productId}
  const handlePerProductRefUpload = useCallback(async (triggerKey: string, productId: string, file: File) => {
    if (!onSceneExtraRefsChange) return;
    const refKey = isMultiProduct ? `trigger:${triggerKey}:${productId}` : `trigger:${triggerKey}`;
    setUploadingRefTrigger(refKey);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `scene-extra-refs/${ts}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase.storage
        .from('product-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = (await import('@/integrations/supabase/client')).supabase.storage
        .from('product-uploads')
        .getPublicUrl(data.path);
      onSceneExtraRefsChange({ ...sceneExtraRefs, [refKey]: urlData.publicUrl });
    } catch (e: any) {
      const { toast } = await import('@/lib/brandedToast');
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingRefTrigger(null);
    }
  }, [sceneExtraRefs, onSceneExtraRefsChange, isMultiProduct]);

  const handleRefTriggerUpload = useCallback(async (triggerKey: string, file: File) => {
    // For single product, use global key; for multi, this shouldn't be called directly
    handlePerProductRefUpload(triggerKey, selectedProductsList[0]?.id || '', file);
  }, [handlePerProductRefUpload, selectedProductsList]);

  const removeRefTrigger = useCallback((triggerKey: string, productId?: string) => {
    if (!onSceneExtraRefsChange) return;
    const next = { ...sceneExtraRefs };
    if (productId && isMultiProduct) {
      delete next[`trigger:${triggerKey}:${productId}`];
    } else {
      delete next[`trigger:${triggerKey}`];
    }
    onSceneExtraRefsChange(next);
  }, [sceneExtraRefs, onSceneExtraRefsChange, isMultiProduct]);

  // Get ref URL for a trigger — checks per-product key first, then global
  const getRefUrl = useCallback((triggerKey: string, productId?: string): string | undefined => {
    if (productId) {
      return sceneExtraRefs[`trigger:${triggerKey}:${productId}`] || sceneExtraRefs[`trigger:${triggerKey}`];
    }
    return sceneExtraRefs[`trigger:${triggerKey}`];
  }, [sceneExtraRefs]);

  const handleBackRefUpload = useCallback(async (file: File, productId?: string) => {
    // Route through unified per-product handler
    handlePerProductRefUpload('backView', productId || selectedProductsList[0]?.id || '', file);
  }, [handlePerProductRefUpload, selectedProductsList]);

  const handlePackagingRefUploadForProduct = useCallback(async (file: File, productId?: string) => {
    handlePerProductRefUpload('packagingDetails', productId || selectedProductsList[0]?.id || '', file);
  }, [handlePerProductRefUpload, selectedProductsList]);

  // Per-product file input ref & pending state
  const perProductInputRef = useRef<HTMLInputElement>(null);
  const pendingPerProductRef = useRef<{ triggerKey: string; productId: string } | null>(null);

  // UI state
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

  // Check if a scene has actionDetails controls (the only expandable block now)
  const sceneHasActionControls = (scene: ProductImageScene) => {
    return (scene.triggerBlocks || []).includes('actionDetails');
  };

  const toggleSceneExpand = (id: string) => {
    const scene = selectedScenes.find(s => s.id === id);
    if (!scene) return;

    // Only expand if scene has action controls
    if (sceneHasActionControls(scene)) {
      setExpandedSceneId(prev => prev === id ? null : id);
    }
  };


  // All models + resolve selected model gender
  const allModels = [...userModels, ...globalModels];
  const selectedModelGender = useMemo(() => {
    if (!details.selectedModelId) return undefined;
    const model = allModels.find(m => m.modelId === details.selectedModelId);
    return model?.gender;
  }, [details.selectedModelId, allModels]);

  // Scene categorization
  const bgScenes = useMemo(() => selectedScenes.filter(s => s.triggerBlocks?.includes('background')), [selectedScenes]);
  const aestheticColorScenes = useMemo(() => selectedScenes.filter(s => s.triggerBlocks?.includes('aestheticColor')), [selectedScenes]);

  // Auto-preselect first recommended aesthetic color when scenes need it
  useEffect(() => {
    if (aestheticColorScenes.length > 0 && !details.aestheticColorHex) {
      for (const scene of aestheticColorScenes) {
        if (scene.suggestedColors && scene.suggestedColors.length > 0) {
          const pick = scene.suggestedColors[0];
          update({ aestheticColorHex: pick.hex, aestheticColorLabel: pick.label });
          return;
        }
      }
    }
  }, [aestheticColorScenes.length]);
  const productShots = useMemo(() => selectedScenes.filter(s => !(s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails')), [selectedScenes]);
  const modelShots = useMemo(() => selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails')), [selectedScenes]);

  // Check if all person/action scenes have outfit_hint (scene-controlled outfit)
  const allModelScenesHaveOutfitHint = useMemo(() => {
    const personScenes = selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails'));
    return personScenes.length > 0 && personScenes.every(s => !!s.outfitHint);
  }, [selectedScenes]);
  const someModelScenesHaveOutfitHint = useMemo(() => {
    const personScenes = selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails'));
    return personScenes.some(s => !!s.outfitHint) && !allModelScenesHaveOutfitHint;
  }, [selectedScenes, allModelScenesHaveOutfitHint]);

  // ── Per-scene styling source preview (matches resolveOutfitHintText logic in promptBuilder) ──
  const userOutfitFilled = useMemo(() => {
    const cfg = details.outfitConfig;
    if (cfg) {
      if (cfg.top?.garment || cfg.bottom?.garment || cfg.shoes?.garment ||
          cfg.outerwear?.garment || cfg.dress?.garment || cfg.coverUp?.garment ||
          cfg.bag?.garment || cfg.hat?.garment || cfg.eyewear?.garment ||
          cfg.belt?.garment || cfg.watch?.garment ||
          (cfg.jewelry && Object.keys(cfg.jewelry).length > 0) ||
          (cfg.accessories && cfg.accessories.length > 0)) return true;
    }
    return !!(details.outfitTop || details.outfitBottom || details.outfitShoes || details.outfitAccessories);
  }, [details.outfitConfig, details.outfitTop, details.outfitBottom, details.outfitShoes, details.outfitAccessories]);

  const stylingSourceByScene = useMemo(() => {
    const personScenes = selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails'));
    return personScenes.map(s => {
      const overrideActive = !!details.outfitOverrideEnabled && userOutfitFilled;
      let source: 'scene' | 'user' | 'default';
      if (overrideActive) source = 'user';
      else if (s.outfitHint) source = 'scene';
      else if (userOutfitFilled) source = 'user';
      else source = 'default';
      return { scene: s, source };
    });
  }, [selectedScenes, details.outfitOverrideEnabled, userOutfitFilled]);

  // Human-readable summary of what's in outfitConfig (e.g. "Top: white cropped tee")
  const userOutfitSummaryParts = useMemo<string[]>(() => {
    const cfg = details.outfitConfig;
    const parts: string[] = [];
    if (!cfg) {
      if (details.outfitTop) parts.push(`Top: ${details.outfitTop}`);
      if (details.outfitBottom) parts.push(`Bottom: ${details.outfitBottom}`);
      if (details.outfitShoes) parts.push(`Shoes: ${details.outfitShoes}`);
      if (details.outfitAccessories) parts.push(`Accessories: ${details.outfitAccessories}`);
      return parts;
    }
    const describe = (label: string, p?: { garment?: string; color?: string; fit?: string; material?: string; subtype?: string }) => {
      if (!p?.garment) return;
      const bits = [p.color, p.fit, p.material, p.subtype, p.garment].filter(Boolean);
      parts.push(`${label}: ${bits.join(' ')}`);
    };
    describe('Outerwear', cfg.outerwear);
    describe('Top', cfg.top);
    describe('Bottom', cfg.bottom);
    describe('Dress', cfg.dress);
    describe('Cover-up', cfg.coverUp);
    describe('Shoes', cfg.shoes);
    describe('Bag', cfg.bag);
    describe('Hat', cfg.hat);
    describe('Eyewear', cfg.eyewear);
    describe('Belt', cfg.belt);
    describe('Watch', cfg.watch);
    if (cfg.jewelry && Object.keys(cfg.jewelry).length > 0) {
      const jBits = Object.entries(cfg.jewelry).filter(([, v]) => !!v).map(([k, v]) => `${k}: ${v}`);
      if (jBits.length) parts.push(`Jewelry: ${jBits.join(', ')}`);
    }
    if (cfg.accessories) parts.push(`Accessories: ${cfg.accessories}`);
    return parts;
  }, [details.outfitConfig, details.outfitTop, details.outfitBottom, details.outfitShoes, details.outfitAccessories]);

  // Decide how to render the styling preview: hidden / single-summary / mixed-list
  const stylingPreview = useMemo(() => {
    const rows = stylingSourceByScene;
    const overrideActive = !!details.outfitOverrideEnabled && userOutfitFilled;
    if (rows.length === 0) return { mode: 'hidden' as const, overrideActive };
    const sources = new Set(rows.map(r => r.source));
    if (sources.size === 1) {
      return { mode: 'uniform' as const, source: rows[0].source, count: rows.length, overrideActive };
    }
    return { mode: 'mixed' as const, rows, overrideActive };
  }, [stylingSourceByScene, details.outfitOverrideEnabled, userOutfitFilled]);


  // Shot card collapse
  const SHOTS_LIMIT = 8;
  const [showAllShots, setShowAllShots] = useState(false);
  const visibleScenes = showAllShots ? selectedScenes : selectedScenes.slice(0, SHOTS_LIMIT);
  const hasMoreShots = selectedScenes.length > SHOTS_LIMIT;

  // Extra reference upload handler
  const handleExtraRefUpload = useCallback(async (sceneId: string, file: File) => {
    if (!onSceneExtraRefsChange) return;
    setUploadingSceneId(sceneId);
    try {
      const ts = Date.now();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `scene-extra-refs/${ts}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await (await import('@/integrations/supabase/client')).supabase.storage
        .from('product-uploads')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = (await import('@/integrations/supabase/client')).supabase.storage
        .from('product-uploads')
        .getPublicUrl(data.path);
      onSceneExtraRefsChange({ ...sceneExtraRefs, [sceneId]: urlData.publicUrl });
    } catch (e: any) {
      const { toast } = await import('@/lib/brandedToast');
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingSceneId(null);
    }
  }, [sceneExtraRefs, onSceneExtraRefsChange]);

  const removeExtraRef = useCallback((sceneId: string) => {
    if (!onSceneExtraRefsChange) return;
    const next = { ...sceneExtraRefs };
    delete next[sceneId];
    onSceneExtraRefsChange(next);
  }, [sceneExtraRefs, onSceneExtraRefsChange]);

  const renderShotCard = (scene: ProductImageScene) => {
    const sceneNeedsModel = (scene.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails');
    const hasBg = (scene.triggerBlocks || []).includes('background');
    const hasAction = sceneHasActionControls(scene);
    const isExpanded = expandedSceneId === scene.id;
    const needsExtraRef = scene.requiresExtraReference === true;
    const extraRefUrl = sceneExtraRefs[scene.id];
    const isUploading = uploadingSceneId === scene.id;

    return (
      <div key={scene.id} className="space-y-1">
        <button
          type="button"
          onClick={() => hasAction ? toggleSceneExpand(scene.id) : undefined}
          className={cn(
            'w-full rounded-lg overflow-hidden border transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary',
            isExpanded
              ? 'border-primary shadow-sm'
              : sceneNeedsModel && needsModel
                ? 'border-primary/30 hover:border-primary/50'
                : 'border-border hover:border-primary/30',
            hasAction ? 'cursor-pointer' : 'cursor-default',
          )}
        >
          <div className="aspect-[3/4] bg-muted overflow-hidden">
            {scene.previewUrl ? (
              <ShimmerImage src={getOptimizedUrl(scene.previewUrl, { quality: 60 })} alt={scene.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </button>
        <div className="px-0.5 space-y-0.5">
          <p className="text-[11px] font-medium truncate leading-snug">{scene.title}</p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">AI</span>
            {hasBg && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">BG</span>}
            {sceneNeedsModel && !needsModel && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Model</span>}
            {sceneNeedsModel && needsModel && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Needs model</span>
            )}
          </div>

          {/* Extra reference upload area */}
          {needsExtraRef && (
            <div className="mt-1.5">
              {extraRefUrl ? (
                <div className="relative group rounded-md overflow-hidden border border-border">
                  <img src={getOptimizedUrl(extraRefUrl, { quality: 70 })} alt="Extra reference" loading="lazy" className="w-full aspect-[3/4] object-contain object-center bg-muted/30" />
                  <button
                    type="button"
                    onClick={() => removeExtraRef(scene.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    pendingSceneIdRef.current = scene.id;
                    extraRefInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="w-full flex flex-col items-center gap-1 py-2.5 rounded-md border border-dashed border-primary/30 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <span className="text-[10px] text-primary font-medium animate-pulse">Uploading…</span>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-[9px] text-primary/80 font-medium leading-tight text-center px-1">Upload back/side photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hidden file input for extra reference uploads */}
      <input
        ref={extraRefInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          const sid = pendingSceneIdRef.current;
          if (f && sid) handleExtraRefUpload(sid, f);
          e.target.value = '';
          pendingSceneIdRef.current = null;
        }}
      />
      {/* Hidden file input for per-product reference uploads */}
      <input
        ref={perProductInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          const pending = pendingPerProductRef.current;
          if (f && pending) handlePerProductRefUpload(pending.triggerKey, pending.productId, f);
          e.target.value = '';
          pendingPerProductRef.current = null;
        }}
      />
      {/* Hidden file input for reference trigger uploads (single product fallback) */}
      <input
        ref={refTriggerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          const tk = pendingRefTriggerRef.current;
          if (f && tk) handleRefTriggerUpload(tk, f);
          e.target.value = '';
          pendingRefTriggerRef.current = null;
        }}
      />

      {/* ── PRODUCT-SPECIFIC REFERENCE UPLOADS ── */}
      {(() => {
        const productSpecificTriggers: { key: string; label: string; description: string; icon: React.ReactNode }[] = [];
        if (hasPackagingScenes) productSpecificTriggers.push({ key: 'packagingDetails', label: 'Packaging reference', description: 'Upload a photo of your packaging for more accurate results.', icon: <PackagePlus className="w-4 h-4 text-primary" /> });
        if (hasBackViewScenes) productSpecificTriggers.push({ key: 'backView', label: 'Back view reference', description: 'Upload a photo of the back for accurate results.', icon: <RotateCcw className="w-4 h-4 text-primary" /> });
        for (const tk of activeReferenceTriggers) {
          const def = REFERENCE_TRIGGERS[tk];
          if (def) productSpecificTriggers.push({ key: tk, label: def.label, description: def.description, icon: <Camera className="w-4 h-4 text-primary" /> });
        }
        if (productSpecificTriggers.length === 0) return null;

        return productSpecificTriggers.map(trigger => {
          if (!isMultiProduct) {
            const refUrl = trigger.key === 'packagingDetails'
              ? (details.packagingReferenceUrl || getRefUrl(trigger.key))
              : trigger.key === 'backView'
              ? (details.backReferenceUrl || getRefUrl(trigger.key))
              : getRefUrl(trigger.key);
            const isUploading = uploadingRefTrigger === `trigger:${trigger.key}` || uploadingRefTrigger === trigger.key;
            return (
              <div key={trigger.key} className="space-y-3">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">{trigger.icon}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold">{trigger.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{trigger.description}</p>
                      </div>
                    </div>
                    {refUrl ? (
                      <div className="relative group w-24 aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={getOptimizedUrl(refUrl, { quality: 70 })} alt={trigger.label} className="w-full h-full object-contain" />
                        <button type="button" onClick={() => { if (trigger.key === 'packagingDetails') update({ packagingReferenceUrl: undefined }); else if (trigger.key === 'backView') update({ backReferenceUrl: undefined }); removeRefTrigger(trigger.key); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-white" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { pendingPerProductRef.current = { triggerKey: trigger.key, productId: selectedProductsList[0]?.id || '' }; perProductInputRef.current?.click(); }} disabled={isUploading} className="flex flex-col items-center justify-center gap-1.5 px-4 py-5 rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors cursor-pointer w-full">
                        {isUploading ? <span className="text-xs text-primary font-medium animate-pulse">Uploading…</span> : <><Upload className="w-5 h-5 text-primary/60" /><span className="text-xs text-primary/80 font-medium">Upload {trigger.label}</span><span className="text-[10px] text-muted-foreground">or drag & drop</span></>}
                      </button>
                    )}
                    {trigger.key === 'brandLogoOverlay' && (
                      <div className="pt-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Text / brand name to display</label>
                        <input type="text" value={details.brandLogoText || ''} onChange={e => onDetailsChange({ ...details, brandLogoText: e.target.value })} placeholder="e.g. BOTTEGA VENETA" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                        <p className="text-[11px] text-muted-foreground mt-1">Optional — if left empty, AI uses branding visible on the product</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          }

          const uploadedCount = selectedProductsList.filter(p => getRefUrl(trigger.key, p.id)).length;
          return (
            <div key={trigger.key} className="space-y-3">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">{trigger.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{trigger.label}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{uploadedCount} of {selectedProductsList.length}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Upload for each product — each product needs its own reference.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {selectedProductsList.map(product => {
                      const productRefUrl = getRefUrl(trigger.key, product.id);
                      const refKey = `trigger:${trigger.key}:${product.id}`;
                      const isUploading = uploadingRefTrigger === refKey;
                      return (
                        <div key={product.id} className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border/60 bg-card">
                          <div className="w-12 aspect-[3/4] rounded-lg overflow-hidden border border-border/40 bg-muted/30 flex-shrink-0">
                            <img src={getOptimizedUrl(product.image_url, { quality: 60 })} alt={product.title} loading="lazy" className="w-full h-full object-contain object-center" />
                          </div>
                          <span className="text-[10px] font-medium text-foreground truncate w-full text-center max-w-[80px]">{product.title}</span>
                          {productRefUrl ? (
                            <div className="relative group w-16 aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted/30">
                              <img src={getOptimizedUrl(productRefUrl, { quality: 70 })} alt={`${trigger.label} for ${product.title}`} loading="lazy" className="w-full h-full object-contain" />
                              <button type="button" onClick={() => removeRefTrigger(trigger.key, product.id)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5 text-white" /></button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => { pendingPerProductRef.current = { triggerKey: trigger.key, productId: product.id }; perProductInputRef.current?.click(); }} disabled={isUploading} className="w-16 aspect-[3/4] rounded-lg border border-dashed border-primary/30 bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5">
                              {isUploading ? <span className="text-[9px] text-primary font-medium animate-pulse">…</span> : <><Upload className="w-3.5 h-3.5 text-primary/50" /><span className="text-[8px] text-primary/60 font-medium">Upload</span></>}
                            </button>
                          )}
                          <span className={`text-[9px] font-medium ${productRefUrl ? 'text-green-600' : 'text-muted-foreground'}`}>{productRefUrl ? '✓ Done' : 'Missing'}</span>
                        </div>
                      );
                    })}
                  </div>
                  {trigger.key === 'brandLogoOverlay' && (
                    <div className="pt-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Text / brand name to display</label>
                      <input type="text" value={details.brandLogoText || ''} onChange={e => onDetailsChange({ ...details, brandLogoText: e.target.value })} placeholder="e.g. BOTTEGA VENETA" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                      <p className="text-[11px] text-muted-foreground mt-1">Optional — if left empty, AI uses branding visible on the product</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        });
      })()}

      {(scenesNeedingModel.length > 0 || bgScenes.length > 0 || aestheticColorScenes.length > 0) && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold">Complete setup</span>
            <p className="text-xs text-muted-foreground mt-0.5">Only a few choices are needed for selected shots.</p>
          </div>

          {/* Background style card — shown first so users can pick the backdrop before model/outfit */}
          {bgScenes.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Background style</span>
                    {details.backgroundTone && details.backgroundTone.split(',').filter(Boolean).length > 0 && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">
                        ×{details.backgroundTone.split(',').filter(Boolean).length} selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Applies to {bgScenes.length} selected shot{bgScenes.length !== 1 ? 's' : ''}.</p>
                </div>
                {!details.backgroundTone && (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                    <Paintbrush className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                    <span className="text-[11px] text-primary/60 font-medium">Select a background color for your selected scenes</span>
                  </div>
                )}
                <BackgroundSwatchSelector
                  value={details.backgroundTone || ''}
                  onChange={v => {
                    const next = isFree ? (v.split(',').filter(Boolean).pop() || '') : v;
                    update({ backgroundTone: next });
                  }}
                  details={details}
                  update={update}
                  savedColors={savedColors}
                  canSave={canSave}
                  onSaveColor={(hex) => saveColor({ hex })}
                  onSaveGradient={(from, to) => saveGradient({ from, to })}
                  onDeleteSavedColor={deleteColor}
                  isFree={isFree}
                  maxSelections={isFree ? 1 : undefined}
                  onLimitReached={flashBgLimit}
                  onUpgradeClick={onUpgradeClick}
                />
                {isFree && bgLimitHintAt != null && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-primary/5 border border-primary/20 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-foreground">Free plan limit — 1 background per generation.</span>
                    {onUpgradeClick && (
                      <button onClick={onUpgradeClick} className="ml-auto text-primary font-semibold hover:underline">Upgrade</button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Choose model card */}
          {scenesNeedingModel.length > 0 && (
           <Card>
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {(() => {
                          const ids = details.selectedModelIds || (details.selectedModelId ? [details.selectedModelId] : []);
                          const allModels = [...globalModels, ...userModels];
                          const selected = ids.map(id => allModels.find(m => m.modelId === id)).filter(Boolean);
                          const preview = selected.length > 0 ? selected.slice(0, 3) : globalModels.slice(0, 3);
                          return (preview.length > 0 ? preview : [null, null, null]).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted flex-shrink-0">
                              {m?.previewUrl ? (
                                <img src={getOptimizedUrl(m.previewUrl, { quality: 50 })} alt="" loading="lazy" className="w-full h-full object-cover" />
                              ) : (
                                <div className={cn('w-full h-full', i === 0 ? 'bg-primary/20' : i === 1 ? 'bg-primary/15' : 'bg-primary/10')} />
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                      <span className="text-sm font-semibold">Choose model</span>
                      {!isFree && (details.selectedModelIds?.length || (details.selectedModelId ? 1 : 0)) > 0 && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                          <Check className="w-2.5 h-2.5 mr-0.5" />{details.selectedModelIds?.length || 1} selected
                        </Badge>
                      )}
                      {!isFree && (details.selectedModelIds?.length || 0) > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); update({ selectedModelIds: [], selectedModelId: undefined }); }}
                          className="text-[9px] text-muted-foreground hover:text-destructive transition-colors ml-1 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Needed for {scenesNeedingModel.length} selected shot{scenesNeedingModel.length !== 1 ? 's' : ''}.</p>
                  </div>
                </div>
                {isFree && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border text-[11px]">
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Free plan: 1 model per batch</span>
                    {onUpgradeClick && (
                      <button onClick={onUpgradeClick} className="ml-auto text-primary font-medium hover:underline">Upgrade</button>
                    )}
                  </div>
                )}
                <ModelPickerSections
                  userModels={userModels}
                  globalModels={globalModels}
                  selectedModelId={details.selectedModelId}
                  selectedModelIds={details.selectedModelIds}
                  onSelect={(id) => {
                    if (isFree) {
                      const same = details.selectedModelId === id;
                      update({ selectedModelIds: same ? [] : [id], selectedModelId: same ? undefined : id });
                      return;
                    }
                    const current = details.selectedModelIds || (details.selectedModelId ? [details.selectedModelId] : []);
                    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
                    update({ selectedModelIds: next, selectedModelId: next[0] || undefined });
                  }}
                  onMultiSelect={(ids) => {
                    const next = isFree ? ids.slice(0, 1) : ids;
                    update({ selectedModelIds: next, selectedModelId: next[0] || undefined });
                  }}
                  previewImages={globalModels.slice(0, 3).map(m => m.previewUrl).filter(Boolean)}
                />
              </CardContent>
            </Card>
          )}

          {/* ── STYLE & OUTFIT (unified) — right after model ── */}
          {hasPersonBlock && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Style & Outfit</h3>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Pick a direction — applies to all on-model shots.</p>
                  {hasMultipleCategories && !allModelScenesHaveOutfitHint && (
                    <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 mt-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3 flex-shrink-0 text-primary" />
                      Mixed categories — each product is styled separately to fit its own silhouette.
                    </p>
                  )}
                </div>

                {allModelScenesHaveOutfitHint ? (
                  /* Scene-controlled outfit — with Edit Outfit override */
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Shirt className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        {details.outfitOverrideEnabled ? (
                          <>
                            <p className="text-xs font-medium">Custom outfit active</p>
                            <p className="text-[11px] text-muted-foreground">Your outfit selection overrides the scene's styling for this generation.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-medium">Outfit is directed by your selected shots</p>
                            <p className="text-[11px] text-muted-foreground">Each shot has a curated styling direction — colors will match your aesthetic choice.</p>
                          </>
                        )}
                      </div>
                      <Button
                        variant={details.outfitOverrideEnabled ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-[11px] px-2.5 flex-shrink-0"
                        onClick={() => update({ outfitOverrideEnabled: !details.outfitOverrideEnabled })}
                      >
                        {details.outfitOverrideEnabled ? 'Reset to scene styling' : 'Edit outfit'}
                      </Button>
                    </div>

                    {details.outfitOverrideEnabled && (
                      <ZaraOutfitPanel
                        details={details}
                        update={update}
                        primaryCategory={primaryCategory}
                        modelGender={selectedModelGender}
                        analyses={analyses}
                        selectedProductIds={selectedProductIds}
                        allProducts={allProducts}
                        productCategories={selectedProductCategories}
                      />
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Custom styling note (optional)</Label>
                      <Textarea
                        value={details.customOutfitNote || ''}
                        onChange={e => update({ customOutfitNote: e.target.value || undefined })}
                        className="text-xs min-h-[60px]"
                        placeholder="e.g. prefer neutral tones, add layered look..."
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard outfit panel — AI Stylist card by default, full editor on Customize */
                  <>
                    {someModelScenesHaveOutfitHint && (() => {
                      const hasOutfit = stylistCardPicks.length > 0
                        || (details.outfitConfig && Object.keys(details.outfitConfig).some(k => k !== 'name' && (details.outfitConfig as any)[k]))
                        || (details.outfitConfigByProduct && Object.keys(details.outfitConfigByProduct).length > 0);
                      const isOn = !!details.outfitOverrideEnabled;
                      return (
                        <div className="bg-muted/50 rounded-md px-2.5 py-2 flex items-start gap-2">
                          <Info className="w-3 h-3 flex-shrink-0 text-primary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {isOn
                                ? 'Your outfit selection will override all curated styling'
                                : 'Some shots have their own styling direction'}
                            </p>
                          </div>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-foreground/80 whitespace-nowrap">Apply my outfit to all shots</span>
                                  <Switch
                                    checked={isOn}
                                    disabled={!hasOutfit}
                                    onCheckedChange={(checked) => update({ outfitOverrideEnabled: checked })}
                                  />
                                </div>
                              </TooltipTrigger>
                              {!hasOutfit && (
                                <TooltipContent side="top">Pick an outfit first</TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      );
                    })()}

                    {stylistCardPicks.length > 0 && (
                      <AiStylistCard
                        picks={stylistCardPicks}
                        onRestyle={handleRestyle}
                        onToggleCustomize={() => setCustomizeOpen(o => !o)}
                        customizeOpen={customizeOpen}
                      />
                    )}

                    {customizeOpen && (
                      <div className="space-y-3 pt-1">
                        <p className="text-[11px] text-muted-foreground italic">
                          Editing here applies a single outfit to all your products (overrides per-product picks).
                        </p>
                        <ZaraOutfitPanel
                          details={details}
                          update={update}
                          primaryCategory={primaryCategory}
                          modelGender={selectedModelGender}
                          analyses={analyses}
                          selectedProductIds={selectedProductIds}
                          allProducts={allProducts}
                          productCategories={selectedProductCategories}
                        />
                      </div>
                    )}
                  </>
                )}

                <Collapsible>
                  <CollapsibleTrigger className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group/appear">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]/appear:rotate-90 flex-shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground group-hover/appear:text-foreground transition-colors">Appearance</span>
                    <span className="text-[11px] text-muted-foreground/60 truncate ml-1">{getAppearanceSummary(details)}</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2 pb-1 pl-6">
                      <InlinePersonDetails
                        details={details}
                        update={update}
                        outfitAccessories={details.outfitConfig?.accessories}
                        onAccessoriesChange={(v) => update({ outfitConfig: { ...details.outfitConfig, accessories: v } })}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}


          {/* Aesthetic Color card */}
          {aestheticColorScenes.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Aesthetic color</span>
                    {details.aestheticColorHex && (
                      <span
                        className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: details.aestheticColorHex }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set a signature color that carries across doors, chairs, surfaces & props in {aestheticColorScenes.length} shot{aestheticColorScenes.length !== 1 ? 's' : ''} — creating a cohesive visual story.
                  </p>
                </div>
                {!details.aestheticColorHex && (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                    <Sparkles className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                    <span className="text-[11px] text-primary/60 font-medium">Pick a color to unify the environment across selected scenes</span>
                  </div>
                )}
                {(() => {
                  const AESTHETIC_PRESETS = [
                    { hex: '#5F8A8B', label: 'Teal' },
                    { hex: '#C4704B', label: 'Terracotta' },
                    { hex: '#8B9B76', label: 'Sage' },
                    { hex: '#C4868B', label: 'Dusty Rose' },
                    { hex: '#5C6B8A', label: 'Slate Blue' },
                    { hex: '#C49B4B', label: 'Ochre' },
                    { hex: '#2D5F3E', label: 'Forest' },
                    { hex: '#3D3D3D', label: 'Charcoal' },
                  ] as const;

                  // Collect curator picks from selected aesthetic-color scenes
                  const curatorPicks: Array<{hex: string; label: string}> = [];
                  const seenHex = new Set<string>();
                  for (const scene of aestheticColorScenes) {
                    for (const pick of scene.suggestedColors || []) {
                      const normHex = pick.hex.toLowerCase();
                      if (!seenHex.has(normHex)) {
                        seenHex.add(normHex);
                        curatorPicks.push(pick);
                      }
                    }
                  }

                  const allPresetHexes = [...AESTHETIC_PRESETS.map(p => p.hex as string), ...curatorPicks.map(p => p.hex)];
                  const isCustomActive = !!details.aestheticColorHex && !allPresetHexes.includes(details.aestheticColorHex);

                  const isDark = (hex: string) => { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); if (!m) return false; return (parseInt(m[1],16)*299+parseInt(m[2],16)*587+parseInt(m[3],16)*114)/1000 < 140; };

                  const renderSwatch = (swatch: {hex: string; label: string}) => {
                    const selected = details.aestheticColorHex === swatch.hex;
                    const dark = isDark(swatch.hex);
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => update({ aestheticColorHex: selected ? undefined : swatch.hex, aestheticColorLabel: selected ? undefined : swatch.label })}
                        className={cn(
                          'relative aspect-square rounded-xl overflow-hidden transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          selected
                            ? 'ring-2 ring-primary shadow-md scale-[1.04]'
                            : 'ring-1 ring-border hover:ring-primary/30 hover:shadow-sm'
                        )}
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: swatch.hex }} />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent pt-4 pb-1 px-1">
                          <span className="text-[9px] font-medium text-white leading-none block text-center truncate">{swatch.label}</span>
                        </div>
                        {selected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className={cn('w-2.5 h-2.5', dark ? 'text-white' : 'text-primary-foreground')} />
                          </div>
                        )}
                      </button>
                    );
                  };

                  return (
                    <>
                      {curatorPicks.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary/70" />
                            <span className="text-[11px] font-semibold text-primary/80">Recommended for your shots</span>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5">
                              {curatorPicks.map(renderSwatch)}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {curatorPicks.length > 0 && (
                          <span className="text-[11px] font-medium text-muted-foreground">More colors</span>
                        )}
                        <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5">
                          {AESTHETIC_PRESETS.map(renderSwatch)}
                          {/* Custom color card */}
                          <button
                            type="button"
                            onClick={() => setAestheticPickerOpen(true)}
                            className={cn(
                              'relative aspect-square rounded-xl overflow-hidden transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                              isCustomActive
                                ? 'ring-2 ring-primary shadow-md scale-[1.04]'
                                : 'ring-1 ring-border hover:ring-primary/30 hover:shadow-sm'
                            )}
                          >
                            <div className="absolute inset-0" style={{ backgroundColor: isCustomActive ? details.aestheticColorHex : undefined }}>
                              {!isCustomActive && <div className="w-full h-full bg-muted/30" />}
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                              <Plus className={cn('w-4 h-4', isCustomActive ? 'text-white drop-shadow-sm' : 'text-muted-foreground')} />
                              <span className={cn('text-[9px] font-medium', isCustomActive ? 'text-white drop-shadow-sm' : 'text-muted-foreground')}>Custom</span>
                            </div>
                            {isCustomActive && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                      <ColorPickerDialog
                        open={aestheticPickerOpen}
                        onOpenChange={setAestheticPickerOpen}
                        mode="solid"
                        initialHex={details.aestheticColorHex || '#5F8A8B'}
                        initialGradientFrom="#F8F8F8"
                        initialGradientTo="#EEEEEE"
                        canSave={false}
                        onApplySolid={(hex) => update({ aestheticColorHex: hex, aestheticColorLabel: hex })}
                        onApplyGradient={() => {}}
                        onSaveColor={() => {}}
                        onSaveGradient={() => {}}
                      />
                    </>
                  );
                })()}
                {details.aestheticColorHex && (
                  <button
                    type="button"
                    onClick={() => update({ aestheticColorHex: undefined, aestheticColorLabel: undefined })}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    ✕ Clear aesthetic color
                  </button>
                )}
              </CardContent>
            </Card>
          )}

          <Separator />
        </div>
      )}

      {/* ── ADDITIONAL NOTE ── */}
      <div className="space-y-3">

        {/* Additional note */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <span className="text-sm font-semibold">Additional note</span>
            <p className="text-xs text-muted-foreground">Anything important to keep in mind?</p>
            <Textarea
              placeholder="Special instructions, unusual product details, styling preferences..."
              value={details.customNote || ''}
              onChange={e => update({ customNote: e.target.value })}
              rows={3}
              className="text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RatioShape, MiniRatioChips, PropPickerModal, ASPECT_RATIOS, IMAGE_COUNT_OPTIONS };
export default ProductImagesStep3Refine;
