import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Paintbrush, User, Layers, Camera, ChevronDown, ChevronRight, RotateCcw, Upload,
  ImageIcon, Coins, Plus, X, Search, PackagePlus, Settings2, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlocksByScene } from './detailBlockConfig';
import { ALL_SCENES } from './sceneData';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import type { DetailSettings, ProductImageScene, UserProduct, RefineSettings, OverallAesthetic, PersonStyling } from './types';
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

  const filteredUser = useMemo(() =>
    genderFilter === 'all' ? userModels : userModels.filter(m => m.gender === genderFilter),
    [userModels, genderFilter]);

  const filteredGlobal = useMemo(() =>
    genderFilter === 'all' ? globalModels : globalModels.filter(m => m.gender === genderFilter),
    [globalModels, genderFilter]);

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

      {/* Library Models */}
      {filteredGlobal.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredGlobal.map(m => (
              <ModelSelectorCard key={m.modelId} model={m} isSelected={selectedModelId === m.modelId} onSelect={() => onSelect(m.modelId)} />
            ))}
          </div>
        </div>
      )}

      {userModels.length === 0 && globalModels.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No models available. Use manual styling options below.</p>
      )}
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
    case 'personDetails': return null; // handled separately in Person Styling
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
          <ChipSelector label="Spacing" value={details.negativeSpace} onChange={v => update({ negativeSpace: v })} options={[
            { value: 'tight', label: 'Tight Crop' }, { value: 'balanced', label: 'Balanced' }, { value: 'generous', label: 'Generous' },
          ]} />
        </div>
      );
    case 'visualDirection':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ChipSelector label="Mood" value={details.mood} onChange={v => update({ mood: v })} options={[
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

const BLOCK_FIELD_MAP: Record<string, (keyof DetailSettings)[]> = {
  background: ['backgroundTone', 'shadowStyle', 'compositionFraming', 'negativeSpace'],
  visualDirection: ['mood', 'sceneIntensity', 'productProminence', 'lightingStyle'],
  sceneEnvironment: ['environmentType', 'surfaceType', 'stylingDensity', 'props'],
  personDetails: ['presentation', 'ageRange', 'skinTone', 'handStyle', 'nails', 'jewelryVisible', 'cropType', 'expression', 'hairVisibility'],
  actionDetails: ['actionType', 'actionIntensity'],
  detailFocus: ['focusArea', 'cropIntensity', 'detailStyle'],
  angleSelection: ['requestedViews', 'numberOfViews'],
  packagingDetails: ['packagingType', 'packagingState', 'packagingComposition', 'packagingFocus', 'referenceStrength'],
  productSize: ['productSize'],
};

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
  brandingVisibility: 'none',
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
}: Step3RefineProps) {
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });
  const allSceneIds = Array.from(selectedSceneIds);

  // Scene-specific detail blocks
  const sceneGroups = getBlocksByScene(selectedSceneIds, ALL_SCENES);
  const hasPersonBlock = sceneGroups.some(g => g.blocks.includes('personDetails'));
  const hasSceneBlocks = sceneGroups.length > 0;

  // UI state
  const [openBlocks, setOpenBlocks] = useState<Set<string>>(new Set());
  const [aestheticOpen, setAestheticOpen] = useState(true);
  const [personOpen, setPersonOpen] = useState(true);
  const [formatOpen, setFormatOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [propModalSceneId, setPropModalSceneId] = useState<string | null>(null);

  const toggleBlock = (id: string) => { const n = new Set(openBlocks); if (n.has(id)) n.delete(id); else n.add(id); setOpenBlocks(n); };

  // Customization count
  const IGNORE_KEYS = new Set(['aspectRatio', 'quality', 'imageCount', 'sceneAspectOverrides', 'sceneProps']);
  const customizedCount = Object.entries(details).filter(([k, v]) => v && v !== '' && !IGNORE_KEYS.has(k)).length;

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
  const costPerImage = 6;
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

  // All models
  const allModels = [...userModels, ...globalModels];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Refine your shoot</h2>
          <p className="text-sm text-muted-foreground mt-1">Control the aesthetic, styling, and output settings. Smart defaults are applied — edit what matters to you.</p>
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

      {/* ── SECTION 1: Overall Aesthetic ── */}
      <Collapsible open={aestheticOpen} onOpenChange={setAestheticOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Overall Aesthetic</span>
              <span className="text-[10px] text-muted-foreground">Keep your shots visually related</span>
            </div>
            {aestheticOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 border-primary/10">
            <CardContent className="p-4 space-y-4">
              {/* Auto (Recommended) button */}
              <AutoAestheticButton details={details} update={update} />

              {hasMultipleCategories && (
                <ChipSelector label="Aesthetic source" value={details.consistency || 'auto-balance'} onChange={v => update({ consistency: v })} options={[
                  { value: 'auto-balance', label: 'Auto-balance across products' },
                  { value: 'anchor-first', label: 'Use first product as anchor' },
                  { value: 'manual', label: 'Let me choose manually' },
                ]} />
              )}

              {productCount > 1 && !hasMultipleCategories && (
                <ChipSelector label="Consistency across shots" value={details.consistency} onChange={v => update({ consistency: v })} options={[
                  { value: 'natural', label: 'Natural' }, { value: 'strong', label: 'Strong' }, { value: 'strict', label: 'Strict' },
                ]} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChipSelector label="Color world" value={details.backgroundTone} onChange={v => update({ backgroundTone: v })} options={[
                  { value: 'auto', label: 'Auto from product' }, { value: 'warm-neutral', label: 'Warm neutrals' },
                  { value: 'cool-neutral', label: 'Cool neutrals' }, { value: 'monochrome', label: 'Soft monochrome' },
                  { value: 'brand-led', label: 'Brand-led' },
                ]} />

                <ChipSelector label="Background family" value={details.negativeSpace} onChange={v => update({ negativeSpace: v })} options={[
                  { value: 'pure-white', label: 'Pure white' }, { value: 'soft-white', label: 'Soft white' },
                  { value: 'light-grey', label: 'Light grey' }, { value: 'warm-beige', label: 'Warm beige' },
                  { value: 'taupe', label: 'Taupe' }, { value: 'stone', label: 'Stone' }, { value: 'auto', label: 'Auto' },
                ]} />

                <ChipSelector label="Surface / material" value={details.surfaceType} onChange={v => update({ surfaceType: v })} options={[
                  { value: 'minimal-studio', label: 'Minimal studio' }, { value: 'stone-plaster', label: 'Stone / plaster' },
                  { value: 'warm-wood', label: 'Warm wood' }, { value: 'fabric', label: 'Fabric / drape' },
                  { value: 'glossy', label: 'Glossy clean' }, { value: 'auto', label: 'Auto from product' },
                ]} />

                <ChipSelector label="Lighting" value={details.lightingStyle} onChange={v => update({ lightingStyle: v })} options={[
                  { value: 'soft-diffused', label: 'Soft diffused' }, { value: 'warm-editorial', label: 'Warm editorial' },
                  { value: 'crisp-studio', label: 'Crisp studio' }, { value: 'natural-daylight', label: 'Natural daylight' },
                  { value: 'side-lit', label: 'Side-lit premium' },
                ]} />

                <ChipSelector label="Shadow style" value={details.shadowStyle} onChange={v => update({ shadowStyle: v })} options={[
                  { value: 'none', label: 'None' }, { value: 'soft', label: 'Soft' },
                  { value: 'natural', label: 'Natural' }, { value: 'defined', label: 'Defined' },
                ]} />

                <ChipSelector label="Styling direction" value={details.mood} onChange={v => update({ mood: v })} options={[
                  { value: 'minimal-luxury', label: 'Minimal luxury' }, { value: 'clean-commercial', label: 'Clean commercial' },
                  { value: 'fashion-editorial', label: 'Fashion editorial' }, { value: 'beauty-clean', label: 'Beauty clean' },
                  { value: 'organic-natural', label: 'Organic natural' }, { value: 'modern-sleek', label: 'Modern sleek' },
                  { value: 'auto', label: 'Auto from product' },
                ]} />
              </div>

              <ChipSelector label="Accent color" value={details.brandingVisibility} onChange={v => update({ brandingVisibility: v })} options={[
                { value: 'none', label: 'None' }, { value: 'product-accent', label: 'Use product accent' },
                { value: 'brand-accent', label: 'Use brand accent' }, { value: 'custom', label: 'Custom hex' },
                { value: 'subtle', label: 'Subtle accent' }, { value: 'strong', label: 'Strong accent' },
              ]} />

              {/* Custom hex color panel */}
              {(details.brandingVisibility === 'custom' || details.brandingVisibility === 'brand-accent') && (
                <CustomHexPanel accentColor={details.accentColor || ''} onChange={hex => update({ accentColor: hex })} isBrandMode={details.brandingVisibility === 'brand-accent'} />
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* ── SECTION 2: Visible Person Styling ── */}
      {hasPersonBlock && (
        <Collapsible open={personOpen} onOpenChange={setPersonOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Visible Person Styling</span>
                <span className="text-[10px] text-muted-foreground">Hands, models, outfits</span>
              </div>
              {personOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent className="p-4 space-y-4">
                {/* Model picker with sections */}
                <ModelPickerSections
                  userModels={userModels}
                  globalModels={globalModels}
                  selectedModelId={details.selectedModelId}
                  onSelect={(id) => update({ selectedModelId: details.selectedModelId === id ? undefined : id })}
                />

                {!details.selectedModelId && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-border">
                    <ChipSelector label="Presentation" value={details.presentation} onChange={v => update({ presentation: v })} options={[
                      { value: 'feminine', label: 'Feminine' }, { value: 'masculine', label: 'Masculine' }, { value: 'neutral', label: 'Neutral' }, { value: 'auto', label: 'Auto' },
                    ]} />
                    <ChipSelector label="Age Range" value={details.ageRange} onChange={v => update({ ageRange: v })} options={[
                      { value: '18-25', label: '18–25' }, { value: '25-35', label: '25–35' }, { value: '35-50', label: '35–50' }, { value: '50+', label: '50+' }, { value: 'auto', label: 'Auto' },
                    ]} />
                    <ChipSelector label="Skin Tone" value={details.skinTone} onChange={v => update({ skinTone: v })} options={[
                      { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'deep', label: 'Deep' }, { value: 'auto', label: 'Auto' },
                    ]} />
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
                    <ChipSelector label="Expression" value={details.expression} onChange={v => update({ expression: v })} options={[
                      { value: 'neutral', label: 'Neutral' }, { value: 'soft-smile', label: 'Soft smile' }, { value: 'confident', label: 'Confident' }, { value: 'auto', label: 'Auto' },
                    ]} />
                    <ChipSelector label="Hair Visibility" value={details.hairVisibility} onChange={v => update({ hairVisibility: v })} options={[
                      { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'auto', label: 'Auto' },
                    ]} />
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ── SECTION 3: Scene-Specific Details ── */}
      {hasSceneBlocks && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Scene-specific details</span>
            <span className="text-[10px] text-muted-foreground">Optional tweaks per scene type</span>
          </div>

          {sceneGroups.map(group => {
            const blocks = group.blocks.filter(b => b !== 'personDetails');
            if (blocks.length === 0) return null;
            const blockId = group.sceneId;
            const isOpen = openBlocks.has(blockId);
            const groupCustomized = blocks.some(bk => {
              const fields = BLOCK_FIELD_MAP[bk] || [];
              return fields.some(f => details[f] && details[f] !== '');
            });

            return (
              <Collapsible key={group.sceneId} open={isOpen} onOpenChange={() => toggleBlock(blockId)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 min-w-0">
                      <SceneThumbnail sceneId={group.sceneId} />
                      <span className="text-sm font-semibold truncate">"{group.sceneTitle}" options</span>
                      {group.alsoUsedBy.length > 0 && <span className="text-[10px] text-muted-foreground hidden sm:inline">+{group.alsoUsedBy.length} more</span>}
                      {groupCustomized && <Badge variant="secondary" className="text-[9px] h-4 px-1">customized</Badge>}
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="border-border mt-1">
                    <CardContent className="p-4 space-y-4">
                      {blocks.map(blockKey => {
                        const meta = BLOCK_LABELS[blockKey];
                        if (!meta) return null;
                        return (
                          <div key={blockKey} className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                            <span className="text-xs font-semibold text-muted-foreground">{meta.title}</span>
                            <BlockFields blockKey={blockKey} details={details} update={update} sceneIds={allSceneIds} />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
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

      {/* ── SECTION 5: Format & Output ── */}
      <Collapsible open={formatOpen} onOpenChange={setFormatOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Format & Output</span>
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
            </div>

            {/* Per-scene overrides */}
            {selectedScenes.length > 0 && (
              <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group w-full">
                  <ChevronRight className={cn('w-4 h-4 transition-transform', overridesOpen && 'rotate-90')} />
                  <span>Customize per scene</span>
                  <span className="text-xs text-muted-foreground/70">({selectedScenes.length} scene{selectedScenes.length !== 1 ? 's' : ''})</span>
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

            {/* Credit preview */}
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
          </div>
        </CollapsibleContent>
      </Collapsible>

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
