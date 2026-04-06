import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Paintbrush, User, Layers, Camera, ChevronDown, ChevronRight, RotateCcw, Upload,
  ImageIcon, Coins, Plus, X, Search, PackagePlus, Settings2, Sparkles, Lock, Shirt,
  Save, Trash2, History, AlertTriangle, Check, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlocksByScene, BLOCK_FIELD_MAP } from './detailBlockConfig';
import { ALL_SCENES } from './sceneData';
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
        return [...first6.slice(0, INLINE_LIMIT - 1), selectedModel];
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
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Select a model or skip to customize manually below.</p>

      {/* Gender filter */}
      <Tabs value={genderFilter} onValueChange={(v) => setGenderFilter(v as any)}>
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-[11px] px-3 h-6">All</TabsTrigger>
          <TabsTrigger value="female" className="text-[11px] px-3 h-6">Women</TabsTrigger>
          <TabsTrigger value="male" className="text-[11px] px-3 h-6">Men</TabsTrigger>
        </TabsList>
      </Tabs>

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
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setModalGender(genderFilter); setModalSearch(''); setShowAllModal(true); }}>
              View all {filteredGlobal.length} models →
            </Button>
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
  const scene = ALL_SCENES.find(s => s.id === sceneId);
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
   Block field renderers (scene-specific)
   ══════════════════════════════════════════════ */

function getFocusOptions(sceneIds: string[]): { value: string; label: string }[] {
  const hasBeauty = sceneIds.some(id => id.startsWith('makeup') || id.startsWith('beauty') || id.includes('lips') || id.includes('skin'));
  if (hasBeauty) return [
    { value: 'product', label: 'Product Focus' }, { value: 'texture-formula', label: 'Texture / Formula' },
    { value: 'label', label: 'Label / Branding' }, { value: 'full-product', label: 'Full Product' },
  ];
  return [
    { value: 'material', label: 'Material / Texture' }, { value: 'label', label: 'Label / Logo' },
    { value: 'hardware', label: 'Hardware / Details' }, { value: 'packaging', label: 'Packaging' }, { value: 'full-product', label: 'Full Product' },
  ];
}

function BlockFields({ blockKey, details, update, sceneIds }: { blockKey: string; details: DetailSettings; update: (p: Partial<DetailSettings>) => void; sceneIds: string[] }) {
  switch (blockKey) {
    case 'personDetails': return null; // handled inline per scene
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
    case 'background':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ChipSelector label="Tone" value={details.backgroundTone} onChange={v => update({ backgroundTone: v })} options={[
            { value: 'white', label: 'Pure White' }, { value: 'light-gray', label: 'Light Gray' }, { value: 'warm-neutral', label: 'Warm Neutral' },
            { value: 'cool-neutral', label: 'Cool Neutral' }, { value: 'gradient', label: 'Soft Gradient' },
          ]} />
          <ChipSelector label="Shadow" value={details.shadowStyle} onChange={v => update({ shadowStyle: v })} options={[
            { value: 'none', label: 'None' }, { value: 'soft', label: 'Soft Drop' }, { value: 'natural', label: 'Natural' }, { value: 'dramatic', label: 'Dramatic' },
          ]} />
          <ChipSelector label="Spacing" value={details.compositionFraming} onChange={v => update({ compositionFraming: v })} options={[
            { value: 'tight', label: 'Tight Crop' }, { value: 'balanced', label: 'Balanced' }, { value: 'generous', label: 'Generous' },
          ]} />
        </div>
      );
    case 'visualDirection':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ChipSelector label="Mood" value={details.sceneIntensity} onChange={v => update({ sceneIntensity: v })} options={[
            { value: 'clean', label: 'Clean & Modern' }, { value: 'warm', label: 'Warm & Inviting' }, { value: 'dramatic', label: 'Dramatic' },
            { value: 'editorial', label: 'Editorial' }, { value: 'natural', label: 'Natural' },
          ]} />
          <ChipSelector label="Product Size" value={details.productProminence} onChange={v => update({ productProminence: v })} options={[
            { value: 'hero', label: 'Hero (fills frame)' }, { value: 'balanced', label: 'Balanced' }, { value: 'contextual', label: 'Contextual' },
          ]} />
          <ChipSelector label="Lighting" value={details.lightingStyle} onChange={v => update({ lightingStyle: v })} options={[
            { value: 'soft-diffused', label: 'Soft Diffused' }, { value: 'natural', label: 'Natural' }, { value: 'studio', label: 'Studio' },
            { value: 'dramatic', label: 'Dramatic' }, { value: 'golden-hour', label: 'Golden Hour' },
          ]} />
        </div>
      );
    case 'sceneEnvironment':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ChipSelector label="Environment" value={details.environmentType} onChange={v => update({ environmentType: v })} options={[
            { value: 'bathroom', label: 'Bathroom' }, { value: 'kitchen', label: 'Kitchen' }, { value: 'living-room', label: 'Living Room' },
            { value: 'desk', label: 'Desk / Workspace' }, { value: 'outdoor', label: 'Outdoor' }, { value: 'shelf', label: 'Shelf / Display' },
          ]} />
          <ChipSelector label="Surface" value={details.surfaceType} onChange={v => update({ surfaceType: v })} options={[
            { value: 'marble', label: 'Marble' }, { value: 'wood', label: 'Wood' }, { value: 'concrete', label: 'Concrete' },
            { value: 'fabric', label: 'Fabric / Linen' }, { value: 'glass', label: 'Glass' },
          ]} />
          <ChipSelector label="Styling" value={details.stylingDensity} onChange={v => update({ stylingDensity: v })} options={[
            { value: 'minimal', label: 'Minimal' }, { value: 'moderate', label: 'Moderate' }, { value: 'styled', label: 'Fully Styled' },
          ]} />
        </div>
      );
    case 'detailFocus':
      return (
        <div className="grid grid-cols-2 gap-3">
          <ChipSelector label="What to focus on" value={details.focusArea} onChange={v => update({ focusArea: v })} options={getFocusOptions(sceneIds)} />
          <ChipSelector label="Crop Intensity" value={details.cropIntensity} onChange={v => update({ cropIntensity: v })} options={[
            { value: 'slight', label: 'Slight Close-Up' }, { value: 'medium', label: 'Medium Close-Up' }, { value: 'extreme', label: 'Extreme Macro' },
          ]} />
        </div>
      );
    case 'angleSelection':
      return (
        <ChipSelector label="Number of Views" value={details.numberOfViews} onChange={v => update({ numberOfViews: v })} options={[
          { value: '2', label: '2 angles' }, { value: '3', label: '3 angles' }, { value: '4', label: '4 angles' }, { value: '6', label: '6 angles' },
        ]} />
      );
    case 'packagingDetails':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ChipSelector label="Packaging State" value={details.packagingState} onChange={v => update({ packagingState: v })} options={[
              { value: 'sealed', label: 'Sealed / Closed' }, { value: 'open', label: 'Open / Unboxing' }, { value: 'both', label: 'Product + Packaging' },
            ]} />
            <ChipSelector label="Reference Strength" value={details.referenceStrength} onChange={v => update({ referenceStrength: v })} options={[
              { value: 'loose', label: 'Loose' }, { value: 'balanced', label: 'Balanced' }, { value: 'strict', label: 'Strict' },
            ]} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Packaging Reference Image</Label>
            <p className="text-[10px] text-muted-foreground">Upload a photo of your packaging so we match it accurately.</p>
            {details.packagingReferenceUrl ? (
              <div className="flex items-center gap-3">
                <img src={details.packagingReferenceUrl} alt="Packaging ref" className="w-16 h-16 rounded-lg object-cover border border-border" />
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => update({ packagingReferenceUrl: undefined })}>Remove</Button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-muted/30">
                <span className="text-xs text-muted-foreground">Click to upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => update({ packagingReferenceUrl: reader.result as string });
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>
        </div>
      );
    case 'productSize':
      return (
        <ChipSelector label="Detected Size" value={details.productSize} onChange={v => update({ productSize: v })} options={[
          { value: 'auto', label: 'Auto' }, { value: 'very-small', label: 'Very Small' }, { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' },
        ]} />
      );
    default: return null;
  }
}

