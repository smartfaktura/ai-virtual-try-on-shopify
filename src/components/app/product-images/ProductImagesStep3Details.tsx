import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { getTriggeredBlocks, DETAIL_BLOCKS } from './detailBlockConfig';
import { ALL_SCENES } from './sceneData';
import type { DetailSettings } from './types';

interface Step3Props {
  selectedSceneIds: Set<string>;
  productCount: number;
  details: DetailSettings;
  onDetailsChange: (d: DetailSettings) => void;
  onContinue: () => void;
  onBack: () => void;
}

function DetailBlock({ title, description, children, defaultOpen = false }: { title: string; description: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardContent className="flex items-center justify-between p-4 cursor-pointer">
            <div className="text-left">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-4 border-t border-border/50">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Auto" /></SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProductImagesStep3Details({ selectedSceneIds, productCount, details, onDetailsChange, onContinue, onBack }: Step3Props) {
  const triggered = getTriggeredBlocks(selectedSceneIds, ALL_SCENES, productCount);
  const update = (partial: Partial<DetailSettings>) => onDetailsChange({ ...details, ...partial });

  const has = (key: string) => triggered.includes(key);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Add important details</h2>
        <p className="text-sm text-muted-foreground mt-1">Only showing settings relevant to your selected scenes. All fields are optional.</p>
      </div>

      <div className="space-y-3">
        {has('background') && (
          <DetailBlock title="Background & Composition" description="Control background tone, shadows, and framing.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Background Tone" value={details.backgroundTone} onChange={v => update({ backgroundTone: v })} options={[
                { value: 'white', label: 'Pure White' }, { value: 'light-gray', label: 'Light Gray' }, { value: 'warm-neutral', label: 'Warm Neutral' }, { value: 'cool-neutral', label: 'Cool Neutral' }, { value: 'gradient', label: 'Soft Gradient' },
              ]} />
              <SelectField label="Shadow Style" value={details.shadowStyle} onChange={v => update({ shadowStyle: v })} options={[
                { value: 'none', label: 'No Shadow' }, { value: 'soft', label: 'Soft Drop' }, { value: 'natural', label: 'Natural' }, { value: 'dramatic', label: 'Dramatic' },
              ]} />
              <SelectField label="Negative Space" value={details.negativeSpace} onChange={v => update({ negativeSpace: v })} options={[
                { value: 'tight', label: 'Tight Crop' }, { value: 'balanced', label: 'Balanced' }, { value: 'generous', label: 'Generous' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('visualDirection') && (
          <DetailBlock title="Visual Direction" description="Set mood, intensity, and lighting.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Mood" value={details.mood} onChange={v => update({ mood: v })} options={[
                { value: 'clean', label: 'Clean & Modern' }, { value: 'warm', label: 'Warm & Inviting' }, { value: 'dramatic', label: 'Dramatic' }, { value: 'editorial', label: 'Editorial' }, { value: 'natural', label: 'Natural' },
              ]} />
              <SelectField label="Product Prominence" value={details.productProminence} onChange={v => update({ productProminence: v })} options={[
                { value: 'hero', label: 'Hero (product fills frame)' }, { value: 'balanced', label: 'Balanced' }, { value: 'contextual', label: 'Contextual (scene-heavy)' },
              ]} />
              <SelectField label="Lighting Style" value={details.lightingStyle} onChange={v => update({ lightingStyle: v })} options={[
                { value: 'soft-diffused', label: 'Soft Diffused' }, { value: 'natural', label: 'Natural Light' }, { value: 'studio', label: 'Studio' }, { value: 'dramatic', label: 'Dramatic / Moody' }, { value: 'golden-hour', label: 'Golden Hour' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('sceneEnvironment') && (
          <DetailBlock title="Scene Environment" description="Define the setting and styling.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Environment" value={details.environmentType} onChange={v => update({ environmentType: v })} options={[
                { value: 'bathroom', label: 'Bathroom' }, { value: 'kitchen', label: 'Kitchen' }, { value: 'living-room', label: 'Living Room' }, { value: 'desk', label: 'Desk / Workspace' }, { value: 'outdoor', label: 'Outdoor' }, { value: 'shelf', label: 'Shelf / Display' },
              ]} />
              <SelectField label="Surface" value={details.surfaceType} onChange={v => update({ surfaceType: v })} options={[
                { value: 'marble', label: 'Marble' }, { value: 'wood', label: 'Wood' }, { value: 'concrete', label: 'Concrete' }, { value: 'fabric', label: 'Fabric / Linen' }, { value: 'glass', label: 'Glass' },
              ]} />
              <SelectField label="Styling Density" value={details.stylingDensity} onChange={v => update({ stylingDensity: v })} options={[
                { value: 'minimal', label: 'Minimal' }, { value: 'moderate', label: 'Moderate' }, { value: 'styled', label: 'Fully Styled' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('personDetails') && (
          <DetailBlock title="Visible Person Details" description="Configure how people appear in the scene.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Presentation" value={details.presentation} onChange={v => update({ presentation: v })} options={[
                { value: 'hand-only', label: 'Hand Only' }, { value: 'half-body', label: 'Half Body' }, { value: 'portrait', label: 'Portrait' }, { value: 'full-body', label: 'Full Body' },
              ]} />
              <SelectField label="Age Range" value={details.ageRange} onChange={v => update({ ageRange: v })} options={[
                { value: '20s', label: '20s' }, { value: '30s', label: '30s' }, { value: '40s', label: '40s' }, { value: '50+', label: '50+' },
              ]} />
              <SelectField label="Skin Tone" value={details.skinTone} onChange={v => update({ skinTone: v })} options={[
                { value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'tan', label: 'Tan' }, { value: 'dark', label: 'Dark' },
              ]} />
              <SelectField label="Nails" value={details.nails} onChange={v => update({ nails: v })} options={[
                { value: 'natural', label: 'Natural' }, { value: 'manicured', label: 'Manicured' }, { value: 'polished', label: 'Polished / Painted' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('actionDetails') && (
          <DetailBlock title="Action Details" description="Define the action type for product-in-use shots.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Action Type" value={details.actionType} onChange={v => update({ actionType: v })} options={[
                { value: 'holding', label: 'Holding' }, { value: 'opening', label: 'Opening' }, { value: 'applying', label: 'Applying' }, { value: 'pouring', label: 'Pouring' }, { value: 'using', label: 'Using' }, { value: 'displaying', label: 'Displaying' },
              ]} />
              <SelectField label="Action Intensity" value={details.actionIntensity} onChange={v => update({ actionIntensity: v })} options={[
                { value: 'static', label: 'Static Support' }, { value: 'subtle', label: 'Subtle Action' }, { value: 'clear', label: 'Clear Action Moment' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('detailFocus') && (
          <DetailBlock title="Detail Focus" description="Set close-up focus and crop.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Focus Area" value={details.focusArea} onChange={v => update({ focusArea: v })} options={[
                { value: 'material', label: 'Material / Texture' }, { value: 'label', label: 'Label / Logo' }, { value: 'hardware', label: 'Hardware / Details' }, { value: 'packaging', label: 'Packaging' }, { value: 'full-product', label: 'Full Product' },
              ]} />
              <SelectField label="Crop Intensity" value={details.cropIntensity} onChange={v => update({ cropIntensity: v })} options={[
                { value: 'slight', label: 'Slight Close-Up' }, { value: 'medium', label: 'Medium Close-Up' }, { value: 'extreme', label: 'Extreme Macro' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('angleSelection') && (
          <DetailBlock title="Angle Selection" description="Request multiple angle views.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Number of Views" value={details.numberOfViews} onChange={v => update({ numberOfViews: v })} options={[
                { value: '2', label: '2 angles' }, { value: '3', label: '3 angles' }, { value: '4', label: '4 angles' }, { value: '6', label: '6 angles' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('packagingDetails') && (
          <DetailBlock title="Packaging Details" description="Configure packaging presentation.">
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Packaging State" value={details.packagingState} onChange={v => update({ packagingState: v })} options={[
                { value: 'sealed', label: 'Sealed / Closed' }, { value: 'open', label: 'Open / Unboxing' }, { value: 'both', label: 'Product + Packaging' },
              ]} />
              <SelectField label="Reference Strength" value={details.referenceStrength} onChange={v => update({ referenceStrength: v })} options={[
                { value: 'loose', label: 'Loose' }, { value: 'balanced', label: 'Balanced' }, { value: 'strict', label: 'Strict' },
              ]} />
            </div>
          </DetailBlock>
        )}

        {has('productSize') && (
          <DetailBlock title="Product Size" description="Confirm product scale for realistic compositions.">
            <SelectField label="Detected Size" value={details.productSize} onChange={v => update({ productSize: v })} options={[
              { value: 'auto', label: 'Auto-detect' }, { value: 'very-small', label: 'Very Small' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' },
            ]} />
          </DetailBlock>
        )}

        {has('branding') && (
          <DetailBlock title="Branding Visibility" description="How prominently branding should appear." defaultOpen>
            <SelectField label="Visibility" value={details.brandingVisibility} onChange={v => update({ brandingVisibility: v })} options={[
              { value: 'subtle', label: 'Subtle' }, { value: 'balanced', label: 'Balanced' }, { value: 'prominent', label: 'Prominent' },
            ]} />
          </DetailBlock>
        )}

        {has('layout') && (
          <DetailBlock title="Layout Space" description="Balance between product and surrounding space.">
            <SelectField label="Layout" value={details.layoutSpace} onChange={v => update({ layoutSpace: v })} options={[
              { value: 'product-focused', label: 'Product-focused' }, { value: 'balanced', label: 'Balanced' }, { value: 'extra-space', label: 'Extra space for text' },
            ]} />
          </DetailBlock>
        )}

        {has('consistency') && (
          <DetailBlock title="Consistency" description="Match style across multiple products.">
            <SelectField label="Level" value={details.consistency} onChange={v => update({ consistency: v })} options={[
              { value: 'standard', label: 'Standard' }, { value: 'high', label: 'High' }, { value: 'strict', label: 'Strict' },
            ]} />
          </DetailBlock>
        )}

        {/* Custom note — always shown */}
        <DetailBlock title="Custom Note" description="Anything important to keep in mind?" defaultOpen={false}>
          <Textarea
            placeholder="Special instructions, unusual product details, styling preferences..."
            value={details.customNote || ''}
            onChange={e => update({ customNote: e.target.value })}
            className="text-xs min-h-[80px]"
          />
        </DetailBlock>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={onContinue}>Continue to review</Button>
      </div>
    </div>
  );
}
