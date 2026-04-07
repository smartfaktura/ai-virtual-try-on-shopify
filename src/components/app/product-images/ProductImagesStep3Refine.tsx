import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ColorPickerDialog } from '@/components/app/product-images/ColorPickerDialog';
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
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Paintbrush, User, Users, Layers, Camera, ChevronDown, ChevronRight, RotateCcw, Upload,
  ImageIcon, Coins, Plus, X, Search, PackagePlus, Settings2, Sparkles, Lock, Shirt,
  Save, Trash2, History, Check, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlocksByScene, BLOCK_FIELD_MAP } from './detailBlockConfig';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import type { DetailSettings, ProductImageScene, UserProduct, RefineSettings, OverallAesthetic, PersonStyling, ProductCategory, OutfitConfig, OutfitPiece, OutfitPreset } from './types';
import type { ModelProfile } from '@/types';

/* ══════════════════════════════════════════════
   Model Picker with Brand / Library sections
   ══════════════════════════════════════════════ */

function ModelPickerSections({ userModels, globalModels, selectedModelId, onSelect }: {
  userModels: ModelProfile[];
  globalModels: ModelProfile[];
  selectedModelId?: string;
  onSelect: (id: string) => void;
}) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalGender, setModalGender] = useState<'all' | 'female' | 'male'>('all');
  const [modalSearch, setModalSearch] = useState('');

  const filteredUser = useMemo(() =>
    genderFilter === 'all' ? userModels : userModels.filter(m => m.gender === genderFilter),
    [userModels, genderFilter]);

  const filteredGlobal = useMemo(() =>
    genderFilter === 'all' ? globalModels : globalModels.filter(m => m.gender === genderFilter),
    [globalModels, genderFilter]);

  const INLINE_LIMIT = 6;

  const inlineModels = useMemo(() => {
    const first6 = filteredGlobal.slice(0, INLINE_LIMIT);
    if (selectedModelId && !first6.some(m => m.modelId === selectedModelId) && !filteredUser.some(m => m.modelId === selectedModelId)) {
      const selectedModel = filteredGlobal.find(m => m.modelId === selectedModelId);
      if (selectedModel) {
        const rest = filteredGlobal.filter(m => m.modelId !== selectedModelId).slice(0, INLINE_LIMIT - 1);
        return [selectedModel, ...rest];
      }
    }
    return first6;
  }, [filteredGlobal, filteredUser, selectedModelId]);

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
    onSelect(id);
    setShowAllModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Inline gender filter */}
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
              <ModelSelectorCard key={m.modelId} model={m} isSelected={selectedModelId === m.modelId} onSelect={() => onSelect(m.modelId)} />
            ))}
          </div>
        ) : (
          <button
            onClick={() => window.open('/app/brand-models', '_blank')}
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
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {inlineModels.map(m => (
              <ModelSelectorCard key={m.modelId} model={m} isSelected={selectedModelId === m.modelId} onSelect={() => onSelect(m.modelId)} />
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
            <DialogTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4 text-primary" />Select a Model</DialogTitle>
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
                    <ModelSelectorCard key={m.modelId} model={m} isSelected={selectedModelId === m.modelId} onSelect={() => handleModalSelect(m.modelId)} />
                  ))}
                </div>
              </div>
            )}

            {modalFilteredGlobal.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {modalFilteredGlobal.map(m => (
                    <ModelSelectorCard key={m.modelId} model={m} isSelected={selectedModelId === m.modelId} onSelect={() => handleModalSelect(m.modelId)} />
                  ))}
                </div>
              </div>
            )}

            {modalFilteredUser.length === 0 && modalFilteredGlobal.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No models match your search.</p>
            )}
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