const BLOCK_LABELS: Record<string, { title: string }> = {
  personDetails: { title: 'Person / Model' },
  actionDetails: { title: 'Action' },
  background: { title: 'Background & Composition' },
  visualDirection: { title: 'Visual Direction' },
  sceneEnvironment: { title: 'Environment' },
  detailFocus: { title: 'Focus Area' },
  angleSelection: { title: 'Angles' },
  packagingDetails: { title: 'Packaging' },
  productSize: { title: 'Product Size' },
};


/* ══════════════════════════════════════════════
   Template-derived controls helper
   ══════════════════════════════════════════════ */

type TemplateControlKey = 'lighting' | 'shadow' | 'mood' | 'surface' | 'background' | 'accent' | 'productProminence';

function getTemplateControls(scene: ProductImageScene): TemplateControlKey[] {
  const t = scene.promptTemplate || '';
  const controls: TemplateControlKey[] = [];
  if (t.includes('{{lightingDirective}}')) controls.push('lighting');
  if (t.includes('{{shadowDirective}}')) controls.push('shadow');
  if (t.includes('{{moodDirective}}')) controls.push('mood');
  if (t.includes('{{surfaceDirective}}')) controls.push('surface');
  if (t.includes('{{background}}')) controls.push('background');
  if (t.includes('{{accentDirective}}') || t.includes('{{accentColorDirective}}')) controls.push('accent');
  if (t.includes('{{productProminenceDirective}}')) controls.push('productProminence');
  return controls;
}

const TEMPLATE_CONTROL_LABELS: Record<TemplateControlKey, string> = {
  lighting: 'Lighting',
  shadow: 'Shadow',
  mood: 'Styling direction',
  surface: 'Surface',
  background: 'Background family',
  accent: 'Accent color',
  productProminence: 'Product prominence',
};

