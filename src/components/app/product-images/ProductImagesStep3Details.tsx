import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Layers, Camera, User, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { getBlocksByScene } from './detailBlockConfig';
import { ALL_SCENES } from './sceneData';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import type { DetailSettings } from './types';
import type { ModelProfile } from '@/types';

interface Step4Props {
  selectedSceneIds: Set<string>;
  productCount: number;
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  userModels?: ModelProfile[];
  globalModels?: ModelProfile[];
}

function ChipSelector({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-medium">{label}</Label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? '' : o.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
              value === o.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SceneThumbnail({ sceneId }: { sceneId: string }) {
  const scene = ALL_SCENES.find(s => s.id === sceneId);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {scene?.previewUrl ? (
          <img src={scene.previewUrl} alt={scene.title} className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-3 h-3 text-muted-foreground/40" />
        )}
      </div>
      {hovered && (
        <div className="absolute z-50 left-0 top-full mt-1 w-[120px] h-[120px] rounded-lg bg-muted border border-border shadow-lg overflow-hidden">
          {scene?.previewUrl ? (
            <img src={scene.previewUrl} alt={scene?.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Context-aware focus area options */
function getFocusOptions(sceneIds: string[]): { value: string; label: string }[] {
  const hasBeauty = sceneIds.some(id => id.startsWith('makeup-') || id.startsWith('beauty-') || id.includes('lips') || id.includes('skin') || id.includes('face'));
  if (hasBeauty) {
    return [
      { value: 'product', label: 'Product Focus' },
      { value: 'texture-formula', label: 'Texture / Formula' },
      { value: 'label', label: 'Label / Branding' },
      { value: 'full-product', label: 'Full Product' },
    ];
  }
  return [
    { value: 'material', label: 'Material / Texture' },
    { value: 'label', label: 'Label / Logo' },
    { value: 'hardware', label: 'Hardware / Details' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'full-product', label: 'Full Product' },
  ];
}

function BlockFields({ blockKey, details, update, sceneIds }: { blockKey: string; details: DetailSettings; update: (p: Partial<DetailSettings>) => void; sceneIds: string[] }) {
  switch (blockKey) {
    case 'personDetails':
      return null;
    case 'actionDetails':
      return (
        <div className="grid grid-cols-2 gap-3">
          <ChipSelector label="Action Type" value={details.actionType} onChange={v => update({ actionType: v })} options={[
            { value: 'holding', label: 'Holding' }, { value: 'opening', label: 'Opening' }, { value: 'applying', label: 'Applying' }, { value: 'pouring', label: 'Pouring' }, { value: 'using', label: 'Using' }, { value: 'displaying', label: 'Displaying' },
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
            { value: 'white', label: 'Pure White' }, { value: 'light-gray', label: 'Light Gray' }, { value: 'warm-neutral', label: 'Warm Neutral' }, { value: 'cool-neutral', label: 'Cool Neutral' }, { value: 'gradient', label: 'Soft Gradient' },
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
            { value: 'clean', label: 'Clean & Modern' }, { value: 'warm', label: 'Warm & Inviting' }, { value: 'dramatic', label: 'Dramatic' }, { value: 'editorial', label: 'Editorial' }, { value: 'natural', label: 'Natural' },
          ]} />
          <ChipSelector label="Product Size" value={details.productProminence} onChange={v => update({ productProminence: v })} options={[
            { value: 'hero', label: 'Hero (fills frame)' }, { value: 'balanced', label: 'Balanced' }, { value: 'contextual', label: 'Contextual' },
          ]} />
          <ChipSelector label="Lighting" value={details.lightingStyle} onChange={v => update({ lightingStyle: v })} options={[
            { value: 'soft-diffused', label: 'Soft Diffused' }, { value: 'natural', label: 'Natural' }, { value: 'studio', label: 'Studio' }, { value: 'dramatic', label: 'Dramatic' }, { value: 'golden-hour', label: 'Golden Hour' },
          ]} />
        </div>
      );
    case 'sceneEnvironment':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ChipSelector label="Environment" value={details.environmentType} onChange={v => update({ environmentType: v })} options={[
            { value: 'bathroom', label: 'Bathroom' }, { value: 'kitchen', label: 'Kitchen' }, { value: 'living-room', label: 'Living Room' }, { value: 'desk', label: 'Desk / Workspace' }, { value: 'outdoor', label: 'Outdoor' }, { value: 'shelf', label: 'Shelf / Display' },
          ]} />
          <ChipSelector label="Surface" value={details.surfaceType} onChange={v => update({ surfaceType: v })} options={[
            { value: 'marble', label: 'Marble' }, { value: 'wood', label: 'Wood' }, { value: 'concrete', label: 'Concrete' }, { value: 'fabric', label: 'Fabric / Linen' }, { value: 'glass', label: 'Glass' },
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
        <div className="grid grid-cols-2 gap-3">
          <ChipSelector label="Packaging State" value={details.packagingState} onChange={v => update({ packagingState: v })} options={[
            { value: 'sealed', label: 'Sealed / Closed' }, { value: 'open', label: 'Open / Unboxing' }, { value: 'both', label: 'Product + Packaging' },
          ]} />
          <ChipSelector label="Reference Strength" value={details.referenceStrength} onChange={v => update({ referenceStrength: v })} options={[
            { value: 'loose', label: 'Loose' }, { value: 'balanced', label: 'Balanced' }, { value: 'strict', label: 'Strict' },
          ]} />
        </div>
      );
    case 'productSize':
      return (
        <ChipSelector label="Detected Size" value={details.productSize} onChange={v => update({ productSize: v })} options={[
          { value: 'auto', label: 'Auto' }, { value: 'very-small', label: 'Very Small' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' },
        ]} />
      );
    default:
      return null;
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

function ModelPickerSection({
  userModels,
  globalModels,
  selectedModelId,
  onSelectModel,
  details,
  update,
}: {
  userModels: ModelProfile[];
  globalModels: ModelProfile[];
  selectedModelId?: string;
  onSelectModel: (id: string | undefined) => void;
  details: DetailSettings;
  update: (p: Partial<DetailSettings>) => void;
}) {
  const allModels = [...userModels, ...globalModels];
  const hasModels = allModels.length > 0;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Person / Model</span>
      </div>

      {hasModels ? (
        <>
          <p className="text-xs text-muted-foreground">Select a model or customize manually below.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {userModels.map(m => (
              <ModelSelectorCard
                key={m.modelId}
                model={m}
                isSelected={selectedModelId === m.modelId}
                onSelect={() => onSelectModel(selectedModelId === m.modelId ? undefined : m.modelId)}
              />
            ))}
            {globalModels.map(m => (
              <ModelSelectorCard
                key={m.modelId}
                model={m}
                isSelected={selectedModelId === m.modelId}
                onSelect={() => onSelectModel(selectedModelId === m.modelId ? undefined : m.modelId)}
              />
            ))}
          </div>
          {userModels.length > 0 && globalModels.length > 0 && (
            <p className="text-[10px] text-muted-foreground">Your brand models appear first.</p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">No models available. Customize person details below.</p>
      )}

      {!selectedModelId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
          <ChipSelector label="Presentation" value={details.presentation} onChange={v => update({ presentation: v })} options={[
            { value: 'hand-only', label: 'Hand Only' }, { value: 'half-body', label: 'Half Body' }, { value: 'portrait', label: 'Portrait' }, { value: 'full-body', label: 'Full Body' },
          ]} />
          <ChipSelector label="Age Range" value={details.ageRange} onChange={v => update({ ageRange: v })} options={[
            { value: '20s', label: '20s' }, { value: '30s', label: '30s' }, { value: '40s', label: '40s' }, { value: '50+', label: '50+' },
          ]} />
          <ChipSelector label="Skin Tone" value={details.skinTone} onChange={v => update({ skinTone: v })} options={[
            { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'tan', label: 'Tan' }, { value: 'dark', label: 'Dark' },
          ]} />
          <ChipSelector label="Nails" value={details.nails} onChange={v => update({ nails: v })} options={[
            { value: 'natural', label: 'Natural' }, { value: 'manicured', label: 'Manicured' }, { value: 'polished', label: 'Polished' },
          ]} />
        </div>
      )}
    </div>
  );
}

export function ProductImagesStep3Details({ selectedSceneIds, productCount, details, onDetailsChange, userModels = [], globalModels = [] }: Step4Props) {
  const sceneGroups = getBlocksByScene(selectedSceneIds, ALL_SCENES);
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });
  const allSceneIds = Array.from(selectedSceneIds);
  const [openBlocks, setOpenBlocks] = useState<Set<string>>(new Set());

  const hasSceneBlocks = sceneGroups.length > 0;
  const hasPersonBlock = sceneGroups.some(g => g.blocks.includes('personDetails'));

  // Count how many detail fields have been customized (exclude format/generation keys)
  const IGNORE_KEYS = new Set(['aspectRatio', 'quality', 'imageCount']);
  const customizedCount = Object.entries(details).filter(([k, v]) => v && v !== '' && !IGNORE_KEYS.has(k)).length;

  const handleReset = () => {
    const reset: DetailSettings = { aspectRatio: details.aspectRatio, quality: details.quality, imageCount: details.imageCount };
    onDetailsChange(reset);
  };

  const toggleBlock = (id: string) => {
    const next = new Set(openBlocks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setOpenBlocks(next);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Refine your scenes</h2>
          <p className="text-sm text-muted-foreground mt-1">Optional tweaks based on your selected scenes. We'll use smart defaults for anything you skip.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {customizedCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">{customizedCount} customized</Badge>
          )}
          {customizedCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={handleReset}>
              <RotateCcw className="w-3 h-3" />Reset All
            </Button>
          )}
        </div>
      </div>

      {hasSceneBlocks ? (
        <div className="space-y-3">
          {hasPersonBlock && (
            <Card className="border-border">
              <CardContent className="p-4">
                <ModelPickerSection
                  userModels={userModels}
                  globalModels={globalModels}
                  selectedModelId={details.selectedModelId}
                  onSelectModel={id => update({ selectedModelId: id })}
                  details={details}
                  update={update}
                />
              </CardContent>
            </Card>
          )}

          {sceneGroups.map(group => {
            const blocks = group.blocks.filter(b => b !== 'personDetails');
            if (blocks.length === 0) return null;
            const blockId = group.sceneId;
            const isOpen = openBlocks.has(blockId);
            const groupCustomized = blocks.some(bk => {
              const fields = BLOCK_FIELD_MAP_LOCAL[bk] || [];
              return fields.some(f => details[f] && details[f] !== '');
            });

            return (
              <Collapsible key={group.sceneId} open={isOpen} onOpenChange={() => toggleBlock(blockId)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 min-w-0">
                      <SceneThumbnail sceneId={group.sceneId} />
                      <span className="text-sm font-semibold truncate">"{group.sceneTitle}" options</span>
                      {group.alsoUsedBy.length > 0 && (
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">+{group.alsoUsedBy.length} more</span>
                      )}
                      {groupCustomized && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">customized</Badge>
                      )}
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
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No scene-specific options for your selected scenes. You can skip this step.</p>
          </CardContent>
        </Card>
      )}

      {productCount > 1 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <span className="text-sm font-semibold">Consistency across products</span>
            <ChipSelector label="" value={details.consistency} onChange={v => update({ consistency: v })} options={[
              { value: 'standard', label: 'Standard' }, { value: 'high', label: 'High' }, { value: 'strict', label: 'Strict' },
            ]} />
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

// Local block-to-field map for checking customization status
const BLOCK_FIELD_MAP_LOCAL: Record<string, (keyof DetailSettings)[]> = {
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