function MiniRatioChips({ value, globalValue, onChange }: { value: string; globalValue: string; onChange: (v: string) => void }) {
  const ratios = ['1:1', '4:5', '3:4', '9:16', '16:9'];
  return (
    <div className="flex gap-1">
      {ratios.map(r => {
        const isActive = value === r;
        const isGlobalDefault = r === globalValue;
        return (
          <button key={r} type="button" onClick={() => onChange(r)}
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
        {scene?.previewUrl ? <img src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" /> : <Camera className="w-3 h-3 text-muted-foreground/40" />}
      </div>
      {hovered && (
        <div className="absolute z-50 left-0 top-full mt-1 w-[120px] h-[120px] rounded-lg bg-muted border border-border shadow-lg overflow-hidden">
          {scene?.previewUrl ? <img src={scene.previewUrl} alt={scene?.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera className="w-8 h-8 text-muted-foreground/30" /></div>}
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
  { value: 'gradient', label: 'Soft Gradient', fill: 'linear-gradient(135deg, #F8F8F8, #EEEEEE)', isGradient: true },
  { value: 'gradient-warm', label: 'Warm Fade', fill: 'linear-gradient(135deg, #FAF7F2, #F0E6D8)', isGradient: true },
  { value: 'gradient-cool', label: 'Cool Fade', fill: 'linear-gradient(135deg, #F0F4F8, #E0E8F0)', isGradient: true },
];

function BackgroundSwatchSelector({ value, onChange, details, update, savedColors, canSave, onSaveColor, onSaveGradient, onDeleteSavedColor }: {
  value: string;
  onChange: (v: string) => void;
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  savedColors: { id: string; hex: string | null; gradient_from: string | null; gradient_to: string | null; label: string }[];
  canSave: boolean;
  onSaveColor: (hex: string) => void;
  onSaveGradient: (from: string, to: string) => void;
  onDeleteSavedColor: (id: string) => void;
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
            <p className="text-[9px] font-medium text-white leading-tight">Custom</p>
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
            style={{ background: hasGradientCustom ? `linear-gradient(135deg, ${gradFrom}, ${gradTo})` : 'linear-gradient(135deg, #E8E8E8, #D0D0D0)' }}
          >
            {!hasGradientCustom && <Plus className="w-4 h-4 text-muted-foreground" />}
          </div>
          {hasGradientCustom && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Check className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent px-1 py-1">
            <p className="text-[9px] font-medium text-white leading-tight">Gradient</p>
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
};

function getBuiltInPresets(category: string, isMale = false): OutfitPreset[] {
  let base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[category];
  if (!base) return [];
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
      if (!config.bottom) {
        config.bottom = { garment: 'trousers', color: 'beige', fit: 'slim', material: 'cotton' };
      }
      if (!config.shoes) {
        config.shoes = { garment: 'sneakers', color: 'white', material: 'leather' };
      }
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

  const PRESET_DESCRIPTIONS: Record<string, string> = {
    'Studio Standard': 'Clean, neutral styling for commercial product focus',
    'Editorial': 'Sharper, more fashion-led styling with elevated polish',
    'Minimal': 'Quiet neutrals, soft tones, relaxed premium simplicity',
    'Streetwear': 'Relaxed silhouettes, darker tones, urban attitude',
    'Luxury Soft': 'Warm neutrals, refined textures, elegant softness',
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />Style direction
      </span>
      <div className="flex flex-wrap gap-2">
        {allPresets.map(preset => {
          const active = isPresetActive(preset.config);
          const description = PRESET_DESCRIPTIONS[preset.name] || '';
          return (
            <div key={preset.id} className="flex items-center gap-0.5 flex-shrink-0 group">
              <button type="button" onClick={() => loadPreset(preset)}
                className={cn('w-[160px] text-left p-3 rounded-xl border transition-all cursor-pointer',
                  active ? 'bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm' : 'bg-muted/40 border-border hover:border-primary/40 hover:bg-muted/60')}>
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
            <Input value={saveName} onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsPreset(); if (e.key === 'Escape') setShowSave(false); }}
              placeholder="Preset name..." className="h-8 w-32 text-xs px-2.5" autoFocus />
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
    </div>
  );
}

/** Piece fields portion of OutfitLockPanel — shown in collapsible */
function OutfitPieceFields({ details, update, primaryCategory, modelGender }: {
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
  primaryCategory?: string;
  modelGender?: string;
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

  return (
    <>
      <PieceField label="Top" piece={currentConfig.top} onChange={p => updateConfig({ top: p })} pieceType="top" />
      <PieceField label="Bottom" piece={currentConfig.bottom} onChange={p => updateConfig({ bottom: p })} pieceType="bottom" />
      <PieceField label="Shoes" piece={currentConfig.shoes} onChange={p => updateConfig({ shoes: p })} pieceType="shoes" />
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
    <div className="space-y-4">
      <div className="space-y-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</span>
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
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accessories & Styling</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    </div>
  );
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
}: Step3RefineProps) {
  const isMobile = useIsMobile();
  const { colors: savedColors, canSave, saveColor, saveGradient, deleteColor } = useUserSavedColors();
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });
  const allSceneIds = Array.from(selectedSceneIds);
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
  const productShots = useMemo(() => selectedScenes.filter(s => !(s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails')), [selectedScenes]);
  const modelShots = useMemo(() => selectedScenes.filter(s => (s.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails')), [selectedScenes]);

  // Shot card collapse
  const SHOTS_LIMIT = 8;
  const [showAllShots, setShowAllShots] = useState(false);
  const visibleScenes = showAllShots ? selectedScenes : selectedScenes.slice(0, SHOTS_LIMIT);
  const hasMoreShots = selectedScenes.length > SHOTS_LIMIT;

  const renderShotCard = (scene: ProductImageScene) => {
    const sceneNeedsModel = (scene.triggerBlocks || []).some(b => b === 'personDetails' || b === 'actionDetails');
    const hasBg = (scene.triggerBlocks || []).includes('background');
    const hasAction = sceneHasActionControls(scene);
    const isExpanded = expandedSceneId === scene.id;

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
              <ShimmerImage src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" />
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Setup your shots</h2>
          <p className="text-sm text-muted-foreground mt-1">AI recommended settings are already applied for realistic, high-quality results.</p>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
            {selectedScenes.length} shots selected
          </span>
          {bgScenes.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
              {bgScenes.length} use custom background
            </span>
          )}
          {scenesNeedingModel.length > 0 && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              needsModel ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-foreground',
            )}>
              {scenesNeedingModel.length} need a model
            </span>
          )}
        </div>

        <Separator />
      </div>

      {/* ── SELECTED SHOTS ── */}
      {selectedScenes.length > 0 && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold">Selected shots</span>
            <p className="text-xs text-muted-foreground mt-0.5">A quick overview of the shots you chose.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {visibleScenes.map(scene => renderShotCard(scene))}
          </div>

          {/* Expanded action panel (if any) */}
          {expandedSceneId && (() => {
            const activeScene = selectedScenes.find(s => s.id === expandedSceneId);
            if (!activeScene || !sceneHasActionControls(activeScene)) return null;
            return (
              <div className="rounded-xl border border-primary/30 bg-card shadow-md p-5 space-y-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-muted border border-border/40 overflow-hidden flex-shrink-0">
                    {activeScene.previewUrl ? <img src={activeScene.previewUrl} alt={activeScene.title} className="w-full h-full object-cover" /> : <Camera className="w-4 h-4 text-muted-foreground/40 m-auto mt-3" />}
                  </div>
                  <span className="text-sm font-semibold flex-1">{activeScene.title}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpandedSceneId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <BlockFields blockKey="actionDetails" details={details} update={update} sceneIds={allSceneIds} />
              </div>
            );
          })()}

          {hasMoreShots && (
            <button
              type="button"
              onClick={() => setShowAllShots(!showAllShots)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {showAllShots ? <><EyeOff className="w-3.5 h-3.5" />Collapse</> : <><Eye className="w-3.5 h-3.5" />View all {selectedScenes.length} shots</>}
            </button>
          )}

          <Separator />
        </div>
      )}

      {/* ── COMPLETE SETUP ── */}
      {(scenesNeedingModel.length > 0 || bgScenes.length > 0) && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold">Complete setup</span>
            <p className="text-xs text-muted-foreground mt-0.5">Only a few choices are needed for selected shots.</p>
          </div>

          {/* Choose model card */}
          {scenesNeedingModel.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Choose model</span>
                      {details.selectedModelId && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                          <Check className="w-2.5 h-2.5 mr-0.5" />selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Needed for {scenesNeedingModel.length} selected shot{scenesNeedingModel.length !== 1 ? 's' : ''}.</p>
                  </div>
                </div>
                <ModelPickerSections
                  userModels={userModels}
                  globalModels={globalModels}
                  selectedModelId={details.selectedModelId}
                  onSelect={(id) => update({ selectedModelId: details.selectedModelId === id ? undefined : id })}
                />
              </CardContent>
            </Card>
          )}

          {/* Background style card */}
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
                  onChange={v => update({ backgroundTone: v })}
                  details={details}
                  update={update}
                  savedColors={savedColors}
                  canSave={canSave}
                  onSaveColor={(hex) => saveColor({ hex })}
                  onSaveGradient={(from, to) => saveGradient({ from, to })}
                  onDeleteSavedColor={deleteColor}
                />
              </CardContent>
            </Card>
          )}

          <Separator />
        </div>
      )}

      {/* ── STYLE DIRECTION ── */}
      {hasPersonBlock && (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-semibold">Style direction</span>
            <p className="text-xs text-muted-foreground mt-0.5">Choose the overall look for applicable shots.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Locked across all on-model scenes.</span>
            </div>
            <OutfitPresetsOnly details={details} update={update} primaryCategory={primaryCategory} modelGender={selectedModelGender} />
          </div>

          <Separator />
        </div>
      )}

      {/* ── OPTIONAL SECTION ── */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Optional</span>

        {/* Outfit details */}
        {hasPersonBlock && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group/customize">
              <div className="flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground group-hover/customize:text-foreground transition-colors">Outfit details</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]/customize:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pt-3 pb-1">
                <OutfitPieceFields details={details} update={update} primaryCategory={primaryCategory} modelGender={selectedModelGender} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Model styling */}
        {hasPersonBlock && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group/appear">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground group-hover/appear:text-foreground transition-colors">Model styling</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]/appear:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-3 pb-1">
                <InlinePersonDetails
                  details={details}
                  update={update}
                  outfitAccessories={details.outfitConfig?.accessories}
                  onAccessoriesChange={(v) => update({ outfitConfig: { ...details.outfitConfig, accessories: v } })}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

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