function TemplateControlChips({ controlKey, details, update }: {
  controlKey: TemplateControlKey;
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
}) {
  switch (controlKey) {
    case 'lighting':
      return <ChipSelector label="Lighting" value={details.lightingStyle} onChange={v => update({ lightingStyle: v })} options={[
        { value: 'soft-diffused', label: 'Soft diffused' }, { value: 'warm-editorial', label: 'Warm editorial' },
        { value: 'crisp-studio', label: 'Crisp studio' }, { value: 'natural-daylight', label: 'Natural daylight' },
        { value: 'side-lit', label: 'Side-lit premium' },
      ]} />;
    case 'shadow':
      return <ChipSelector label="Shadow" value={details.shadowStyle} onChange={v => update({ shadowStyle: v })} options={[
        { value: 'none', label: 'None' }, { value: 'soft', label: 'Soft' },
        { value: 'natural', label: 'Natural' }, { value: 'defined', label: 'Defined' },
      ]} />;
    case 'mood':
      return <ChipSelector label="Styling direction" value={details.mood} onChange={v => update({ mood: v })} options={[
        { value: 'minimal-luxury', label: 'Minimal luxury' }, { value: 'clean-commercial', label: 'Clean commercial' },
        { value: 'fashion-editorial', label: 'Fashion editorial' }, { value: 'beauty-clean', label: 'Beauty clean' },
        { value: 'organic-natural', label: 'Organic natural' }, { value: 'modern-sleek', label: 'Modern sleek' },
        { value: 'auto', label: 'Auto from product' },
      ]} />;
    case 'surface':
      return <ChipSelector label="Surface" value={details.surfaceType} onChange={v => update({ surfaceType: v })} options={[
        { value: 'minimal-studio', label: 'Minimal studio' }, { value: 'stone-plaster', label: 'Stone / plaster' },
        { value: 'warm-wood', label: 'Warm wood' }, { value: 'fabric', label: 'Fabric / drape' },
        { value: 'glossy', label: 'Glossy clean' }, { value: 'auto', label: 'Auto from product' },
      ]} />;
    case 'background':
      return <ChipSelector label="Background family" value={details.negativeSpace} onChange={v => update({ negativeSpace: v })} options={[
        { value: 'pure-white', label: 'Pure white' }, { value: 'soft-white', label: 'Soft white' },
        { value: 'light-grey', label: 'Light grey' }, { value: 'warm-beige', label: 'Warm beige' },
        { value: 'taupe', label: 'Taupe' }, { value: 'stone', label: 'Stone' }, { value: 'auto', label: 'Auto' },
      ]} />;
    case 'accent':
      return <ChipSelector label="Accent color" value={details.brandingVisibility} onChange={v => update({ brandingVisibility: v })} options={[
        { value: 'product-accent', label: 'Use product accent' }, { value: 'none', label: 'None' },
        { value: 'brand-accent', label: 'Use brand accent' }, { value: 'custom', label: 'Custom hex' },
        { value: 'subtle', label: 'Subtle accent' }, { value: 'strong', label: 'Strong accent' },
      ]} />;
    case 'productProminence':
      return <ChipSelector label="Product prominence" value={details.productProminence} onChange={v => update({ productProminence: v })} options={[
        { value: 'hero', label: 'Hero (fills frame)' }, { value: 'balanced', label: 'Balanced' }, { value: 'contextual', label: 'Contextual' },
      ]} />;
    default: return null;
  }
}

/* ══════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════ */

const AUTO_AESTHETIC_DEFAULTS: Partial<DetailSettings> = {
  backgroundTone: 'auto',
  negativeSpace: 'auto',
  surfaceType: 'auto',
  lightingStyle: 'soft-diffused',
  shadowStyle: 'natural',
  mood: 'auto',
  brandingVisibility: 'product-accent',
};

function isAutoApplied(details: DetailSettings): boolean {
  return Object.entries(AUTO_AESTHETIC_DEFAULTS).every(
    ([k, v]) => details[k as keyof DetailSettings] === v
  );
}

function AutoAestheticButton({ details, update }: { details: DetailSettings; update: (p: Partial<DetailSettings>) => void }) {
  const active = isAutoApplied(details);
  return (
    <button
      type="button"
      onClick={() => {
        if (active) {
          update({
            backgroundTone: undefined, negativeSpace: undefined, surfaceType: undefined,
            lightingStyle: undefined, shadowStyle: undefined, mood: undefined, brandingVisibility: undefined,
          });
        } else {
          update(AUTO_AESTHETIC_DEFAULTS);
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
      )}
    >
      <Sparkles className="w-3.5 h-3.5" />
      Auto (Recommended)
    </button>
  );
}

function CustomHexPanel({ accentColor, onChange, isBrandMode }: { accentColor: string; onChange: (hex: string) => void; isBrandMode: boolean }) {
  const [localHex, setLocalHex] = useState(accentColor || '#000000');

  // Sync localHex when accentColor is cleared externally (e.g. via Auto or Reset)
  useEffect(() => { setLocalHex(accentColor || '#000000'); }, [accentColor]);
  const isValid = /^#([0-9A-Fa-f]{6})$/.test(localHex);

  const handleBlur = () => {
    if (isValid) onChange(localHex);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
      {isBrandMode && (
        <p className="text-xs text-muted-foreground flex-1">No brand profile selected — enter your brand accent manually:</p>
      )}
      <div
        className="w-8 h-8 rounded-md border border-border flex-shrink-0 shadow-sm"
        style={{ backgroundColor: isValid ? localHex : '#000000' }}
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">HEX</span>
          <Input
            value={localHex}
            onChange={e => {
              let v = e.target.value;
              if (!v.startsWith('#')) v = '#' + v;
              setLocalHex(v.slice(0, 7));
            }}
            onBlur={handleBlur}
            onKeyDown={e => { if (e.key === 'Enter') handleBlur(); }}
            className={cn('h-7 w-24 text-xs font-mono', !isValid && localHex.length === 7 && 'border-destructive')}
            placeholder="#000000"
          />
        </div>
        {!isValid && localHex.length === 7 && (
          <span className="text-[10px] text-destructive">Invalid hex code</span>
        )}
      </div>
    </div>
  );
}

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
   Outfit Lock Panel (Pro structured system)
   ══════════════════════════════════════════════ */

const GARMENT_OPTIONS: Record<string, string[]> = {
  top: ['t-shirt', 'turtleneck', 'blouse', 'crew-neck tee', 'tank top', 'shirt', 'sweater', 'crop top', 'camisole'],
  bottom: ['trousers', 'chinos', 'jeans', 'skirt', 'shorts', 'leggings', 'wide-leg pants'],
  shoes: ['sneakers', 'ankle boots', 'heels', 'loafers', 'sandals', 'mules', 'flats'],
};
const COLOR_OPTIONS = ['white', 'black', 'beige', 'navy', 'cream', 'gray', 'brown', 'olive', 'blush', 'camel'];
const FIT_OPTIONS = ['slim', 'relaxed', 'cropped', 'fitted', 'oversized', 'tailored', 'regular'];
const MATERIAL_OPTIONS = ['cotton', 'silk', 'linen', 'denim', 'leather', 'wool', 'cashmere', 'knit', 'satin'];

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
};

// Gender-variant defaults
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
};

// Built-in presets per category
function getBuiltInPresets(category: string, isMale = false): OutfitPreset[] {
  let base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[category];
  if (!base) return [];
  // Apply gender overrides so presets match the user's model gender
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

  const updateField = (field: keyof OutfitPiece, value: string) => {
    onChange({ ...current, [field]: value === current[field] ? '' : value });
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Shirt className="w-3 h-3" />{label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Garment</Label>
          <div className="flex flex-wrap gap-1">
            {garments.slice(0, 6).map(g => (
              <button key={g} type="button" onClick={() => updateField('garment', g)}
                className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer',
                  current.garment === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}>{g}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Color</Label>
          <div className="flex flex-wrap gap-1">
            {COLOR_OPTIONS.slice(0, 6).map(c => (
              <button key={c} type="button" onClick={() => updateField('color', c)}
                className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer',
                  current.color === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Fit</Label>
          <div className="flex flex-wrap gap-1">
            {FIT_OPTIONS.slice(0, 5).map(f => (
              <button key={f} type="button" onClick={() => updateField('fit', f)}
                className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer',
                  current.fit === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}>{f}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Material</Label>
          <div className="flex flex-wrap gap-1">
            {MATERIAL_OPTIONS.slice(0, 5).map(m => (
              <button key={m} type="button" onClick={() => updateField('material', m)}
                className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all cursor-pointer',
                  current.material === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40'
                )}>{m}</button>
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

  // Resolve defaults with gender awareness
  const defaultConfig = useMemo((): OutfitConfig => {
    const base = CATEGORY_OUTFIT_CONFIG_DEFAULTS[cat] || CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
    if (isMale && MALE_OUTFIT_OVERRIDES[cat]) {
      return { ...base, ...MALE_OUTFIT_OVERRIDES[cat] };
    }
    return base;
  }, [cat, isMale]);

  // Current outfit config from details, falling back to defaults
  const currentConfig: OutfitConfig = details.outfitConfig || defaultConfig;

  // Track previous category to detect category changes
  const prevCatRef = useRef(cat);

  // Initialize outfitConfig from category defaults — re-run when category/gender changes
  useEffect(() => {
    const categoryChanged = prevCatRef.current !== cat;
    prevCatRef.current = cat;
    if (!details.outfitConfig || categoryChanged) {
      update({ outfitConfig: defaultConfig });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultConfig]);

  const updateConfig = useCallback((partial: Partial<OutfitConfig>) => {
    const next = { ...currentConfig, ...partial };
    update({ outfitConfig: next });
  }, [currentConfig, update]);

  // Check if a preset config matches the current config
  const isPresetActive = useCallback((presetConfig: OutfitConfig): boolean => {
    const keys: (keyof OutfitConfig)[] = ['top', 'bottom', 'shoes', 'accessories', 'name'];
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

  // Presets: built-in + saved for this category
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

  // Determine which pieces to show
  const showBottom = !!defaultConfig.bottom?.garment;
  const showShoes = !!defaultConfig.shoes?.garment;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] text-muted-foreground">Locked across all on-model scenes. Structured for consistency.</span>
        {isMale && <Badge variant="outline" className="text-[9px] h-4 px-1.5">Male defaults</Badge>}
      </div>

      {/* Preset bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {allPresets.map(preset => {
          const active = isPresetActive(preset.config);
          return (
          <div key={preset.id} className="flex items-center gap-0.5 flex-shrink-0 group">
            <button
              type="button"
              onClick={() => loadPreset(preset)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all cursor-pointer',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
              )}
            >
              {preset.name}
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <Input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsPreset(); if (e.key === 'Escape') setShowSave(false); }}
              placeholder="Preset name..."
              className="h-6 w-28 text-[10px] px-2"
              autoFocus
            />
            <button type="button" onClick={saveCurrentAsPreset} className="text-primary hover:text-primary/80 cursor-pointer"><Save className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setShowSave(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowSave(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex-shrink-0">
            <Plus className="w-3 h-3" />Save
          </button>
        )}
      </div>

      {/* Structured outfit pieces */}
      <div className="space-y-2">
        <PieceField label="Top" piece={currentConfig.top} onChange={p => updateConfig({ top: p })} pieceType="top" />
        {showBottom && <PieceField label="Bottom" piece={currentConfig.bottom} onChange={p => updateConfig({ bottom: p })} pieceType="bottom" />}
        {showShoes && <PieceField label="Shoes" piece={currentConfig.shoes} onChange={p => updateConfig({ shoes: p })} pieceType="shoes" />}

        {/* Accessories */}
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <Shirt className="w-3 h-3 text-muted-foreground" />
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Accessories</Label>
            <Input
              value={currentConfig.accessories || ''}
              onChange={e => updateConfig({ accessories: e.target.value })}
              placeholder="none"
              className="h-6 text-[10px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 flex-1 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Inline Person Details (compact per-scene)
   ══════════════════════════════════════════════ */

function InlinePersonDetails({ details, update }: { details: DetailSettings; update: (p: Partial<DetailSettings>) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50">
      <ChipSelector label="Presentation" value={details.presentation} onChange={v => update({ presentation: v })} options={[
        { value: 'feminine', label: 'Feminine' }, { value: 'masculine', label: 'Masculine' }, { value: 'neutral', label: 'Neutral' }, { value: 'auto', label: 'Auto' },
      ]} />
      <ChipSelector label="Age Range" value={details.ageRange} onChange={v => update({ ageRange: v })} options={[
        { value: '18-25', label: '18–25' }, { value: '25-35', label: '25–35' }, { value: '35-50', label: '35–50' }, { value: '50+', label: '50+' }, { value: 'auto', label: 'Auto' },
      ]} />
      <ChipSelector label="Skin Tone" value={details.skinTone} onChange={v => update({ skinTone: v })} options={[
        { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'deep', label: 'Deep' }, { value: 'auto', label: 'Auto' },
      ]} />
      <ChipSelector label="Expression" value={details.expression} onChange={v => update({ expression: v })} options={[
        { value: 'neutral', label: 'Neutral' }, { value: 'soft-smile', label: 'Soft smile' }, { value: 'confident', label: 'Confident' }, { value: 'auto', label: 'Auto' },
      ]} />
    </div>
  );
}

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
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });
  const allSceneIds = Array.from(selectedSceneIds);

  // Scene-specific detail blocks
  const sceneGroups = getBlocksByScene(selectedSceneIds, ALL_SCENES);
  const hasPersonBlock = sceneGroups.some(g => g.blocks.includes('personDetails'));
  const hasSceneBlocks = sceneGroups.length > 0;

  // Scenes that need a model
  const scenesNeedingModel = useMemo(() =>
    selectedScenes.filter(s => s.triggerBlocks.some(b => b === 'personDetails' || b === 'actionDetails')),
    [selectedScenes]
  );
  const needsModel = scenesNeedingModel.length > 0 && !details.selectedModelId;

  // UI state
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
  const [formatOpen, setFormatOpen] = useState(false);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [outfitOpen, setOutfitOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const outfitRef = useRef<HTMLDivElement>(null);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [propModalSceneId, setPropModalSceneId] = useState<string | null>(null);

  const scrollToOutfit = useCallback(() => {
    setOutfitOpen(true);
    setTimeout(() => outfitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, []);

  const toggleSceneExpand = (id: string) => {
    // If scene needs model and none selected, auto-open Outfit section instead
    const scene = selectedScenes.find(s => s.id === id);
    if (scene && !details.selectedModelId) {
      const needsModelForScene = scene.triggerBlocks.some(b => b === 'personDetails' || b === 'actionDetails');
      if (needsModelForScene) {
        scrollToOutfit();
        return;
      }
    }
    setExpandedSceneId(prev => prev === id ? null : id);
  };

  // Customization count
  const IGNORE_KEYS = new Set([
    'aspectRatio', 'quality', 'imageCount', 'sceneAspectOverrides', 'sceneProps',
    'outfitConfig', 'selectedModelId', 'customNote',
    'outfitTop', 'outfitBottom', 'outfitShoes', 'outfitAccessories',
  ]);
  const BASELINE: Record<string, string> = {
    backgroundTone: 'auto', negativeSpace: 'auto', surfaceType: 'auto',
    lightingStyle: 'soft-diffused', shadowStyle: 'natural', mood: 'auto',
    brandingVisibility: 'product-accent',
  };
  const customizedCount = Object.entries(details).filter(([k, v]) => v && v !== '' && !IGNORE_KEYS.has(k) && BASELINE[k] !== v).length;

  const handleReset = () => {
    onDetailsChange({ aspectRatio: details.aspectRatio, quality: details.quality, imageCount: details.imageCount });
  };

  // Format calculations
  const globalRatio = details.aspectRatio || '1:1';
  const overrides = details.sceneAspectOverrides || {};
  const sceneProps = details.sceneProps || {};
  const hasOverrides = Object.values(overrides).some(v => v !== globalRatio);
  const hasAnyProps = Object.values(sceneProps).some(arr => arr.length > 0);
  const imgCount = parseInt(details.imageCount || '1', 10);
  const costPerImage = (details.quality || 'high') === 'standard' ? 3 : 6;
  const sceneCount = selectedScenes.length;
  const totalImages = productCount * sceneCount * imgCount;
  const totalCredits = totalImages * costPerImage;

  const ratioOptions = ASPECT_RATIOS.map(r => ({ ...r, icon: <RatioShape ratio={r.value} /> }));

  const handleSceneRatioChange = (sceneId: string, ratio: string) => {
    const next = { ...overrides };
    if (ratio === globalRatio) delete next[sceneId]; else next[sceneId] = ratio;
    update({ sceneAspectOverrides: next });
  };

  const openPropModal = (sceneId: string | null) => { setPropModalSceneId(sceneId); setPropModalOpen(true); };
  const handlePropConfirm = (ids: string[]) => {
    const next = { ...sceneProps };
    if (propModalSceneId === null) { for (const scene of selectedScenes) next[scene.id] = ids; }
    else next[propModalSceneId] = ids;
    update({ sceneProps: next });
  };
  const removeProp = (sceneId: string, propId: string) => {
    const next = { ...sceneProps };
    next[sceneId] = (next[sceneId] || []).filter(id => id !== propId);
    if (next[sceneId].length === 0) delete next[sceneId];
    update({ sceneProps: next });
  };
  const getProductById = (id: string) => allProducts.find(p => p.id === id);
  const modalAlreadySelected = propModalSceneId === null ? [] : sceneProps[propModalSceneId] || [];

  // All models + resolve selected model gender
  const allModels = [...userModels, ...globalModels];
  const selectedModelGender = useMemo(() => {
    if (!details.selectedModelId) return undefined;
    const model = allModels.find(m => m.modelId === details.selectedModelId);
    return model?.gender;
  }, [details.selectedModelId, allModels]);

  // Helper: get block labels for a scene (including template-derived ones)
  const getSceneBlockLabels = (scene: ProductImageScene) => {
    const labels = scene.triggerBlocks
      .filter(b => b !== 'personDetails' && b !== 'customNote' && b !== 'consistency')
      .map(b => BLOCK_LABELS[b]?.title)
      .filter(Boolean);
    // Add template-derived control labels
    const templateCtrls = getTemplateControls(scene);
    for (const ctrl of templateCtrls) {
      const lbl = TEMPLATE_CONTROL_LABELS[ctrl];
      if (lbl && !labels.includes(lbl)) labels.push(lbl);
    }
    return labels;
  };

  // Check if a scene has any expandable controls (blocks or template controls)
  const sceneHasControls = (scene: ProductImageScene) => {
    const group = sceneGroups.find(g => g.sceneId === scene.id);
    const sceneBlocks = group?.blocks.filter(b => b !== 'personDetails') || [];
    const templateCtrls = getTemplateControls(scene);
    return sceneBlocks.length > 0 || templateCtrls.length > 0;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Refine your shoot</h2>
          <p className="text-sm text-muted-foreground mt-1">Smart defaults applied. Tap a scene to fine-tune, or jump straight to Review.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {customizedCount > 0 && (
            <>
              <Badge variant="secondary" className="text-[10px]">{customizedCount} customized</Badge>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleReset}>
                <RotateCcw className="w-3 h-3" />Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── MODEL-NEEDED BANNER ── */}
      {scenesNeedingModel.length > 0 && (
        <Alert variant={needsModel ? 'default' : 'default'} className={cn(
          'border transition-colors',
          needsModel
            ? 'border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
            : 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
        )}>
          <div className="flex items-start gap-3">
            {needsModel ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <AlertDescription className="text-sm">
                {needsModel ? (
                  <>
                    <span className="font-medium text-foreground">
                      {scenesNeedingModel.map(s => `"${s.title}"`).join(', ')}
                    </span>{' '}
                    {scenesNeedingModel.length === 1 ? 'includes' : 'include'} a person.
                    Select a model or configure person details below.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">Model selected</span>{' '}
                    — applied to {scenesNeedingModel.length} scene{scenesNeedingModel.length !== 1 ? 's' : ''}.
                  </>
                )}
              </AlertDescription>
              <div className="flex gap-1.5 mt-1.5">
                {scenesNeedingModel.map(s => (
                  <div key={s.id} className="w-6 h-6 rounded bg-muted border border-border/60 overflow-hidden flex-shrink-0">
                    {s.previewUrl ? <img src={s.previewUrl} alt={s.title} className="w-full h-full object-cover" /> : <Camera className="w-3 h-3 text-muted-foreground/40 m-auto" />}
                  </div>
                ))}
              </div>
            </div>
            {needsModel && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 gap-1 flex-shrink-0 border-amber-500/40 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                onClick={() => {
                  setOutfitOpen(true);
                  setTimeout(() => outfitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
                }}
              >
                <User className="w-3 h-3" />Select Model
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* ── SECTION 1: YOUR SCENES (cards with inline expansion) ── */}
      {selectedScenes.length > 0 && (() => {
        // Compute scenes with {{background}} token for quick-action strip
        const scenesWithBackground = selectedScenes.filter(s => (s.promptTemplate || '').includes('{{background}}'));
        const showBgStrip = scenesWithBackground.length >= 2;

        return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Your scenes</span>
            <span className="text-[10px] text-muted-foreground">{selectedScenes.length} selected — tap to fine-tune</span>
            <div className="ml-auto">
              <AutoAestheticButton details={details} update={update} />
            </div>
          </div>

          {/* Quick Background + Advanced strip */}
          {showBgStrip && (
            <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">Background</span>
                <span className="text-[10px] text-muted-foreground">across {scenesWithBackground.length} scenes</span>
              </div>
              <ChipSelector label="" value={details.backgroundTone} onChange={v => update({ backgroundTone: v })} options={[
                { value: 'white', label: 'Pure White' }, { value: 'light-gray', label: 'Light Gray' },
                { value: 'warm-neutral', label: 'Warm' }, { value: 'cool-neutral', label: 'Cool' },
                { value: 'gradient', label: 'Soft Gradient' },
              ]} />
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground">Applies to:</span>
                {scenesWithBackground.map(s => (
                  <div key={s.id} className="w-5 h-5 rounded bg-muted border border-border/40 overflow-hidden flex-shrink-0" title={s.title}>
                    {s.previewUrl ? <img src={s.previewUrl} alt={s.title} className="w-full h-full object-cover" /> : <Camera className="w-2.5 h-2.5 text-muted-foreground/40 m-auto" />}
                  </div>
                ))}
              </div>

              {/* Advanced details toggle */}
              {(() => {
                // Compute which controls 2+ scenes share
                const controlCounts = new Map<TemplateControlKey, number>();
                for (const s of selectedScenes) {
                  for (const c of getTemplateControls(s)) {
                    if (c !== 'background') controlCounts.set(c, (controlCounts.get(c) || 0) + 1);
                  }
                }
                const sharedControls = Array.from(controlCounts.entries())
                  .filter(([, count]) => count >= 2)
                  .map(([key]) => key);

                if (sharedControls.length === 0) return null;

                return (
                  <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                    <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-1 border-t border-border/30 w-full">
                      <Settings2 className="w-3 h-3" />
                      <span>Advanced details</span>
                      <ChevronDown className={cn('w-3 h-3 ml-auto transition-transform', advancedOpen && 'rotate-180')} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {sharedControls.map(ctrl => (
                          <TemplateControlChips key={ctrl} controlKey={ctrl} details={details} update={update} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
            {selectedScenes.map(scene => {
              const isExpanded = expandedSceneId === scene.id;
              const sceneNeedsModel = scene.triggerBlocks.some(b => b === 'personDetails' || b === 'actionDetails');
              const blockLabels = getSceneBlockLabels(scene);
              const group = sceneGroups.find(g => g.sceneId === scene.id);
              const sceneBlocks = group?.blocks.filter(b => b !== 'personDetails') || [];
              const templateCtrls = getTemplateControls(scene);
              const hasControls = sceneBlocks.length > 0 || templateCtrls.length > 0;
              const isClickable = hasControls || (sceneNeedsModel && needsModel);
              const settingsCount = blockLabels.length;

              // Check if any template control has a non-default value
              const hasCustomizations = sceneBlocks.some(bk => {
                const fields = BLOCK_FIELD_MAP[bk] || [];
                return fields.some(f => details[f as keyof DetailSettings] && details[f as keyof DetailSettings] !== '');
              });

              return (
                <div key={scene.id} className={cn(
                  'col-span-1',
                  isExpanded && 'col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5'
                )}>
                  <button
                    type="button"
                    onClick={() => isClickable ? toggleSceneExpand(scene.id) : undefined}
                    className={cn(
                      'w-full text-left rounded-xl border-2 p-2 transition-all duration-150 group/card',
                      isExpanded
                        ? 'border-primary bg-primary/[0.03]'
                        : hasCustomizations
                          ? 'border-primary/30 bg-primary/[0.02] hover:border-primary/50 hover:shadow-sm hover:bg-muted/30'
                          : sceneNeedsModel && needsModel
                            ? 'border-amber-400/40 hover:border-amber-400/60 hover:shadow-sm hover:bg-muted/30'
                            : 'border-border hover:border-primary/30 hover:shadow-sm hover:bg-muted/30',
                      isClickable ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-muted border border-border/40 overflow-hidden flex-shrink-0">
                        {scene.previewUrl ? (
                          <img src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Camera className="w-5 h-5 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold line-clamp-2">{scene.title}</span>
                          {hasCustomizations && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        {/* Status */}
                        <div className="flex items-center gap-1 mt-1">
                          {sceneNeedsModel && needsModel ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />needs model
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />ready
                            </span>
                          )}
                        </div>
                        {/* Settings pill + tap hint */}
                        {isClickable && !isExpanded && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/40 text-[9px] text-muted-foreground font-medium">
                              <Settings2 className="w-2.5 h-2.5" />
                              {hasControls
                                ? (settingsCount <= 2 ? blockLabels.join(', ') : `${settingsCount} settings`)
                                : 'Select model'
                              }
                            </span>
                          </div>
                        )}
                        {isExpanded && (
                          <span className="text-[9px] text-primary font-medium mt-1 inline-flex items-center gap-0.5">Collapse</span>
                        )}
                        {!isClickable && (
                          <p className="text-[9px] text-muted-foreground/60 mt-0.5 italic">No extra settings</p>
                        )}
                      </div>
                      {/* Expand indicator — always visible */}
                      {isClickable && (
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-1">
                          <ChevronDown className={cn(
                            'w-3.5 h-3.5 transition-all',
                            isExpanded
                              ? 'text-primary rotate-180'
                              : 'text-muted-foreground/40 group-hover/card:text-muted-foreground',
                          )} />
                          {!isExpanded && (
                            <span className="text-[8px] text-muted-foreground/0 group-hover/card:text-muted-foreground/60 transition-colors leading-none">tap</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Inline expanded settings */}
                  {isExpanded && hasControls && (
                    <div className="mt-2 rounded-xl border border-primary/20 bg-card p-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                      {/* Scene-specific block fields */}
                      {sceneBlocks.map(blockKey => {
                        const meta = BLOCK_LABELS[blockKey];
                        if (!meta) return null;
                        return (
                          <div key={blockKey} className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground">{meta.title}</span>
                            <BlockFields blockKey={blockKey} details={details} update={update} sceneIds={allSceneIds} />
                          </div>
                        );
                      })}

                      {/* Template-derived style controls */}
                      {templateCtrls.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-border/40">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Style</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {templateCtrls.map(ctrl => (
                              <TemplateControlChips key={ctrl} controlKey={ctrl} details={details} update={update} />
                            ))}
                          </div>
                          {/* Custom hex panel for accent control */}
                          {templateCtrls.includes('accent') && (details.brandingVisibility === 'custom' || details.brandingVisibility === 'brand-accent') && (
                            <CustomHexPanel accentColor={details.accentColor || ''} onChange={hex => update({ accentColor: hex })} isBrandMode={details.brandingVisibility === 'brand-accent'} />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}

      {/* ── SECTION 2: Outfit & Model (if person scenes) ── */}
      {hasPersonBlock && (
        <div ref={outfitRef}>
          <Collapsible open={outfitOpen} onOpenChange={setOutfitOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Outfit & Model</span>
                  {details.selectedModelId && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                      <Check className="w-2.5 h-2.5 mr-0.5" />selected
                    </Badge>
                  )}
                </div>
                {outfitOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent className="p-4 space-y-5">
                  {/* Model picker */}
                  <ModelPickerSections
                    userModels={userModels}
                    globalModels={globalModels}
                    selectedModelId={details.selectedModelId}
                    onSelect={(id) => update({ selectedModelId: details.selectedModelId === id ? undefined : id })}
                  />

                  {/* Outfit lock panel */}
                  <OutfitLockPanel details={details} update={update} primaryCategory={primaryCategory} modelGender={selectedModelGender} />

                  {/* Inline person details (only when no specific model selected) */}
                  {!details.selectedModelId ? (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">Person details (auto-selected)</span>
                      <InlinePersonDetails details={details} update={update} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        <ChipSelector label="Hand Style" value={details.handStyle} onChange={v => update({ handStyle: v })} options={[
                          { value: 'clean-studio', label: 'Clean studio' }, { value: 'natural-lifestyle', label: 'Natural lifestyle' },
                          { value: 'polished-beauty', label: 'Polished beauty' }, { value: 'auto', label: 'Auto' },
                        ]} />
                        <ChipSelector label="Nails" value={details.nails} onChange={v => update({ nails: v })} options={[
                          { value: 'natural', label: 'Natural' }, { value: 'polished', label: 'Polished' }, { value: 'minimal', label: 'Minimal' }, { value: 'auto', label: 'Auto' },
                        ]} />
                        <ChipSelector label="Jewelry" value={details.jewelryVisible} onChange={v => update({ jewelryVisible: v })} options={[
                          { value: 'none', label: 'None' }, { value: 'subtle', label: 'Subtle' }, { value: 'styled', label: 'Styled' }, { value: 'auto', label: 'Auto' },
                        ]} />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* ── SECTION 3: Consistency (if multi-product) ── */}
      {productCount > 1 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Consistency</span>
            </div>
            {hasMultipleCategories ? (
              <ChipSelector label="Aesthetic source" value={details.consistency || 'auto-balance'} onChange={v => update({ consistency: v })} options={[
                { value: 'auto-balance', label: 'Auto-balance across products' },
                { value: 'anchor-first', label: 'Use first product as anchor' },
                { value: 'manual', label: 'Let me choose manually' },
              ]} />
            ) : (
              <ChipSelector label="Consistency across shots" value={details.consistency} onChange={v => update({ consistency: v })} options={[
                { value: 'natural', label: 'Natural' }, { value: 'strong', label: 'Strong' }, { value: 'strict', label: 'Strict' },
              ]} />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 4: Custom Note ── */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <span className="text-sm font-semibold">Custom note</span>
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

      {/* ── SECTION 5: Format & Output (collapsed by default) ── */}
      <Collapsible open={formatOpen} onOpenChange={setFormatOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Format & Output</span>
              <span className="text-[10px] text-muted-foreground">Aspect ratio, images per scene, quality</span>
            </div>
            {formatOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <RatioShape ratio={globalRatio} />
                    <span className="text-sm font-semibold">Format</span>
                    <span className="text-xs text-muted-foreground">(applies to all)</span>
                  </div>
                  <ChipSelector label="" value={globalRatio} onChange={v => update({ aspectRatio: v })} options={ratioOptions} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Images per scene</span>
                  </div>
                  <ChipSelector label="" value={details.imageCount || '1'} onChange={v => update({ imageCount: v })} options={IMAGE_COUNT_OPTIONS} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Quality</span>
                  </div>
                  <ChipSelector label="" value={details.quality || 'high'} onChange={v => update({ quality: v })} options={[
                    { value: 'standard', label: 'Standard (3 cr)' },
                    { value: 'high', label: 'Pro (6 cr)' },
                  ]} />
                </CardContent>
              </Card>
            </div>

            {/* Per-scene overrides */}
            {selectedScenes.length > 0 && (
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group w-full">
                  <ChevronRight className={cn('w-4 h-4 transition-transform', overridesOpen && 'rotate-90')} />
                  <span>Scene Ratios & Props</span>
                  <span className="text-xs text-muted-foreground/70">Set per-scene aspect ratios or add styling accessories</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-3">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => openPropModal(null)}>
                          <Plus className="w-3 h-3" />Add prop to all scenes
                        </Button>
                        {hasAnyProps && (
                          <button type="button" onClick={() => update({ sceneProps: {} })} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />Clear all props
                          </button>
                        )}
                      </div>
                      {selectedScenes.map(scene => {
                        const sceneRatio = overrides[scene.id] || globalRatio;
                        const isCustomRatio = overrides[scene.id] && overrides[scene.id] !== globalRatio;
                        const props = sceneProps[scene.id] || [];
                        return (
                          <div key={scene.id} className={cn('flex flex-col gap-2 p-2 rounded-lg transition-colors', (isCustomRatio || props.length > 0) ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30')}>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0 sm:w-44">
                                <span className={cn('text-xs font-medium truncate', (isCustomRatio || props.length > 0) ? 'text-foreground' : 'text-muted-foreground')}>{scene.title}</span>
                                {isCustomRatio && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">custom</span>}
                              </div>
                              <MiniRatioChips value={sceneRatio} globalValue={globalRatio} onChange={(r) => handleSceneRatioChange(scene.id, r)} />
                              <button type="button" onClick={() => openPropModal(scene.id)} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-muted-foreground border border-border/60 hover:border-primary/40 hover:text-foreground transition-all cursor-pointer ml-auto">
                                <Plus className="w-3 h-3" />Add Prop
                              </button>
                            </div>
                            {props.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pl-1">
                                {props.map(propId => {
                                  const product = getProductById(propId);
                                  if (!product) return null;
                                  return (
                                    <span key={propId} className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full bg-muted border border-border text-[10px] font-medium text-foreground">
                                      <img src={product.image_url} alt={product.title} className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                                      <span className="truncate max-w-[80px]">{product.title}</span>
                                      <button type="button" onClick={() => removeProp(scene.id, propId)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {hasOverrides && (
                        <button type="button" onClick={() => update({ sceneAspectOverrides: {} })} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 ml-auto cursor-pointer">
                          <RotateCcw className="w-3 h-3" />Reset all ratios
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── CREDIT PREVIEW (always visible) ── */}
      {productCount > 0 && sceneCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border/60">
          <Coins className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{productCount}</span> product{productCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{sceneCount}</span> scene{sceneCount !== 1 ? 's' : ''}{' '}
            · <span className="font-medium text-foreground">{imgCount}</span> image{imgCount !== 1 ? 's' : ''}{' '}
            = <span className="font-bold text-foreground">{totalImages} images</span>{' '}
            — <span className="font-bold text-primary">{totalCredits} credits</span>
          </span>
        </div>
      )}

      {/* Prop picker modal */}
      <PropPickerModal
        open={propModalOpen}
        onOpenChange={setPropModalOpen}
        products={allProducts}
        excludeIds={selectedProductIds}
        alreadySelected={modalAlreadySelected}
        onConfirm={handlePropConfirm}
      />
    </div>
  );
}

export default ProductImagesStep3Refine;
